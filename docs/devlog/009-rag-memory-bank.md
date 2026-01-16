# DevLog 009: The Memory Bank

## Context

We have initiated Phase 4: "Synthesis." The objective is to integrate `gemma3:4b` (The Oracle) into CORTEX. However, Large Language Models are inherently stateless. They exist in a perpetual "now," oblivious to previous interactions. To create a cohesive assistant, we must externalize memory.

## Objectives

1.  **Temporal Persistence:** Create a database structure to store conversational history (Threads and Messages).
2.  **Strict Typing:** Enforce `User` vs `Assistant` roles to prevent hallucinated causality.
3.  **Access Layer:** Build a CRUD API to manage sessions before we connect the AI stream.

## Implementation Details

- **Entities:**
  - `ChatSession`: The container (UUID, Title, Timestamps).
  - `ChatMessage`: The atom (Role, Content, SessionFK).
- **Ordering:** Enforced `createdAt: ASC` at the Service level to ensure the LLM reads history linearly.
- **Validation:** Integrated `class-validator` globally to secure input vectors.
- **Context management** (PATCH/DELETE messages) to allow for error correction and pruning.

## Roadblocks & Resolutions

**The Barrel File Fracture:**
We encountered a critical runtime failure: `TypeError: Cannot read properties of undefined (reading 'USER')`.

- _Cause:_ The `apps/api` runtime was resolving `@cortex/shared` to a stale `index.js` artifact instead of the source `index.ts`, or failing to traverse the workspace path correctly.
- _Attempt 1:_ Purged `dist` and source-folder build artifacts. (Partial success, but fragile).
- _Final Resolution:_ **Tactical Bypass.** We defined the `ChatRole` Enum locally within the Entity file.
- _Rationale:_ It is illogical to stall the construction of the Logic Engine to debug Monorepo plumbing. We prioritize function over configuration. We will refactor the Shared Library in Phase 6.

## Status

- [x] Database Schema Active.
- [x] `POST /chat/sessions` verified (Postman).
- [x] `POST /chat/sessions/:id/messages` verified (Postman).
- [x] `GET /chat/sessions/:id` verified (Postman).
