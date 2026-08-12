"use client";

import LenaAvatar from "./LenaAvatar";

const DOT_DELAYS = ["0s", "0.16s", "0.32s"];

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 sm:gap-3">
      <LenaAvatar size={32} className="sm:hidden" />
      <LenaAvatar size={36} className="hidden sm:block" />

      <div className="rounded-lg rounded-es-sm border border-line bg-surface px-3 py-2.5 sm:px-4 sm:py-3">
        <p className="ui-label mb-2">لينا بتكتب...</p>
        <div className="flex items-center gap-1.5">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="size-2 rounded-full bg-accent motion-safe:animate-[typing-dot_0.7s_ease-in-out_infinite]"
              style={{ animationDelay: delay }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
