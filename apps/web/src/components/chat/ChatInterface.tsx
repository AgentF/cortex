import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import { TokenUsage } from "./TokenUsage";

// Sub-component for individual messages to handle local "IsEditing" state cleanly
const MessageBubble = ({
  msg,
  onEdit,
  onDelete,
}: {
  msg: any;
  onEdit: (id: string, txt: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(msg.content);

  const handleSave = () => {
    if (editContent.trim() !== msg.content) {
      onEdit(msg.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`group flex flex-col ${
        msg.role === "user" ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`
        relative max-w-[90%] rounded-lg text-sm leading-relaxed whitespace-pre-wrap
        ${
          msg.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-800 text-gray-200 border border-gray-700"
        }
      `}
      >
        {/* EDIT MODE */}
        {isEditing ? (
          <div className="p-2 min-w-[300px]">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-black/20 text-white rounded p-2 text-sm focus:outline-none resize-y min-h-[100px]"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="px-4 py-3 pr-8">
            {" "}
            {/* Extra padding right for icons */}
            {msg.content}
            {/* ACTION ICONS (Visible on Group Hover) */}
            <div
              className={`
               absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity
               ${msg.role === "user" ? "text-blue-200" : "text-gray-500"}
             `}
            >
              <button onClick={() => setIsEditing(true)} title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                onClick={() => confirm("Delete message?") && onDelete(msg.id)}
                title="Delete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 hover:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      <span className="text-[10px] text-gray-600 mt-1 uppercase font-bold">
        {msg.role}
      </span>
    </div>
  );
};

interface ChatInterfaceProps {
  getEditorContext: () => string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  getEditorContext,
}) => {
  const { state, sendMessage, createSession, editMessage, removeMessage } =
    useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || state.isStreaming) return;
    const activeContext = getEditorContext();
    const content = input;
    setInput("");
    if (activeContext) {
      await sendMessage(content, activeContext);
    } else {
      await sendMessage(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Empty State
  if (!state.activeSessionId) {
    // ... (Keep existing empty state logic)
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-900 border-l border-gray-800 text-center p-8">
        <button
          onClick={() => createSession()}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          Initialize Logic Core
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* HEADER */}
      <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/50 backdrop-blur">
        <span className="font-bold text-sm text-gray-300">CORTEX ORACLE</span>
        <TokenUsage messages={state.messages} currentInput={input} />
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {state.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onEdit={editMessage}
            onDelete={removeMessage}
          />
        ))}
        {state.isStreaming && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="bg-gray-800 text-gray-400 rounded-lg px-4 py-2 text-sm border border-gray-700">
              ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Query the database..."
            disabled={state.isStreaming}
            className="w-full bg-gray-800 text-white rounded-md pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-24 scrollbar-thin"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || state.isStreaming}
            className="absolute bottom-3 right-3 p-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
