import { useEffect, useState, useRef } from "react";
import { useDocuments } from "../../hooks/useDocuments";
import { GhostService } from "../../services/ghost";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createDocument } = useDocuments();
  // const navigate = useNavigate(); // Future routing

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle Command Execution
  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    try {
      // 1. Send input to the Ghost (AI)
      const result = await GhostService.classifyIntent(input);
      console.log("Ghost Command Result:", result);
      // 2. Route based on Intent
      if (result.intent === "create_document" && result.parameters.title) {
        const title = result.parameters.title || "Untitled Node";
        await createDocument(title);
        onClose();
        setInput("");
      } else {
        // Feedback for unknown commands
        console.warn("Ghost: Intent unknown or unhandled.");
        // Optional: Shake animation or error toast here
      }
    } catch (error) {
      console.error("Execution Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleExecute} className="relative">
          <div className="flex items-center px-4 py-3 border-b border-gray-700">
            <span className="text-gray-400 mr-3">
              {/* Icon: Terminal */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 text-lg font-mono"
              placeholder="State your intent (e.g., 'Create a log about Docker')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            {loading && (
              <div className="text-xs text-blue-400 font-mono animate-pulse">
                COMPUTING...
              </div>
            )}
            <div className="ml-4 flex items-center gap-2">
              <kbd className="hidden sm:inline-block px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs text-gray-400 font-mono">
                ↵
              </kbd>
            </div>
          </div>

          {/* Suggestions / History could go here later */}
          <div className="bg-[#1a1a1a] px-4 py-2 text-xs text-gray-500 font-mono flex justify-between">
            <span>GHOST COMMAND v0.1</span>
            <span>PROCESSED BY OLLAMA</span>
          </div>
        </form>
      </div>
    </div>
  );
};
