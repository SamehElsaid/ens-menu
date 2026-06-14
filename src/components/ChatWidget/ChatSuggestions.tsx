"use client";

import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { FiArrowUpLeft } from "react-icons/fi";

type Props = {
  suggestions: string[];
  onSelect: (text: string) => void;
  messageKey?: string;
};

export default function ChatSuggestions({
  suggestions,
  onSelect,
  messageKey,
}: Props) {
  const [sending, setSending] = useState<string | null>(null);

  const uniqueSuggestions = suggestions.filter(
    (item, index, arr) =>
      arr.findIndex((s) => s.trim().toLowerCase() === item.trim().toLowerCase()) ===
      index,
  );

  useEffect(() => {
    setSending(null);
  }, [messageKey, uniqueSuggestions.join("|")]);

  if (uniqueSuggestions.length === 0) return null;

  const handleSelect = (suggestion: string) => {
    if (sending) return;
    setSending(suggestion);
    onSelect(suggestion);
  };

  return (
    <div
      key={messageKey ?? uniqueSuggestions.join("|")}
      className="mt-2 flex flex-col gap-2 ps-0 sm:mt-3 sm:gap-2.5 sm:ps-11"
    >
      <p className="text-start text-[10px] font-medium text-slate-400 sm:text-[11px] dark:text-slate-500">
        اقتراحات من لينا ✨
      </p>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {uniqueSuggestions.map((suggestion) => {
          const isSending = sending === suggestion;

          return (
            <button
              key={`${messageKey ?? "s"}-${suggestion}`}
              type="button"
              disabled={!!sending}
              onClick={() => handleSelect(suggestion)}
              className={`group inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-2 text-start text-[11px] font-semibold shadow-sm transition-all duration-200 sm:px-3.5 sm:text-xs ${
                isSending
                  ? "cursor-wait border-accent-purple/50 bg-purple-50 text-accent-purple dark:border-purple-500/50 dark:bg-purple-500/15 dark:text-purple-300"
                  : "cursor-pointer border-accent-purple/25 bg-white text-slate-600 hover:scale-[1.04] hover:border-accent-purple/60 hover:bg-purple-50/90 hover:text-accent-purple hover:shadow-md hover:shadow-purple-500/10 active:scale-[0.97] dark:border-purple-500/25 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-purple-500/50 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
              }`}
            >
              {isSending ? (
                <FaSpinner className="size-3 animate-spin text-accent-purple dark:text-purple-400" />
              ) : (
                <FiArrowUpLeft
                  size={12}
                  className="shrink-0 -rotate-45 text-accent-purple/50 transition-transform group-hover:text-accent-purple rtl:rotate-90 dark:group-hover:text-purple-400"
                />
              )}
              <span className="truncate">{suggestion}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
