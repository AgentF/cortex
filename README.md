- [CORTEX | The Second Brain](#cortex--the-second-brain)
  - [1. ARCHITECTURAL PARAMETERS](#1-architectural-parameters)
    - [The Stack](#the-stack)
    - [The Capabilities (Phase 4 Status)](#the-capabilities-phase-4-status)
  - [2. OPERATIONAL PROTOCOLS (SETUP)](#2-operational-protocols-setup)
    - [Prerequisites](#prerequisites)
    - [Initialization](#initialization)
  - [3. Access Points](#3-access-points)
  - [4. DEVELOPMENT ROADMAP](#4-development-roadmap)
  - [5. CONSTRAINTS \& LOGIC](#5-constraints--logic)

# CORTEX | The Second Brain

> "It is by will alone I set my mind in motion."

**CORTEX** is a local-first, AI-augmented Knowledge Base designed for high-velocity engineering and architectural reasoning. It combines a distraction-free Markdown editor with a local RAG (Retrieval-Augmented Generation) engine, allowing users to converse with their notes using open-source LLMs.

---

## 1. ARCHITECTURAL PARAMETERS

### The Stack

- **Runtime:** Node.js (v20+) / pnpm workspaces.
- **Monorepo:** Nx (Integrated).
- **Database:** PostgreSQL 16 + `pgvector` (Dockerized).
- **AI Runtime:** Ollama (Local Inference).
  - _Logic:_ `gemma3:4b` (Google).
  - _Embeddings:_ `nomic-embed-text` (Switching to v2-MoE in Phase 5).
- **Backend:** NestJS (Modular Architecture, TypeORM).
- **Frontend:** React + Vite + Tailwind CSS.

### The Capabilities (Phase 4 Status)

1.  **The Vault (Memory):**
    - Full Markdown support with Tiptap.
    - Synchronized "Memory Bank" for chat history (Context).
    - Split-view interface (Write & Chat simultaneously).
2.  **The Eyes (Retrieval):**
    - Vector-based Semantic Search.
    - Real-time similarity ranking.
3.  **The Voice (Synthesis):**
    - Streaming RAG Chat interface.
    - Surgical context control (Edit/Delete messages).
    - Hallucination pruning.

---

## 2. OPERATIONAL PROTOCOLS (SETUP)

### Prerequisites

1.  **Docker Desktop** (for PostgreSQL).
2.  **Ollama** (Running on Host or via Network).
3.  **Node.js v20+** & **pnpm**.

### Initialization

```bash
# 1. Install Dependencies
pnpm install

# 2. Ignite the Infrastructure (Database)
docker-compose -f docker/docker-compose.yml up -d

# 3. Prime the AI Models
ollama pull gemma3:4b
ollama pull nomic-embed-text

# 4. Launch the System
pnpm nx run-many --target=serve --projects=api,web
```

## 3. Access Points

Interface: http://localhost:5173
API: http://localhost:3000/api
Swagger/OpenAPI: http://localhost:3000/api/docs (If enabled)

## 4. DEVELOPMENT ROADMAP

Phase Designation Status Objective
I Infrastructure [COMPLETE] Docker, Monorepo, NestJS wiring.
II The Vault [COMPLETE] CRUD, Markdown Editor, Persistence.
III The Retriever [COMPLETE] pgvector setup, Ingestion, Search API.
IV Synthesis [COMPLETE] RAG Orchestrator, Streaming Chat, Memory Bank.
V Refinement [ACTIVE] Chunking Engine, Natural Language Palette, UX Polish.
VI Fortification [PENDING] E2E Testing (Playwright), Unit Testing.

## 5. CONSTRAINTS & LOGIC

Local First: No data leaves the machine. All inference is local.
Strict Typing: class-validator enforces input vectors.
Stateless AI: The model remembers nothing. Context is injected via RAG.
