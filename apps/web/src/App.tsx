import { useEffect, useState, useCallback } from "react";
import { documentsApi } from "./services/documents";
import { DocumentDto } from "@cortex/shared";
import { Sidebar } from "./components/layout/Sidebar";
import { Editor } from "./components/editor/Editor";

function App() {
  const [docs, setDocs] = useState<DocumentDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // The local content of the currently selected document
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // 1. Initial Load
  const refreshList = async () => {
    const list = await documentsApi.getAll();
    setDocs(list);
  };

  useEffect(() => {
    refreshList();
  }, []);

  // 2. Handle Selection
  const handleSelect = async (id: string) => {
    // If we have unsaved changes in current doc, we should save them immediately (omitted for MVP simplicity)
    setSelectedId(id);
    const doc = await documentsApi.getOne(id);
    setContent(doc.content);
    setStatus("saved");
  };

  // 3. Handle Creation
  const handleCreate = async () => {
    const newDoc = await documentsApi.create({
      title: "New Signal",
      content: "# New Signal\nStart writing...",
    });
    await refreshList();
    handleSelect(newDoc.id);
  };

  // 4. Handle Save (Debounced manually via useEffect)
  useEffect(() => {
    if (!selectedId) return;

    const timer = setTimeout(async () => {
      if (status === "unsaved") {
        setStatus("saving");
        // Extract title from first line (H1) or default
        const titleMatch = content.match(/^# (.*)$/m);
        const title = titleMatch ? titleMatch[1] : "Untitled Note";

        await documentsApi.update(selectedId, {
          title,
          content,
        });

        await refreshList(); // Refresh sidebar titles
        setStatus("saved");
      }
    }, 1000); // Wait 1 second after typing stops

    return () => clearTimeout(timer);
  }, [content, selectedId, status]);

  // 5. Handle Editor Change
  const handleChange = (newContent: string) => {
    setContent(newContent);
    setStatus("unsaved");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans">
      <Sidebar
        documents={docs}
        selectedId={selectedId}
        onSelect={handleSelect}
        onCreate={handleCreate}
      />

      <main className="flex-1 flex flex-col h-screen">
        {selectedId ? (
          <>
            {/* Header / Status Bar */}
            <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50">
              <div className="text-sm text-gray-500 font-mono">
                ID: {selectedId.split("-")[0]}...
              </div>
              <div
                className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                  status === "saved"
                    ? "text-green-500 bg-green-900/20"
                    : status === "saving"
                    ? "text-yellow-500 bg-yellow-900/20"
                    : "text-gray-400"
                }`}
              >
                {status === "unsaved" ? "..." : status}
              </div>
            </div>

            {/* Editor Container */}
            <div className="flex-1 overflow-y-auto bg-gray-900">
              <div className="max-w-3xl mx-auto py-12 px-8">
                <Editor
                  value={content}
                  onChange={handleChange}
                  className="border-none" // Remove border for clean look
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">🧠</div>
              <p>Select a signal to begin decryption.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
