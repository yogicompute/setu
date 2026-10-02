import "server-only";
import { RoomServiceClient, AgentDispatchClient } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;
// Server SDK needs the https URL, not the wss one the browser uses.
const host = (process.env.LIVEKIT_URL ?? "").replace("wss://", "https://");

export const roomService = new RoomServiceClient(host, apiKey, apiSecret);
export const agentDispatch = new AgentDispatchClient(host, apiKey, apiSecret);

export const livekitConfig = { apiKey, apiSecret, host } as const;

// Name the agent worker registers under; used for explicit dispatch into a room.
export const AGENT_NAME = "meeting-agent";
