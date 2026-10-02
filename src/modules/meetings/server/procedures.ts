import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import {
	createTRPCRouter,
	premiumProcedure,
	protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";
import {
	and,
	count,
	desc,
	eq,
	getTableColumns,
	ilike,
	inArray,
	sql,
} from "drizzle-orm";
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";
import { MeetingStatus, StreamTranscriptItem } from "../types";
import {
	AccessToken,
	RoomConfiguration,
	RoomAgentDispatch,
} from "livekit-server-sdk";
import { AGENT_NAME } from "@/lib/livekit";
import { generateAvatarUri } from "@/lib/avatar";

export const meetingsRouter = createTRPCRouter({
	getTranscript: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const [existingMeeting] = await db
				.select()
				.from(meetings)
				.where(
					and(
						eq(meetings.id, input.id),
						eq(meetings.userId, ctx.auth.user.id)
					)
				);

			if (!existingMeeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

			if (!existingMeeting.transcript) {
				return [];
			}

			let transcript: StreamTranscriptItem[] = [];
			try {
				transcript = JSON.parse(
					existingMeeting.transcript
				) as StreamTranscriptItem[];
			} catch {
				transcript = [];
			}

			const speakerIds = [
				...new Set(transcript.map((item) => item.speaker_id)),
			];

			const userSpeakers = await db
				.select()
				.from(user)
				.where(inArray(user.id, speakerIds))
				.then((users) =>
					users.map((user) => ({
						...user,
						image:
							user.image ??
							generateAvatarUri({
								seed: user.name,
								variant: "initials",
							}),
					}))
				);

			const agentSpeakers = await db
				.select()
				.from(agents)
				.where(inArray(agents.id, speakerIds))
				.then((agents) =>
					agents.map((agent) => ({
						...agent,
						image: generateAvatarUri({
							seed: agent.name,
							variant: "initials",
						}),
					}))
				);

			const speakers = [...userSpeakers, ...agentSpeakers];

			const transcriptWithSpeakers = transcript.map((item) => {
				const speaker = speakers.find(
					(speaker) => speaker.id === item.speaker_id
				);

				if (!speaker) {
					return {
						...item,
						user: {
							name: "Unknown",
							image: generateAvatarUri({
								seed: "Unknown",
								variant: "initials",
							}),
						},
					};
				}

				return {
					...item,
					user: {
						name: speaker.name,
						image: speaker.image,
					},
				};
			});

			return transcriptWithSpeakers;
		}),
	generateToken: protectedProcedure
		.input(z.object({ meetingId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [existingMeeting] = await db
				.select()
				.from(meetings)
				.where(
					and(
						eq(meetings.id, input.meetingId),
						eq(meetings.userId, ctx.auth.user.id)
					)
				);

			if (!existingMeeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

			const [existingAgent] = await db
				.select()
				.from(agents)
				.where(eq(agents.id, existingMeeting.agentId));

			if (!existingAgent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}

			const at = new AccessToken(
				process.env.LIVEKIT_API_KEY!,
				process.env.LIVEKIT_API_SECRET!,
				{
					identity: ctx.auth.user.id,
					name: ctx.auth.user.name,
					metadata: JSON.stringify({
						image:
							ctx.auth.user.image ??
							generateAvatarUri({
								seed: ctx.auth.user.name,
								variant: "initials",
							}),
					}),
					ttl: 60 * 60, // 1hr
				}
			);

			at.addGrant({
				roomJoin: true,
				room: input.meetingId,
				canPublish: true,
				canSubscribe: true,
			});

			// Auto-dispatch the AI agent worker into this room on creation,
			// passing everything the worker needs via dispatch metadata.
			at.roomConfig = new RoomConfiguration({
				agents: [
					new RoomAgentDispatch({
						agentName: AGENT_NAME,
						metadata: JSON.stringify({
							meetingId: existingMeeting.id,
							agentId: existingAgent.id,
							agentName: existingAgent.name,
							instructions: existingAgent.instructions,
						}),
					}),
				],
			});

			return await at.toJwt();
		}),
	create: premiumProcedure("meetings")
		.input(meetingsInsertSchema)
		.mutation(async ({ input, ctx }) => {
			const [createdMeeting] = await db
				.insert(meetings)
				.values({ ...input, userId: ctx.auth.user.id })
				.returning();

			// The LiveKit room is created lazily when the first participant
			// joins (room name === meetingId). The agent worker is dispatched
			// into it by the room_started webhook, so there is nothing to
			// pre-provision here.
			const [existingAgent] = await db
				.select()
				.from(agents)
				.where(eq(agents.id, createdMeeting.agentId));

			if (!existingAgent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}

			return createdMeeting;
		}),
	update: protectedProcedure
		.input(meetingsUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const [updatedMeeting] = await db
				.update(meetings)
				.set(input)
				.where(
					and(
						eq(meetings.id, input.id),
						eq(meetings.userId, ctx.auth.user.id)
					)
				)
				.returning();
			if (!updatedMeeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}
			return updatedMeeting;
		}),
	remove: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [removedMeeting] = await db
				.delete(meetings)
				.where(
					and(
						eq(meetings.id, input.id),
						eq(meetings.userId, ctx.auth.user.id)
					)
				)
				.returning();
			if (!removedMeeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}
			return removedMeeting;
		}),
	getOne: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const [existingMeeting] = await db
				.select({
					...getTableColumns(meetings),
					agent: agents,
					duration:
						sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
							"duration"
						),
				})
				.from(meetings)
				.innerJoin(agents, eq(meetings.agentId, agents.id))
				.where(
					and(
						eq(meetings.id, input.id),
						eq(meetings.userId, ctx.auth.user.id)
					)
				);
			if (!existingMeeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found!",
				});
			}
			return existingMeeting;
		}),
	getMany: protectedProcedure
		.input(
			z.object({
				page: z.number().default(DEFAULT_PAGE),
				pageSize: z
					.number()
					.min(MIN_PAGE_SIZE)
					.max(MAX_PAGE_SIZE)
					.default(DEFAULT_PAGE_SIZE),
				search: z.string().nullish(),
				agentId: z.string().nullish(),
				status: z
					.enum([
						MeetingStatus.Upcoming,
						MeetingStatus.Active,
						MeetingStatus.Completed,
						MeetingStatus.Processing,
						MeetingStatus.Cancelled,
					])
					.nullish(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { search, page, pageSize, status, agentId } = input;
			const data = await db
				.select({
					...getTableColumns(meetings),
					agent: agents,
					duration:
						sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
							"duration"
						),
				})
				.from(meetings)
				.innerJoin(agents, eq(meetings.agentId, agents.id))
				.where(
					and(
						eq(meetings.userId, ctx.auth.user.id),
						search
							? ilike(meetings.name, `%${search}%`)
							: undefined,
						status ? eq(meetings.status, status) : undefined,
						agentId ? eq(meetings.agentId, agentId) : undefined
					)
				)
				.orderBy(desc(meetings.createdAt), desc(meetings.id))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db
				.select({ count: count() })
				.from(meetings)
				.innerJoin(agents, eq(meetings.agentId, agents.id))
				.where(
					and(
						eq(meetings.userId, ctx.auth.user.id),
						search
							? ilike(meetings.name, `%${search}%`)
							: undefined,
						status ? eq(meetings.status, status) : undefined,
						agentId ? eq(meetings.agentId, agentId) : undefined
					)
				);

			const totalPages = Math.ceil(total.count / pageSize);

			return { items: data, total: total.count, totalPages };
		}),
});
