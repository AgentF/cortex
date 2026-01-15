# DevLog 002: Data Strategy & MVP Definition

## Context

Defining the scope for Phase 2 ("The Vault"). I need to decide how to store rich text content and what constitutes the Minimum Viable Product.

## Decisions

### 1. Serialization Strategy

- **Choice:** Markdown-over-the-wire.
- **Logic:**
  - The Frontend (Tiptap) will serialize its internal JSON state to a **Markdown String** before sending to the backend.
  - The Backend stores raw Markdown.
  - **Benefit:** This decouples the data from the editor library. If we switch from Tiptap to another editor later, our database remains valid. It also makes "Chat with your Notes" (Phase 3) significantly easier as LLMs speak Markdown natively.

### 2. MVP Scope (The Vault)

To avoid scope creep, the MVP is defined strictly as:

1.  **CRUD:** Create, Read, Update, Delete documents.
2.  **Single User:** No authentication (yet). Localhost trust.
3.  **Persistence:** Data survives container restarts (Postgres).
4.  **Interface:** Minimalist editor.

## Next Steps

- Implement `Document` entity in NestJS.
- Build CRUD API.
- Configure Tiptap with Markdown extension.
