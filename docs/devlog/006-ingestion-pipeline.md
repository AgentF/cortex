# DevLog 006: Ingestion Pipeline

## Context

We need a pipeline that ingests documents into our database, and then generates embeddings for those documents using OpenAI's `nomic-embed-text` API.

### Objectives

- Bridge the gap between the Database and the Local AI (Ollama).
- Automate vector generation on document Create/Update.

### Implementation Details

1. **Dependencies**: Installed `ollama` (Node.js client).
2. **AiService**:
   - Created isolated module to handle `nomic-embed-text` interactions.
   - Implemented error handling: returns empty array on failure (non-blocking for DB).
3. **Integration**:
   - Wired `AiService` into `DocumentsService`.
   - **Strategy**: Synchronous (Blocking). We wait for the vector before confirming the save.
   - **Optimization**: Updates only trigger re-calculation if `content` string changes.

### Verification

- Smoke test confirms `AiService` initializes and returns 768-dim vectors.
- Database query confirms new documents contain binary vector data.
