import React, { useMemo } from "react";
import { ChatMessageDto } from "@cortex/shared"; // or local type

interface TokenUsageProps {
  messages: ChatMessageDto[];
  currentInput: string;
}

export const TokenUsage: React.FC<TokenUsageProps> = ({
  messages,
  currentInput,
}) => {
  const count = useMemo(() => {
    const historyText = messages.map((m) => m.content).join("");
    const totalChars = historyText.length + currentInput.length;
    return Math.ceil(totalChars / 4); // Rough estimation
  }, [messages, currentInput]);

  // Context Limit Warning (assuming 8k context ~ 8000 tokens)
  const limit = 8000;
  const isWarning = count > limit * 0.8;

  return (
    <div
      className={`text-xs font-mono px-2 py-1 rounded ${
        isWarning ? "text-red-400 bg-red-900/20" : "text-gray-500"
      }`}
    >
      ~{count} Tokens
    </div>
  );
};
