# DevLog 001: The Foundations

**Date:** 2026-01-13
**State of mind:** Focused

## 1. Objective

Establish the Cortex infrastructure (Postgres + Vector) and the Monorepo architecture to enable shared types between FE/BE, reducing code duplication and improving maintainability.

### docker

For Isolation and Reproducibility.

### pgvector

pgvector enables efficient vector search in PostgreSQL, which is smiliar to a "smart search" capability.

### adminer

To interface with PostgreSQL.

## 3. The Implementation Plan

1.  **Supply Chain:** Pull `pgvector` Docker image.
2.  **Orchestration:** Configure `docker-compose` for DB + Adminer.
3.  **Shared Brain:** Initialize `@cortex/shared` package with TypeScript.
4.  **Verification:** Confirm DB connection via Adminer.

## 4. Blockers & Fixes (The Struggle)
*   **Blocker:** `TS6059` (File is not under 'rootDir').
*   **Context:** NestJS couldn't import `@cortex/shared` because it was outside the `api` folder.
*   **The Fix:**
    1.  Moved `rootDir` in `tsconfig.json` to `../../` (Workspace Root).
    2.  Excluded `dist` folders to prevent infinite loops (`TS5055`).
    3.  Updated `start:dev` script to explicitly point to the entry file (`apps/api/src/main`).
*   **Lesson:** In a Monorepo, the compiler needs to "see" the whole repo, but "ignore" the build artifacts.