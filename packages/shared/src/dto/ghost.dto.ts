export type GhostAction = "create_document" | "unknown";

export interface GhostIntent {
  intent: GhostAction;
  parameters: {
    title?: string;
    // Parameters are extensible for future intents (e.g., 'search', 'delete')
    [key: string]: any;
  };
}
