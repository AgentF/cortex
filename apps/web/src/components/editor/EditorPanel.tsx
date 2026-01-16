import React from "react";
import { Editor } from "./Editor"; // Your existing component

interface EditorPanelProps {
  selectedId: string | null;
  content: string;
  status: "saved" | "saving" | "unsaved";
  onChange: (val: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  selectedId,
  content,
  status,
  onChange,
}) => {
  if (!selectedId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 bg-gray-950 h-full">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">🧠</div>
          <p>Select a signal to begin decryption.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* HEADER */}
      <div className="h-12 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/30 backdrop-blur">
        <div className="text-xs text-gray-500 font-mono">
          ID: {selectedId.split("-")[0]}
        </div>
        <div
          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider transition-colors duration-300 ${
            status === "saved"
              ? "text-green-500 bg-green-900/20"
              : status === "saving"
              ? "text-yellow-500 bg-yellow-900/20"
              : "text-gray-400"
          }`}
        >
          {status === "unsaved" ? "Modifying..." : status}
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full min-h-full py-12 px-8">
          <Editor
            value={content}
            onChange={onChange}
            className="border-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};
