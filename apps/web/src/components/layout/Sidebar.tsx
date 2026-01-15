import { DocumentDto } from "@cortex/shared";

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
  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-screen shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-gray-100 tracking-wider">
          CORTEX
        </h1>
        <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
          Vault V1
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
        {documents.map((doc) => (
          <div key={doc.id} className="group relative flex items-center">
            {" "}
            {/* Wrap button in div */}
            <button
              onClick={() => onSelect(doc.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors pr-8 ${
                // Added padding-right
                selectedId === doc.id
                  ? "bg-blue-900/30 text-blue-200 border border-blue-800/50"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <div className="font-medium truncate">
                {doc.title || "Untitled"}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </div>
            </button>
            {/* Delete Action (Visible on Group Hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Don't select the note when deleting
                if (confirm("Burn this signal?")) onDelete(doc.id);
              }}
              className="absolute right-2 p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onCreate}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-all shadow-lg shadow-blue-900/20"
        >
          + New Signal
        </button>
      </div>
    </div>
  );
};
