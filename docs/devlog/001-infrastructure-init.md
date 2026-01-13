# DevLog 001: The Foundations

**Date:** 2026-01-13
**State of mind:** Focused

## 1. Objective

Establish the Cortex infrastructure (Postgres + Vector) and the Monorepo architecture to enable shared types between FE/BE, reducing code duplication and improving maintainability.

### pgvector?

pgvector enables efficient vector search in PostgreSQL, which is smiliar to a "smart search" capability.

## 3. The Implementation Plan

1.  **Supply Chain:** Pull `pgvector` Docker image.
2.  **Orchestration:** Configure `docker-compose` for DB + Adminer.
3.  **Shared Brain:** Initialize `@cortex/shared` package with TypeScript.
4.  **Verification:** Confirm DB connection via Adminer.

## 4. Blockers & Fixes (The Struggle)

_(Leave this blank for now, fill it if we hit errors in the next step)_
