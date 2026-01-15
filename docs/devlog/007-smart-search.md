# DevLog 007: Semantic Retrieval API

## Context

- We need a REST API that allows users to search for documents based on their content.

### Objectives

- Expose vector similarity search via HTTP.
- Utilize `pgvector` Cosine Distance operator (`<=>`).

### Implementation Details

1. **Search Endpoint**: `GET /documents/search?q=...`
2. **Logic**:
   - Convert query text to vector (AiService).
   - Execute Raw SQL QueryBuilder.
   - Formula: `1 - (embedding <=> query_vector)` to get Similarity Score.
3. **Troubleshooting & Fixes**:
   - **Routing Collision**: `GET('search')` was initially blocked by `GET(':id')`. Reordered controller methods to prioritize specific paths.
   - **Type Casting**: TypeORM/Postgres required explicit `::vector` casting for the query parameter.

### Verification

- `curl` test with semantic query ("expanding minds") successfully retrieved target document titled "The Spice Melange", content "The spice extends life. The spice expands consciousness.", with "similarity":0.5845850991773859.
