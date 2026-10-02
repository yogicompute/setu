import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import {
	type JobContext,
	WorkerOptions,
	cli,
	defineAgent,
	voice,
	waitForParticipant,
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import * as silero from "@livekit/agents-plugin-silero";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local" });

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const AGENT_API_SECRET = process.env.AGENT_API_SECRET ?? "";
const AGENT_NAME = "meeting-agent";

interface DispatchMetadata {
	meetingId: string;
	agentId: string;
	agentName: string;
	instructions: string;
}

// Shape consumed by the app's getTranscript + Inngest summarizer.
interface TranscriptItem {
	speaker_id: string;
	type: string;
	text: string;
	start_ts: number;
	stop_ts: number;
}

async function notifyApp(
	action: "started" | "ended",
	meetingId: string,
	transcript?: TranscriptItem[]
) {
	try {
		await fetch(`${APP_URL}/api/agent`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${AGENT_API_SECRET}`,
			},
			body: JSON.stringify({ action, meetingId, transcript }),
		});
	} catch (err) {
		console.error(`[agent] failed to notify app (${action})`, err);
	}
}

export default defineAgent({
	// Load the (open-source, local) VAD model once per worker process.
	prewarm: async (proc) => {
		proc.userData.vad = await silero.VAD.load();
	},

	entry: async (ctx: JobContext) => {
		const metadata = JSON.parse(
			ctx.job.metadata || "{}"
		) as Partial<DispatchMetadata>;
		const meetingId = metadata.meetingId;
		const agentId = metadata.agentId ?? "agent";
		const instructions =
			metadata.instructions ?? "You are a helpful meeting assistant.";

		if (!meetingId) {
			console.error("[agent] missing meetingId in dispatch metadata");
			return;
		}

		await ctx.connect();
		await notifyApp("started", meetingId);

		// The human participant's identity is the app user's id (set as the
		// token identity), which we use as the transcript speaker_id.
		const participant = await waitForParticipant({ room: ctx.room });
		const userId = participant.identity;

		const transcript: TranscriptItem[] = [];

		const session = new voice.AgentSession({
			vad: ctx.proc.userData.vad as silero.VAD,
			// Free STT via Groq-hosted Whisper.
			stt: openai.STT.withGroq({ model: "whisper-large-v3-turbo" }),
			// Free + low-latency LLM via Groq's OpenAI-compatible API.
			// gpt-oss returns reasoning on a separate channel (clean content, no
			// <think> leakage). reasoningEffort "low" + a token cap keep us well
			// under Groq's free-tier 1000 output-tokens-per-minute limit.
			llm: new openai.LLM({
				model: "openai/gpt-oss-20b",
				baseURL: "https://api.groq.com/openai/v1",
				apiKey: process.env.GROQ_API_KEY,
				reasoningEffort: "low",
				maxCompletionTokens: 250,
			}),
			// Free-tier TTS: Cartesia.
			tts: new cartesia.TTS({ model: "sonic-2" }),
		});

		session.on(
			voice.AgentSessionEventTypes.ConversationItemAdded,
			(ev) => {
				const item = ev.item;
				// Skip agent handoff items; only keep chat messages.
				if (!("role" in item)) return;
				const text = item.textContent?.trim();
				if (!text) return;

				const ts = item.createdAt ?? Date.now();
				transcript.push({
					speaker_id: item.role === "assistant" ? agentId : userId,
					type: "speech",
					text,
					start_ts: ts,
					stop_ts: ts,
				});
			}
		);

		// Surface any pipeline error (STT/LLM/TTS) loudly in the worker logs.
		session.on(voice.AgentSessionEventTypes.Error, (ev) => {
			console.error("[agent] session error:", ev);
		});

		// On room teardown: persist transcript and kick off summarization.
		ctx.addShutdownCallback(async () => {
			await notifyApp("ended", meetingId, transcript);
		});

		const agent = new voice.Agent({
			instructions: `${instructions}\n\nThis is a spoken voice conversation: keep replies brief and conversational — usually 1-3 short sentences. Do not use markdown, lists, or emojis.`,
		});

		await session.start({ agent, room: ctx.room });
		console.log("[agent] session started, room:", ctx.room.name);

		// Greet the user so the agent speaks first. `say()` exercises TTS
		// directly (no LLM), so a failure here isolates Cartesia.
		try {
			const handle = session.say(
				"Hi! I'm your meeting assistant. How can I help you today?"
			);
			await handle.waitForPlayout();
			console.log("[agent] greeting played");
		} catch (err) {
			console.error("[agent] greeting (TTS) failed:", err);
		}
	},
});

cli.runApp(
	new WorkerOptions({
		agent: fileURLToPath(import.meta.url),
		agentName: AGENT_NAME,
	})
);
