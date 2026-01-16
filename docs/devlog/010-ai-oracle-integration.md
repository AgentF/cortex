# DevLog 010: The Oracle Integration

## Context

With the Memory Bank (Database) established, we required a connection to the Intelligence Layer (`gemma3:4b`). We faced the challenge of connecting a WSL2-hosted API to a Windows-hosted Ollama instance.

## Objectives

1.  **Service Layer:** Upgrade `AiService` to handle both Embedding (Phase 3) and Text Generation (Phase 4).
2.  **Streaming Capability:** Implement a Generator function (`streamChat`) to handle token-by-token responses.
3.  **Connectivity:** Verify the network bridge between WSL2 and Windows Host.

## Implementation Details

- **Unified AiService:**
  - `EMBEDDING_MODEL`: `nomic-embed-text`
  - `CHAT_MODEL`: `gemma3:4b`
  - `streamChat()`: Uses `ollama.chat({ stream: true })` and yields tokens.
  - `generate()`: One-shot inference for internal logic/testing.
- **Networking:** Verified via `curl` that WSL can talk to `localhost:11434`.

## Validation

- Implemented a temporary `GET /test-ai` endpoint.
- Successfully received a generated definition of "Mentat" from the local LLM.

## Status

- [x] Ollama Library installed.
- [x] AiService logic complete.
- [x] Connection verified.

**Next Step:** Ticket 4.3 - The Orchestrator (Wiring Memory, Search, and AI into a single workflow).
