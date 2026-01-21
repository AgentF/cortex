import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { useEffect } from "react";
import {
  SlashCommand,
  getSuggestionItems,
  renderItems,
} from "./extensions/SlashCommand";

// Inline utility for class merging
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface EditorProps {
  value: string;
  onChange: (markdown: string) => void;
  className?: string;
}

export const Editor = ({ value, onChange, className }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false,
        transformPastedText: true,
      }),
      SlashCommand.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems,
        },
      }),
    ],
    editorProps: {
      attributes: {
        // Updated classes:
        // 1. min-h-full to ensure it fills the panel
        // 2. max-w-none to use full width
        // 3. prose-invert for dark mode typography
        class: "prose prose-invert max-w-none focus:outline-none min-h-full",
      },
    },
    onUpdate: ({ editor }) => {
      const markdownOutput = editor.storage.markdown.getMarkdown();
      onChange(markdownOutput);
    },
  });

  // Handle external updates (switching documents)
  useEffect(() => {
    if (editor && value !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={classNames("flex flex-col h-full", className)}>
      {/* TOOLBAR - Sticky at the top, transparent/blur effect */}
      <div className="flex items-center gap-2 py-2 mb-4 border-b border-gray-800/50 sticky top-0 z-10 bg-gray-950/80 backdrop-blur">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          label="B"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          label="i"
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
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          label="• List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          label="{ }"
        />
      </div>

      {/* EDITOR CONTENT AREA */}
      <div className="flex-1">
        <EditorContent
          editor={editor}
          className="
          prose prose-invert 
          max-w-4xl mx-auto         /* EXPANDED WIDTH (Standard is max-w-prose) */
          w-full 
          focus:outline-none 
          prose-pre:bg-gray-800     /* Better code block background */
          prose-pre:border          /* Code block border */
          prose-pre:border-gray-700
          min-h-[500px]             /* Ensure click target exists */
        "
        />
      </div>
    </div>
  );
};

// Simplified Button Helper
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
    className={`
      px-2.5 py-1 rounded text-xs font-bold transition-all duration-200
      ${
        isActive
          ? "bg-blue-600/90 text-white shadow-sm shadow-blue-900/20"
          : "text-gray-500 hover:text-gray-200 hover:bg-gray-800"
      }
    `}
  >
    {label}
  </button>
);
