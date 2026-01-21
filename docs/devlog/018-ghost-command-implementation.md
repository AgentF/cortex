# Devlog 018: The Ghost Command (Natural Language Interface)

## Context

As the CORTEX system grows, navigating and creating content via clicks becomes inefficient. We needed a "Neural Shunt"—a way to interface with the system using natural language intent, bypassing the traditional UI friction.

## Objectives

1. Implement a `Cmd+K` Command Palette (UI).
2. Integrate a "Ghost Service" to interpret natural language.
3. Utilize a lightweight AI model (`functiongemma:270m`) to classify intent without latency.
4. Execute system actions (specifically `create_document`) based on AI output.

## Roadblocks & Solutions

- **Latency vs. Accuracy:** Loading the main `gemma3:4b` model for simple commands introduced latency.
  - _Solution:_ We deployed `functiongemma:270m`. It is instant but "dumb."
- **Schema Drift:** The small model struggled to output strict JSON, often hallucinating fields like `name` or `description` instead of `title`, or ignoring the `intent` key.
  - _Solution:_ We implemented a "Robust Normalization Layer" in the Backend `AiService`. This layer acts as a translator, mapping various hallucinated keys (topic, subject, name) to our required `title` parameter and employing a Regex fallback if the AI fails completely.
- **Frontend Connectivity:** The initial frontend hook ignored the AI-generated title, defaulting to "New Signal."
  - _Solution:_ Updated `useDocuments` and `DocumentsService` to accept and propagate the `title` payload.

## Outcome

The Ghost Command is active. Users can press `Cmd+K`, type "Draft a spec for the Harkonnen attack," and the system instantly generates a document with that context. The architecture supports future expansion for navigation and search intents.
