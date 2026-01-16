# DevLog 011: The Orchestrator

## Context

The "Memory" (Database) and the "Voice" (Ollama) were successfully built. The final piece of the backend puzzle was the "Orchestrator"—the logic that binds User Input, Vector Search, and AI Generation into a single workflow.

## Objectives

1.  **Integration:** Wire `ChatModule`, `DocumentsModule`, and `AiModule` together.
2.  **RAG Logic:** Implement the retrieval-augmented generation loop.
3.  **Streaming Transport:** Create a robust mechanism to deliver generated tokens to the client.

## Implementation Details

- **Service Layer:**
  - Updated `DocumentsService.search` to return `content` (Payload) alongside `title` (Metadata).
  - Implemented `ChatService.chatStream`:
    1.  Persist User Message.
    2.  Query Vector DB (Top 3 chunks).
    3.  Construct Prompt (System + Context + History).
    4.  Stream Response.
    5.  Persist AI Message.
- **Controller Layer:**
  - Rejected `EventSource` (GET) due to URL length constraints.
  - Implemented `POST /chat/sessions/:id/stream` using raw `Response` handling.
  - Used `res.write()` to pipe tokens immediately.

## Validation

- Verified via `curl`.
- System correctly handles "Empty Context" scenarios.
- Streaming is functional with `Transfer-Encoding: chunked`.
