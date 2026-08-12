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
      className={`flex gap-2 sm:gap-3 ${isUser ? "flex-row justify-end" : "flex-row justify-start"}`}
    >
      {!isUser && <LenaAvatar size={32} className="sm:hidden" />}
      {!isUser && <LenaAvatar size={36} className="hidden sm:block" />}

      <div
        className={`min-w-0 max-w-[88%] px-3 py-2.5 text-start text-[13px] sm:max-w-[84%] sm:px-3.5 sm:py-3 sm:text-[13.5px] ${
          isUser
            ? "rounded-lg rounded-ee-sm bg-accent leading-relaxed text-on-accent"
            : "rounded-lg rounded-es-sm border border-line bg-surface leading-[1.65] text-fg sm:leading-[1.7]"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap break-words">
            {message.content}
          </span>
        ) : (
          (renderAiMessageContent(message.content) ?? (
            <span className="whitespace-pre-wrap break-words">
              {message.content}
            </span>
          ))
        )}
      </div>

      {isUser ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent sm:size-9">
          <FiUser size={14} className="sm:hidden" />
          <FiUser size={15} className="hidden sm:block" />
        </div>
      ) : null}
    </div>
  );
}
