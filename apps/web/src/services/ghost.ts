import { api } from "../lib/axios";
import { GhostIntent } from "@cortex/shared";

export const GhostService = {
  /**
   * Translates natural language into a structured intent via Backend AI.
   */
  classifyIntent: async (input: string): Promise<GhostIntent> => {
    try {
      const { data } = await api.post<GhostIntent>("/ai/ghost", { input });
      return data;
    } catch (error) {
      console.error("Ghost Command Failure:", error);
      return { intent: "unknown", parameters: {} };
    }
  },
};
