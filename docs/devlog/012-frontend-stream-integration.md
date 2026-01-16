# DevLog 012: The Synapse (Frontend Integration)

## Context

The Backend Orchestrator was ready. We needed to build the Frontend "Nervous System" to handle the high-velocity stream of data from the AI.

## Objectives

1.  **Service Layer:** Build a hybrid API client (Axios for CRUD, Native Fetch for Streaming).
2.  **State Management:** Implement a `ChatContext` with a Reducer to handle rapid state mutations during token reception.
3.  **Verification:** Prove the pipeline works without building the full UI first.

## Implementation Details

- **Hybrid Client:**
  - `axios` configured with `baseURL` for standard operations.
  - `fetch` + `ReadableStream` used for `streamMessage` to bypass Axios buffering and handle SSE-like behavior.
- **ChatContext:**
  - Implemented optimistic UI updates (User message appears instantly).
  - Used a "Placeholder" strategy for the incoming AI message to allow appending tokens in real-time.
- **Smoke Test:** Built `TestChat.tsx` to visualize the raw state and stream.

## Roadblocks & Resolutions

- **The 404 Target Error:** The `fetch` call was hitting the frontend port (`5173`) instead of the backend (`3000`).
- **Fix:** Explicitly defined the absolute URL `http://localhost:3000/api/chat/...` in the streaming service.

## Status

- [x] Stream logic verified (Fluid text generation).
- [x] Context state transitions verified.
- [x] Database correctly stores the Conversation History.
