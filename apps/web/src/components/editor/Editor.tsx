import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown"; // The secret sauce
// import { cn } from "../../lib/utils"; // We need to create this utility or inline it
import { useEffect } from "react";

// Temporary utility if you don't have lib/utils yet
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface EditorProps {
  value: string; // The Markdown content
  onChange: (markdown: string) => void;
  className?: string;
}

export const Editor = ({ value, onChange, className }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false, // Force pure Markdown
        transformPastedText: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        // The 'prose' class gives it the document look
        class: "prose prose-invert max-w-none focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      // EXTRACT MARKDOWN INSTEAD OF JSON/HTML
      const markdownOutput = editor.storage.markdown.getMarkdown();
      onChange(markdownOutput);
    },
  });

  // Handle external updates (e.g. loading a new note)
  useEffect(() => {
    if (editor && value !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={classNames(
        "flex flex-col border border-gray-700 rounded-md overflow-hidden",
        className
      )}
    >
      {/* TOOLBAR */}
      <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          label="B"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          label="H1"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          label="H2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          label="{ }"
        />
      </div>

      {/* EDITOR AREA */}
      <div className="p-4 bg-gray-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// Simple Button Helper
const ToolbarButton = ({
  onClick,
  isActive,
  label,
}: {
  onClick: () => void;
  isActive: boolean;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
    }`}
  >
    {label}
  </button>
);
