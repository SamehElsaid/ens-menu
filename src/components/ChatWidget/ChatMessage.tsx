"use client";

import { FiUser } from "react-icons/fi";
import type { ChatMessage as Message } from "@/services/chatApi";
import LenaAvatar from "./LenaAvatar";
import { renderAiMessageContent } from "./renderAiMessageContent";

type Props = {
  message: Message;
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-2 sm:gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {isUser ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent-purple to-deep-indigo text-white shadow-md shadow-purple-500/20 sm:size-9">
          <FiUser size={14} className="sm:hidden" />
          <FiUser size={15} className="hidden sm:block" />
        </div>
      ) : (
        <LenaAvatar size={32} className="sm:hidden" />
      )}
      {!isUser && <LenaAvatar size={36} className="hidden sm:block" />}

      <div
        className={`min-w-0 max-w-[88%] px-3 py-2.5 text-[13px] sm:max-w-[84%] sm:px-3.5 sm:py-3 sm:text-[13.5px] ${
          isUser
            ? "rounded-2xl rounded-br-md bg-linear-to-br from-accent-purple to-deep-indigo leading-relaxed text-white shadow-md shadow-purple-500/25"
            : "rounded-2xl rounded-bl-md border border-slate-100/90 bg-white leading-[1.65] text-slate-700 shadow-sm sm:leading-[1.7] dark:border-slate-700/70 dark:bg-[#161b22] dark:text-slate-200"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap break-words">{message.content}</span>
        ) : (
          renderAiMessageContent(message.content) ?? (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )
        )}
      </div>
    </div>
  );
}
