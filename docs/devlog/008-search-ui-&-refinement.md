# DevLog 007: Search UI & Refinement

## Context

- We need a user-friendly interface for searching documents with the new sarch endpoint.

### Objectives

- Implement real-time semantic search in the Sidebar.
- Optimize UX with Debouncing and Visual Feedback.
- Filter low-relevance results.

### Implementation Details

1. **Frontend**:

   - `useDebounce` hook (300ms) prevents API flooding.
   - `Sidebar` toggles between "Chronological" and "Relevance" views.
   - Added `isLoading` state for visual feedback (ping animation).
   - Strict Type Imports utilized to satisfy `verbatimModuleSyntax`.

2. **Backend Optimization**:
   - **Thresholding**: Applied `WHERE similarity > 0.4` to remove hallucinations/noise.
   - **Parameter Binding Fix**: Renamed `:vector` to `:queryVec` to prevent TypeORM from confusing the _parameter name_ with the Postgres _data type_ (`::vector`).

### Verification

- Search for "mind" returns "The Spice Melange" (approx 51% match).
- Search for "whale" (irrelevant) returns "No signals detected" (due to threshold).
