# DevLog 005: Vector Infrastructure & Schema

## Context

We need a scalable, efficient way to store and query large vectors in a PostgreSQL database. We also need a schema that can handle the relationships between documents and their embeddings.

### Objectives

- Enable high-dimensional vector storage in PostgreSQL.
- Update TypeORM entities to support `vector` column type.

### Implementation Details

1. **Infrastructure**:
   - Verifyed Docker image is `pgvector/pgvector:pg16`.
   - Manually enabled extension: `CREATE EXTENSION IF NOT EXISTS vector;`.
2. **Schema**:
   - Modified `Document` entity: Added `embedding` column (type: `vector`, nullable: true).
   - Sync verified via `psql` (`\d documents` shows vector type).
3. **Verification**:
   - Frontend regression test passed (CRUD operations functional without embedding data).
   - Backend successfully validated vector type on startup.
