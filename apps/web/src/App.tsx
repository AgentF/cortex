import { useEffect, useRef, useState } from "react";
import { ChatProvider } from "./context/ChatContext";
import { useDocuments } from "./hooks/useDocuments";
import { Sidebar } from "./components/layout/Sidebar";
import { EditorPanel } from "./components/editor/EditorPanel";
import { ChatInterface } from "./components/chat/ChatInterface";
import { Dashboard } from "./components/layout/Dashboard";
import { CommandPalette } from "./components/layout/CommandPalette";

function App() {
  // 1. Logic Hooks
  const {
    docs,
    selectedId,
    content,
    status,
    setContent,
    selectDocument,
    createDocument,
    deleteDocument,
  } = useDocuments();

  // 2. UI State
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const activeDocument = docs.find((d) => d.id === selectedId);

  //3. Hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }

      if (e.key === "Escape" && isPaletteOpen) {
        setIsPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 3. Refs
  const editorContentRef = useRef<string>("");

  return (
    <ChatProvider>
      <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
        {/* LEFT: SIDEBAR */}
        {/* We pass the document props here. Note: We will refactor Sidebar next turn to handle Chat tabs */}
        <Sidebar
          documents={docs}
          selectedId={selectedId}
          onSelect={selectDocument}
          onCreate={createDocument}
          onDelete={deleteDocument}
        />

        {/* CENTER: EDITOR + CHAT TOGGLE */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {selectedId ? (
            <>
              <EditorPanel
                selectedId={selectedId}
                content={content}
                status={status}
                onChange={(val) => {
                  editorContentRef.current = val;
                  setContent(val);
                }}
              />
            </>
          ) : (
            // EMPTY STATE
            <Dashboard docCount={docs.length} onCreate={createDocument} />
          )}

          {/* TOGGLE BUTTON (Absolute positioned on top right of editor) */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`absolute top-1.5 right-1 z-20 p-1.5 rounded-md shadow-lg border border-gray-700 transition-all
              ${
                isChatOpen
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }
            `}
            title="Toggle Neural Interface"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
        </main>

        {/* RIGHT: CHAT PANEL (Collapsible) */}
        <aside
          className={`
            border-l border-gray-800 bg-gray-900 transition-all duration-300 ease-in-out flex-shrink-0
            ${
              isChatOpen
                ? "w-[400px] translate-x-0"
                : "w-0 translate-x-full opacity-0 overflow-hidden"
            }
          `}
        >
          {/* Container keeps width fixed to prevent content squashing during transition */}
          <div className="h-full w-[400px]">
            <ChatInterface
              getEditorContext={() => editorContentRef.current}
              activeTitle={activeDocument?.title}
            />
          </div>
        </aside>
        <CommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
        />
      </div>
    </ChatProvider>
  );
}

export default App;
