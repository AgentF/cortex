import { useState, useEffect } from "react";
import type { DocumentDto, SearchResultDto } from "@cortex/shared";
import { documentsApi } from "../../services/documents";
import { useDebounce } from "../../hooks/useDebounce";
import { useChat } from "../../context/ChatContext";

interface SidebarProps {
  documents: DocumentDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

type Tab = "notes" | "chats";

export const Sidebar = ({
  documents,
  selectedId, // Note: This is usually the Document ID. We need to handle Chat ID highlighting too.
  onSelect,
  onCreate,
  onDelete,
}: SidebarProps) => {
  // --- STATE ---
  const [tab, setTab] = useState<Tab>("notes");

  // Document Search State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Chat Context
  const {
    state: chatState,
    selectSession,
    createSession,
    deleteSession,
  } = useChat();

  // --- SEARCH EFFECT (NOTES ONLY) ---
  useEffect(() => {
    if (tab !== "notes") return;

    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await documentsApi.search(debouncedQuery);
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    performSearch();
  }, [debouncedQuery, tab]);

  // --- RENDERING HELPERS ---
  const isSearching = query.trim().length > 0;
  const displayDocs = isSearching ? results : documents;

  // --- HANDLERS ---
  const handleCreate = () => {
    if (tab === "notes") onCreate();
    else createSession();
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this conversation thread?")) {
      await deleteSession(id);
    }
  };

  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-screen shrink-0 font-sans">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100 tracking-wider">
            CORTEX
          </h1>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
            Vault V1
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setTab("notes")}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
              tab === "notes"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            NOTES
          </button>
          <button
            onClick={() => setTab("chats")}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
              tab === "chats"
                ? "bg-blue-900/40 text-blue-200 shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            CHATS
          </button>
        </div>

        {/* SEARCH (Only visible in Notes tab for now) */}
        {tab === "notes" && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search signals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-900 text-sm text-gray-200 px-3 py-2 rounded border border-gray-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder-gray-600 transition-all pr-8"
            />
            {isLoading && (
              <div className="absolute right-3 top-2.5">
                <span className="block w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIST AREA */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
        {/* === NOTES TAB === */}
        {tab === "notes" && (
          <>
            {displayDocs.map((doc) => (
              <div key={doc.id} className="group relative flex items-center">
                <button
                  onClick={() => onSelect(doc.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors pr-8 ${
                    selectedId === doc.id
                      ? "bg-gray-800 text-white border-l-2 border-blue-500"
                      : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                  }`}
                >
                  <div className="font-medium truncate">
                    {doc.title || "Untitled"}
                  </div>

                  {"similarity" in doc ? (
                    <div className="text-xs text-blue-400 mt-1 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                      {Math.round((doc as SearchResultDto).similarity * 100)}%
                      Match
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(
                        (doc as DocumentDto).updatedAt
                      ).toLocaleDateString()}
                    </div>
                  )}
                </button>

                {!isSearching && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Burn this signal?")) onDelete(doc.id);
                    }}
                    className="absolute right-2 p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {isSearching && !isLoading && results.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-600 uppercase tracking-widest">
                No signals detected
              </div>
            )}
          </>
        )}

        {/* === CHATS TAB === */}
        {tab === "chats" && (
          <>
            {chatState.sessions.map((session) => (
              <div
                key={session.id}
                className="group relative flex items-center"
              >
                <button
                  onClick={() => selectSession(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors pr-8 ${
                    chatState.activeSessionId === session.id
                      ? "bg-blue-900/30 text-blue-100 border-l-2 border-blue-400"
                      : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                  }`}
                >
                  <div className="font-medium truncate">
                    {session.title || "New Session"}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {/* Format time nicely */}
                    {new Date(
                      session.updatedAt || new Date()
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </button>

                <button
                  onClick={(e) => handleDeleteChat(e, session.id)}
                  className="absolute right-2 p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            {chatState.sessions.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-600 uppercase tracking-widest">
                No active links
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER ACTION */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleCreate}
          className={`w-full py-2 text-white rounded font-bold transition-all shadow-lg ${
            tab === "notes"
              ? "bg-gray-700 hover:bg-gray-600" // Note creation is secondary color now? Or keep blue?
              : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
          }`}
        >
          {tab === "notes" ? "+ New Note" : "+ New Chat"}
        </button>
      </div>
    </div>
  );
};
