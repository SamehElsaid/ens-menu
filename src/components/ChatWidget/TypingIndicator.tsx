"use client";

import LenaAvatar from "./LenaAvatar";

const DOT_DELAYS = ["0s", "0.16s", "0.32s"];

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 sm:gap-3">
      <LenaAvatar size={32} className="sm:hidden" />
      <LenaAvatar size={36} className="hidden sm:block" />

      <div className="rounded-2xl rounded-bl-md border border-slate-100/90 bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3 dark:border-slate-700/60 dark:bg-[#161b22]">
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          لينا بتكتب...
        </p>
        <div className="flex items-center gap-1.5">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="size-2 rounded-full bg-purple-400 motion-safe:animate-[typing-dot_0.7s_ease-in-out_infinite] dark:bg-purple-500"
              style={{ animationDelay: delay }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
