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

## 5. Phase 3: The Frontend Link (Vite)
**Objective:** Connect the React frontend to the Monorepo without ejecting standard tooling.

### The "Aha!" (Double Mapping)
I learned that in a Monorepo, you must map paths twice:
1.  **For the Editor (VS Code):** In `tsconfig.json`, so IntelliSense works.
2.  **For the Bundler (Vite):** In `vite.config.ts` (via `resolve.alias`), so the browser can actually find the files.
*If you miss one, you either get red lines (IDE) or a crashing app (Browser).*

### The Struggle: ESLint Flat Config
**Blocker:** `Parsing error: No tsconfigRootDir was set`.
**Context:** The new ESLint (v9) uses a "Flat Config" that confused the TypeScript parser. It tried to lint the config file itself as if it were source code.
**Fix:**
1.  Used `import.meta.dirname` (Node 20+) to explicitly anchor the parser.
2.  Separated configuration objects: One for JS files (config), one for TS files (source).