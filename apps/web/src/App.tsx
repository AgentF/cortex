import { useEffect, useState } from "react";
import { documentsApi } from "./services/documents";
import { DocumentDto } from "@cortex/shared";
import { Editor } from "./components/editor/Editor";

function App() {
  const [docs, setDocs] = useState<DocumentDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState(
    "# Welcome to Cortex\nStart typing..."
  );

  // Helper to refresh list
  const refresh = () => {
    setLoading(true);
    documentsApi
      .getAll()
      .then(setDocs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    await documentsApi.create({
      title: `Note ${new Date().toLocaleTimeString()}`,
      content: "# New Entry\nCreated via React.",
    });
    refresh();
  };

  const handleUpdate = async (id: string, currentTitle: string) => {
    await documentsApi.update(id, {
      title: `${currentTitle} (Edited)`,
    });
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this note?")) return;
    await documentsApi.delete(id);
    refresh();
  };

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-500">CORTEX Uplink</h1>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-bold transition-colors"
        >
          + New Signal
        </button>
      </div>

      {error && (
        <div className="text-red-400 mb-4 border border-red-800 p-2">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 text-gray-400">
            Editor Sandbox (Local)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Editor value={editorContent} onChange={setEditorContent} />
            <div className="bg-gray-800 p-4 rounded border border-gray-700 font-mono text-sm whitespace-pre-wrap">
              <h3 className="text-gray-500 mb-2 border-b border-gray-700 pb-2">
                Live Markdown Output:
              </h3>
              {editorContent}
            </div>
          </div>
        </div>
        {docs.length === 0 ? (
          <p className="text-gray-500 italic">No signals detected.</p>
        ) : (
          docs.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between items-center bg-gray-800 border border-gray-700 p-4 rounded-lg"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-200">{doc.title}</h2>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  {doc.id}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(doc.id, doc.title)}
                  className="px-3 py-1 bg-blue-900 text-blue-200 text-sm hover:bg-blue-800 rounded"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-1 bg-red-900 text-red-200 text-sm hover:bg-red-800 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
