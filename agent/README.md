# Setu Agent Worker

The live, in-call AI voice agent. A standalone **LiveKit Agents** (Node) process —
it must run as a long-lived process, so it lives outside the Next.js app.

## Pipeline (near-$0, free tiers)

- **VAD / turn detection:** Silero (local, open-source)
- **STT:** Groq-hosted Whisper (`whisper-large-v3-turbo`) — free
- **LLM:** Gemini (`gemini-2.0-flash`) via the Google plugin — free tier
- **TTS:** Cartesia (`sonic-2`) — free tier

## How it fits in

1. The browser joins a LiveKit room. The join token (minted in
   `meetings.generateToken`) carries a `roomConfig` that **auto-dispatches**
   this worker into the room — no webhook needed.
2. On join, the worker POSTs `{action:"started"}` to the app's `/api/agent`
   route → meeting goes `active`.
3. It runs the STT→LLM→TTS loop, collecting a transcript in memory.
4. On room teardown it POSTs `{action:"ended", transcript}` → the app saves the
   transcript to the DB, marks the meeting `processing`, and triggers the
   Inngest summarizer.

## Setup

```bash
cd agent
cp .env.example .env    # fill in the keys
npm install
npm run download-files  # one-time: fetch the Silero VAD model
npm run dev             # starts the worker (watches for dispatched jobs)
```

Keep this running alongside `npm run dev` in the project root.
`AGENT_API_SECRET` here must match the one in the app's `.env`.
