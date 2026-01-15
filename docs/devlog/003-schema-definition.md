# DevLog 003: Core Schema Definition

## Context
Ticket 2.1 "The Bedrock" required establishing the database structure for the "Vault" (Notes system).

## Architecture
I have implemented the `Document` entity using TypeORM and PostgreSQL.

### Key Decisions
1.  **Identity Strategy: UUID**
    -   *Decision:* Use `uuid` instead of auto-incrementing integers (`1, 2, 3`).
    -   *Reason:* Supports future distributed synchronization (offline-first) without ID collision risks between Client and Server.

2.  **Content Strategy: Text vs JSONB**
    -   *Decision:* Use standard `text` column.
    -   *Reason:* I'm storing **Markdown**, not ProseMirror JSON.
    -   *Benefit:* 
        -   Database agnostic (easy migration).
        -   AI-Ready (LLMs consume text, not JSON trees).
        -   Search-Ready (Postgres `tsvector` works natively on text).

3.  **Timestamps**
    -   Included `timestamptz` (Timezone aware) for `createdAt` and `updatedAt` to ensure global synchronization accuracy.

## Artifacts
-   Table: `documents`
-   Location: `apps/api/src/modules/documents/entities/document.entity.ts`