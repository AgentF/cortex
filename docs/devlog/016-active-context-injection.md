# Devlog 016: Active Context Injection (Short-Term Memory)

## Context

The RAG system (Phase 3) provided excellent Long-Term Memory via Vector Search. However, the system was "blind" to the user's immediate workspace. If the user asked about the file currently open in the editor, the AI failed unless the file had been saved and indexed previously. We needed a "Short-Term Memory" bridge.

## Objectives

1.  Allow the AI to read the current Editor content without requiring a database save.
2.  Prioritize this "Visual Context" over RAG results.
3.  Maintain a strict separation between "Persistence" (DB) and "Signal" (API Payload).

## Solution: The Transient Bridge

We implemented a direct data pipeline from the Frontend Editor to the Backend LLM.

1.  **Frontend Bridge (`App.tsx`):**

    - Utilized a `useRef` to hold the editor's text content.
    - Passed a `getEditorContext()` function to the Chat Interface.

2.  **Protocol (`SendMessageDto`):**

    - Expanded the API payload to include `activeContext?: string`.
    - This data is ephemeral; it is not saved to the `chat_messages` table.

3.  **Prompt Engineering (`ChatService`):**
    - The System Prompt now accepts two distinct inputs:
      - `Visual Context`: The user's active file.
      - `Knowledge Base`: The retrieved RAG chunks.
    - Instructions explicitly favor Visual Context for immediate queries.

## Challenges

- **Interface Mismatch:** The Frontend sent `prompt` while the Backend expected `content`. Resolved by enforcing strict DTO alignment.
- **Context Window:** We are sending raw text. For massive documents, this might hit the 8k context limit of `gemma3:4b`. Future optimization: "Context Pruning" or "Summarization" middleware.

## Outcome

The AI effectively answers questions about unsaved work. The "Write, Ask, Refine" loop is now seamless.
