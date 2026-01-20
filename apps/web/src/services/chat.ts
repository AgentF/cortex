import { api as axios } from "../lib/axios";
import { ChatSessionDto } from "@cortex/shared";

export const chatApi = {
  // 1. Create a new thread
  createSession: async (): Promise<ChatSessionDto> => {
    const { data } = await axios.post("/chat/sessions", {
      firstMessage: "Init",
    });
    return data;
  },

  // 2. Get list of threads
  listSessions: async (): Promise<ChatSessionDto[]> => {
    const { data } = await axios.get("/chat/sessions");
    return data;
  },

  // 3. Load full history
  getSession: async (id: string): Promise<ChatSessionDto> => {
    const { data } = await axios.get(`/chat/sessions/${id}`);
    return data;
  },

  // 4. Delete thread
  deleteSession: async (id: string): Promise<void> => {
    await axios.delete(`/chat/sessions/${id}`);
  },

  // 5. THE STREAM ENGINE
  // We use native fetch because Axios handling of streams can be verbose
  streamMessage: async (
    sessionId: string,
    content: string,
    activeContext: string | undefined,
    onToken: (token: string) => void
  ): Promise<void> => {
    const response = await fetch(
      `http://localhost:3000/api/chat/sessions/${sessionId}/stream`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, activeContext }),
      }
    );

    if (!response.body) throw new Error("ReadableStream not supported");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      onToken(chunk);
    }
  },
  // 6. Edit Message
  updateMessage: async (id: string, content: string): Promise<void> => {
    await axios.patch(`/chat/messages/${id}`, { content });
  },

  // 7. Delete Message
  deleteMessage: async (id: string): Promise<void> => {
    await axios.delete(`/chat/messages/${id}`);
  },
};
