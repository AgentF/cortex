# Devlog 015: The Semantic Upgrade (Chunking & MoE)

## Context

Phase 5.3 aimed to increase the resolution of our Retrieval Augmented Generation (RAG). Previously, searching for a specific fact retrieved the entire document (Context Pollution). We needed higher precision.

## The Upgrade

1.  **Paragraph Chunking:** Implemented a splitter algorithm in `DocumentsService` that divides text by double-newlines before ingestion.
2.  **Schema Migration:**
    - Deprecated `embedding` on the `Document` entity.
    - Created `DocumentChunk` entity (One-to-Many relation).
    - Applied `nomic-embed-text-v2-moe` (768 dimensions) for superior latent space mapping.
3.  **The Purge:** Due to incompatible schema changes and "ghost records," we executed a full database wipe and re-initialization.
4.  **Atomic Chat Creation:** Upgraded `ChatService` and `Shared DTOs` to allow creating a session and sending the first message in a single atomic transaction, improving UX.

## Technical Challenges

- **Vector Indexing:** TypeORM attempted to apply a `GiST` (Spatial) index to vectors, causing a boot loop. We reverted to standard storage (and optional HNSW via SQL) to stabilize.
- **Validation Strictness:** The `ValidationPipe` correctly rejected the new `firstMessage` field until we synchronized the DTOs in the Shared Library.

## Outcome

The "Turing Test" confirmed success. The AI successfully retrieved a specific paragraph from the middle of a document ("The Third Law") without retrieving unrelated context from the same file.
