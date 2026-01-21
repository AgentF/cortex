import { useEffect } from "react";
import { useChat } from "../context/ChatContext";

export const TestChat = () => {
  const { state, createSession, selectSession, sendMessage } = useChat();

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">CORTEX LOGIC CHECK</h1>

      {/* CONTROLS */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => createSession()}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          [1] Create Session
        </button>

        <button
          onClick={() =>
            state.activeSessionId && sendMessage("Define the word: Mentat.")
          }
          disabled={!state.activeSessionId || state.isStreaming}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 disabled:opacity-50"
        >
          [2] Send Message (Stream)
        </button>
      </div>

      {/* STATE VISUALIZER */}
      <div className="grid grid-cols-2 gap-4">
        {/* SESSIONS LIST */}
        <div className="border border-gray-700 p-4">
          <h2 className="text-green-400 mb-2">
            Active Session ID: {state.activeSessionId || "None"}
          </h2>
          <h3 className="font-bold border-b border-gray-700 mb-2">
            Available Sessions ({state.sessions.length})
          </h3>
          <ul className="space-y-1">
            {state.sessions.map((s) => (
              <li
                key={s.id}
                onClick={() => selectSession(s.id)}
                className="cursor-pointer hover:text-blue-400"
              >
                {s.id.slice(0, 8)}... - {s.title || "Untitled"}
              </li>
            ))}
          </ul>
        </div>

        {/* MESSAGE LOG (THE STREAM CHECK) */}
        <div className="border border-gray-700 p-4 h-96 overflow-auto">
          <h3 className="font-bold border-b border-gray-700 mb-2">
            Message Log
          </h3>
          {state.messages.length === 0 && (
            <span className="text-gray-500">No messages in context.</span>
          )}

          {state.messages.map((m, i) => (
            <div
              key={i}
              className={`mb-2 ${
                m.role === "user" ? "text-blue-300" : "text-green-300"
              }`}
            >
              <span className="font-bold uppercase text-xs">{m.role}:</span>
              <p className="whitespace-pre-wrap ml-2">{m.content}</p>
            </div>
          ))}

          {state.isStreaming && (
            <div className="text-yellow-500 animate-pulse mt-2">
              [RECEIVING STREAM DATA...]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
