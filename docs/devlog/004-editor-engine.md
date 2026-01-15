# DevLog 004: The Tiptap Markdown Engine

## Context

The app requires a rich-text editing experience (Bold, Headings, Lists) but strict **Markdown persistence**.
Standard Rich Text Editors (Quill, Slate, Tiptap) default to saving HTML or complex JSON Trees.

## The Problem

Storing JSON/HTML creates "Vendor Lock-in."

- If we switch editors later, we have to migrate data.
- LLMs (Phase 3) ingest Markdown best, not nested JSON trees with specific schema versions.

## The Solution

Implemented **Tiptap** with the `tiptap-markdown` extension.

### Data Flow

1.  **Input:** Component receives `string` (Markdown).
2.  **Hydration:** Tiptap parses Markdown -> Internal Prosemirror JSON (Document Model).
3.  **Mutation:** User types/formats.
4.  **Serialization:** `onUpdate`, Tiptap serializes JSON -> `string` (Markdown).
5.  **Output:** Component emits `string`.

### Implementation Details

- **Styling:** `@tailwindcss/typography` (The `.prose` class) handles the visual rendering of the editor.
- **Configuration:** HTML generation is disabled.
- **Constraint:** Pinned Tailwind to `v3.4.17` to avoid PostCSS possible incompatibilities with the current Vite/Monorepo setup.

## Result

The Database never sees the Editor's internal state. It only sees pure Markdown.
