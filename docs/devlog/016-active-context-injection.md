# Devlog 016: Active Context Injection (Short-Term Memory)

## Context

The RAG system (Phase 3) provided Long-Term Memory via Vector Search. However, the system was "blind" to the user's immediate workspace. The AI could not see unsaved changes or the specific document currently open, leading to a "context gap" where the user had to copy-paste text into the chat.

## Objectives

1.  **Visual Bridge:** Allow the AI to read the current Editor content without requiring a database save.
2.  **Cognitive Filter:** Implement a manual toggle (On/Off) to prevent token waste when context is irrelevant.
3.  **Signal Protocol:** Create a separate channel in the API for "Transient Context" vs "Persisted Chat History."

## Solution

We implemented a dynamic pipeline from the React Frontend to the NestJS Backend.

### 1. The Frontend Bridge (`App.tsx` & `ChatInterface`)

- **State Extraction:** Utilized `useRef` to capture the editor's live state without triggering re-renders.
- **User Control:** Added a visual toggle button above the chat input.
  - _Blue (Watching):_ Sends current document content.
  - _Gray (Offline):_ Sends only the prompt.
- **Visual Feedback:** A pill badge indicates exactly which document is being "watched."

### 2. The Protocol (`shared/dto`)

- Updated `SendMessageDto` to include `activeContext?: string`.
- This payload is processed by the AI but **excluded** from the permanent database record to save storage.

### 3. The Backend Injection (`ChatService`)

- The `streamMessage` function injects the `activeContext` into the System Prompt.
- Prompt logic: "USER IS LOOKING AT: [Context]... Prioritize this over general knowledge."

## Challenges

- **Interface Mismatch (400 Bad Request):**
  - _Issue:_ The Frontend sent `{ prompt: ... }` while the Backend Validator expected `{ content: ... }`.
  - _Resolution:_ Enforced strict DTO alignment across the stack.
- **Parameter Swapping:**
  - _Issue:_ `ChatContext` passed arguments in the wrong order `(activeContext, content)` vs `(content, activeContext)`, resulting in empty payloads.
  - _Resolution:_ Fixed the function signature in the React Context.

## Outcome

The system now possesses "Short-Term Memory." The user can toggle this sense on or off at will. The "Write, Ask, Refine" loop is fully operational.
