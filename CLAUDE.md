# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack starter kit for building real-time voice and vision AI agents using Google's Gemini Live API and LiveKit. The agent processes audio/video from the user's browser and responds with synthesized speech.

## Repository Structure

- `agent/` — Python backend using the LiveKit Agents framework
- `frontend/` — Next.js 15 frontend with LiveKit React components
- `docs/` — Architecture, customization, deployment, and troubleshooting guides

## Commands

### Agent (Python)

```bash
cd agent
uv sync                   # Install dependencies
uv run agent.py dev       # Run in development mode
```

Requires a `.env.local` file (copy from `.env.example`) with `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, and `GOOGLE_API_KEY`.

### Frontend (Node.js)

```bash
cd frontend
pnpm install              # Install dependencies
pnpm dev                  # Start dev server at localhost:3000
pnpm build                # Production build
pnpm lint                 # ESLint
pnpm format               # Prettier format
pnpm format:check         # Check formatting without writing
pnpm shadcn:install       # Update shadcn/ui and Agents UI components
```

Requires a `.env.local` file (copy from `.env.example`) with `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `LIVEKIT_URL`. Optionally `AGENT_NAME` for explicit agent dispatch.

## Architecture

**Data flow:**
1. Browser (Next.js) connects via WebRTC to a LiveKit server room
2. Frontend calls `POST /api/connection-details` to generate a short-lived JWT room token
3. The Python agent joins the same room, subscribes to user audio/video tracks
4. Audio is streamed natively to Gemini's Realtime API; video frames are passed via the `images` plugin
5. Gemini's synthesized speech response is published back as an audio track in the room

**Key agent files:**
- `agent/agent.py` — Single-file agent implementation. `VisionAgent` extends `Agent` with video awareness instructions. The `@server.rtc_session()` entrypoint manages track subscriptions and starts `AgentSession` with `google.realtime.RealtimeModel`.

**Key frontend files:**
- `frontend/app-config.ts` — `AppConfig` interface and defaults; controls branding, feature flags (`supportsChatInput`, `supportsVideoInput`, `supportsScreenShare`), and agent dispatch (`agentName`).
- `frontend/app/api/connection-details/route.ts` — Creates LiveKit access tokens; optionally embeds `agentName` into the room's `RoomConfiguration` for explicit agent dispatch.
- `frontend/components/app/` — Core application components: `app.tsx` (session provider), `view-controller.tsx` (welcome vs. session routing), `session-view.tsx` (active session UI).

## Customization

The primary customization points are:

1. **Agent persona** — Edit `PERSONA_INSTRUCTIONS` in `agent/agent.py`
2. **UI branding/features** — Modify `APP_CONFIG_DEFAULTS` in `frontend/app-config.ts`
3. **Gemini model/voice** — Change `model` and `voice` params in the `RealtimeModel` constructor in `agent/agent.py`

See `docs/CUSTOMIZATION.md` for examples including function calling, video frame rate tuning, and multiple persona patterns.
