"use client";

import { useEffect, useState } from "react";
import { FiArrowUpLeft } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { focusRing, Spinner } from "@/components/ui";

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
      arr.findIndex(
        (s) => s.trim().toLowerCase() === item.trim().toLowerCase(),
      ) === index,
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
      <p className="ui-label text-start">اقتراحات من لينا</p>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {uniqueSuggestions.map((suggestion) => {
          const isSending = sending === suggestion;

          return (
            <button
              key={`${messageKey ?? "s"}-${suggestion}`}
              type="button"
              disabled={!!sending}
              onClick={() => handleSelect(suggestion)}
              className={cn(
                "row-settle inline-flex max-w-full items-center gap-1.5 rounded-md border px-3 py-2 text-start text-[11px] font-semibold sm:px-3.5 sm:text-xs",
                focusRing,
                isSending
                  ? "cursor-wait border-brand-line bg-brand-soft text-brand-soft-fg"
                  : "cursor-pointer border-line bg-surface text-fg-muted hover:border-brand-line hover:bg-brand-soft hover:text-brand-soft-fg",
              )}
            >
              {isSending ? (
                <Spinner size="sm" />
              ) : (
                <FiArrowUpLeft
                  size={12}
                  className="shrink-0 -rotate-45 text-fg-subtle rtl:rotate-90"
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
