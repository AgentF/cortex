# Devlog 014: The Monorepo Unification (Phase 5 Refinement)

## Context

As we prepared for the "Semantic Upgrade" (Chunking/RAG v2), we identified a critical fracture in the Monorepo. The Backend and Frontend were duplicating DTOs (Data Transfer Objects) because the Shared Library (`@cortex/shared`) was not resolving correctly at runtime.

## The Problem (The Fracture)

1. **Type Drift:** Backend `ChatRole` and Frontend `ChatRole` were separate entities.
2. **Path Resolution Failure:** NestJS (CommonJS) could not consume the Shared Lib (TypeScript Source) without building it first, slowing down velocity.
3. **Build Artifact Chaos:** The standard `nest build` command got confused by the `../packages` directory, creating nested `dist/apps/api/src/main` structures that crashed the startup loader.

## The Solution (The Repair)

We executed a surgical structural repair:

1. **Root-Level Path Mapping:** Configured `tsconfig.json` at the root to map `@cortex/shared` to `./packages/shared/src/index.ts`.
2. **Runtime Bypass:** We abandoned the standard Webpack/Nest build for development. We now use `ts-node` with `tsconfig-paths/register` to execute source code directly. This bypasses the build artifact confusion entirely.
3. **DTO Standardization:** We purged local Enums and Interfaces, enforcing a Single Source of Truth in the Shared Library.
4. **Validation Gatekeeper:** Enabled global `ValidationPipe` in NestJS to enforce the new Shared DTO contracts.
5. **CORS Diplomacy:** Whitelisted `127.0.0.1` alongside `localhost` to allow local access.

## Outcome

The system is now a true Monorepo. A change in `packages/shared` instantly propagates to both API and Web with hot-reloading active. The foundation is solid.
