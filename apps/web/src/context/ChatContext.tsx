import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { chatApi } from "../services/chat";
import type { ChatSessionPreview } from "../services/chat";
import { ChatMessageDto, ChatRole } from "@cortex/shared"; // Or local types

// --- TYPES ---
interface ChatState {
  sessions: ChatSessionPreview[];
  activeSessionId: string | null;
  messages: ChatMessageDto[]; // Messages of the active session
  isStreaming: boolean;
  isLoading: boolean; // For initial loads
}

type Action =
  | { type: "SET_SESSIONS"; payload: ChatSessionPreview[] }
  | {
      type: "SET_ACTIVE_SESSION";
      payload: { id: string; messages: ChatMessageDto[] };
    }
  | { type: "ADD_USER_MESSAGE"; payload: ChatMessageDto }
  | { type: "START_STREAM" }
  | { type: "APPEND_TOKEN"; payload: string }
  | { type: "END_STREAM"; payload: ChatMessageDto } // Replace partial stream with final DB message
  | { type: "DELETE_SESSION"; payload: string }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; content: string } }
  | { type: "DELETE_MESSAGE"; payload: string };

// --- REDUCER ---
const chatReducer = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };

    case "SET_ACTIVE_SESSION":
      return {
        ...state,
        activeSessionId: action.payload.id,
        messages: action.payload.messages,
        isLoading: false,
      };

    case "ADD_USER_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "START_STREAM":
      // Add a placeholder "Assistant" message that we will fill
      const placeholder: ChatMessageDto = {
        id: "streaming-placeholder",
        role: ChatRole.ASSISTANT,
        content: "",
        createdAt: new Date().toISOString(),
        sessionId: state.activeSessionId!,
      } as any;
      return {
        ...state,
        isStreaming: true,
        messages: [...state.messages, placeholder],
      };

    case "APPEND_TOKEN":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === "streaming-placeholder"
            ? { ...m, content: m.content + action.payload }
            : m
        ),
      };

    case "END_STREAM":
      // Replace placeholder with the real finalized message (optional, or just finalize the ID)
      return {
        ...state,
        isStreaming: false,
        messages: state.messages.map((m) =>
          m.id === "streaming-placeholder" ? action.payload : m
        ),
      };

    case "DELETE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
        activeSessionId:
          state.activeSessionId === action.payload
            ? null
            : state.activeSessionId,
        messages:
          state.activeSessionId === action.payload ? [] : state.messages,
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? { ...m, content: action.payload.content }
            : m
        ),
      };

    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((m) => m.id !== action.payload),
      };

    default:
      return state;
  }
};

// --- CONTEXT ---
const ChatContext = createContext<{
  state: ChatState;
  loadSessions: () => Promise<void>;
  selectSession: (id: string) => Promise<void>;
  createSession: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  sendMessage: (content: string, activeContext?: string) => Promise<void>;
  editMessage: (id: string, newContent: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
} | null>(null);

// --- PROVIDER ---
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, {
    sessions: [],
    activeSessionId: null,
    messages: [],
    isStreaming: false,
    isLoading: false,
  });

  // Load sidebar
  const loadSessions = useCallback(async () => {
    const sessions = await chatApi.listSessions();
    dispatch({ type: "SET_SESSIONS", payload: sessions });
  }, []);

  // Select a thread
  const selectSession = useCallback(async (id: string) => {
    // dispatch({ type: 'SET_LOADING', payload: true }); // Optional
    const session = await chatApi.getSession(id);
    dispatch({
      type: "SET_ACTIVE_SESSION",
      payload: { id: session.id, messages: session.messages || [] },
    });
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await chatApi.deleteSession(id);
    dispatch({ type: "DELETE_SESSION", payload: id });
  }, []);

  const createSession = useCallback(async () => {
    const newSession = await chatApi.createSession();
    await loadSessions();
    await selectSession(newSession.id);
  }, [loadSessions, selectSession]);

  // The Big One: Send & Stream
  const sendMessage = useCallback(
    async (content: string, activeContext?: string) => {
      if (!state.activeSessionId) return;

      // 1. Optimistic UI: Add User Message immediately
      const tempUserMsg: ChatMessageDto = {
        id: Date.now().toString(),
        role: ChatRole.USER,
        content,
        activeContext,
        createdAt: new Date().toISOString(),
        sessionId: state.activeSessionId,
      } as any;
      dispatch({ type: "ADD_USER_MESSAGE", payload: tempUserMsg });

      // 2. Start Stream
      dispatch({ type: "START_STREAM" });

      let fullContent = "";

      try {
        await chatApi.streamMessage(
          state.activeSessionId,
          activeContext,
          content,
          (token) => {
            fullContent += token;
            dispatch({ type: "APPEND_TOKEN", payload: token });
          }
        );

        // 3. Finalize
        // Ideally, we fetch the real message ID from DB here, but for now we just unlock UI
        // We can construct the final object or just leave the placeholder as "real"
        const finalizedMsg: ChatMessageDto = {
          id: Date.now().toString(), // Should ideally come from backend response
          role: ChatRole.ASSISTANT,
          content: fullContent,
          createdAt: new Date().toISOString(),
          sessionId: state.activeSessionId,
        } as any;

        dispatch({ type: "END_STREAM", payload: finalizedMsg });
      } catch (e) {
        console.error("Stream failed", e);
        dispatch({
          type: "END_STREAM",
          payload: { ...tempUserMsg, content: "Error generating response." },
        });
      }
    },
    [state.activeSessionId]
  );

  const editMessage = useCallback(async (id: string, newContent: string) => {
    // Optimistic Update
    dispatch({ type: "UPDATE_MESSAGE", payload: { id, content: newContent } });
    try {
      await chatApi.updateMessage(id, newContent);
    } catch (e) {
      console.error("Edit failed", e);
      // Ideally revert state here, but for MVP we log error
    }
  }, []);

  const removeMessage = useCallback(async (id: string) => {
    // Optimistic Update
    dispatch({ type: "DELETE_MESSAGE", payload: id });
    try {
      await chatApi.deleteMessage(id);
    } catch (e) {
      console.error("Delete failed", e);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <ChatContext.Provider
      value={{
        state,
        loadSessions,
        selectSession,
        sendMessage,
        createSession,
        deleteSession,
        editMessage,
        removeMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
