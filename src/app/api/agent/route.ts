import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";

// Called by the LiveKit agent worker (not the browser). Authenticated with a
// shared secret so only our worker can mutate meeting state.
export async function POST(req: NextRequest) {
	const auth = req.headers.get("authorization");
	const expected = `Bearer ${process.env.AGENT_API_SECRET}`;

	if (!process.env.AGENT_API_SECRET || auth !== expected) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await req.json().catch(() => null)) as {
		action?: "started" | "ended";
		meetingId?: string;
		transcript?: unknown[];
	} | null;

	if (!body?.action || !body.meetingId) {
		return NextResponse.json(
			{ error: "Missing action or meetingId" },
			{ status: 400 }
		);
	}

	const { action, meetingId, transcript } = body;

	if (action === "started") {
		await db
			.update(meetings)
			.set({ status: "active", startedAt: new Date() })
			.where(
				and(
					eq(meetings.id, meetingId),
					eq(meetings.status, "upcoming")
				)
			);

		return NextResponse.json({ status: "ok" });
	}

	if (action === "ended") {
		const [updated] = await db
			.update(meetings)
			.set({
				status: "processing",
				endedAt: new Date(),
				transcript: JSON.stringify(transcript ?? []),
			})
			.where(
				and(eq(meetings.id, meetingId), eq(meetings.status, "active"))
			)
			.returning();

		// Only summarize if this call actually transitioned an active meeting.
		if (updated) {
			await inngest.send({
				name: "meeting/processing",
				data: { meetingId: updated.id },
			});
		}

		return NextResponse.json({ status: "ok" });
	}

	return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
