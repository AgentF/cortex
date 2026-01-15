import { useState, useEffect } from "react";
import type { DocumentDto, SearchResultDto } from "@cortex/shared";
import { documentsApi } from "../../services/documents";
import { useDebounce } from "../../hooks/useDebounce";

interface SidebarProps {
  documents: DocumentDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export const Sidebar = ({
  documents,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: SidebarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 1. NEW STATE
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true); // 2. START LOAD
      try {
        const data = await documentsApi.search(debouncedQuery);
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false); // 3. END LOAD
      }
    };
    performSearch();
  }, [debouncedQuery]);

  const isSearching = query.trim().length > 0;
  const displayList = isSearching ? results : documents;

  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-screen shrink-0 font-sans">
      <div className="p-4 border-b border-gray-800 space-y-3">
        <div>
          <h1 className="text-xl font-bold text-gray-100 tracking-wider">
            CORTEX
          </h1>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
            Vault V1
          </div>
        </div>

        {/* SEARCH INPUT WITH LOADING INDICATOR */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search signals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-900 text-sm text-gray-200 px-3 py-2 rounded border border-gray-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder-gray-600 transition-all pr-8"
          />
          {/* LOADER DOT */}
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <span className="block w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
        {displayList.map((doc) => (
          <div key={doc.id} className="group relative flex items-center">
            <button
              onClick={() => onSelect(doc.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors pr-8 ${
                selectedId === doc.id
                  ? "bg-blue-900/30 text-blue-200 border border-blue-800/50"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <div className="font-medium truncate">
                {doc.title || "Untitled"}
              </div>

              {"similarity" in doc ? (
                <div className="text-xs text-blue-400 mt-1 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                  {Math.round((doc as SearchResultDto).similarity * 100)}% Match
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
                title="Delete"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* EMPTY STATE OR NO MATCHES */}
        {isSearching && !isLoading && results.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-600 uppercase tracking-widest">
            No signals detected
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            setQuery("");
            onCreate();
          }}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-all shadow-lg shadow-blue-900/20"
        >
          + New Signal
        </button>
      </div>
    </div>
  );
};
