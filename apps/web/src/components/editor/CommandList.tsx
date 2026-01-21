import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Editor } from "@tiptap/react";

interface CommandListProps {
  items: any[];
  command: (item: any) => void;
  editor: Editor;
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }
      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }
      if (event.key === "Enter") {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[200px] z-50">
      <div className="flex flex-col p-1 text-sm text-gray-200">
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              key={index}
              className={`
                flex items-center gap-2 px-3 py-2 rounded text-left w-full
                ${
                  index === selectedIndex
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-700"
                }
              `}
              onClick={() => selectItem(index)}
            >
              {item.element || null}
              <span>{item.title}</span>
            </button>
          ))
        ) : (
          <div className="px-3 py-2 text-gray-500">No result</div>
        )}
      </div>
    </div>
  );
});

CommandList.displayName = "CommandList";
