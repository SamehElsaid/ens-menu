"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FiSend, FiX } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { useChatSession } from "@/hooks/useChatSession";
import {
  sendChatMessage,
  type ChatMessage as ChatMessageType,
} from "@/services/chatApi";
import ChatMessageBubble from "./ChatMessage";
import ChatSuggestions from "./ChatSuggestions";
import LenaAvatar from "./LenaAvatar";
import { getChatSuggestions } from "./suggestionEngine";
import TypingIndicator from "./TypingIndicator";

const TEASER_INTERVAL_MS = 10_000;
const TEASER_VISIBLE_MS = 7_000;
const TEASER_INITIAL_DELAY_MS = 5_000;

const WELCOME_MESSAGE: ChatMessageType = {
  id: "welcome",
  role: "assistant",
  content:
    "أهلاً 👋\nأنا لينا ✨ مساعدة Ensmenu\n\nأقدر أساعدك في الأسعار، المنيو الرقمي، أو تبدأ بسرعة 🍽️",
  timestamp: new Date(),
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const sessionId = useChatSession();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const t = useTranslations("chatWidget");

  const teaserMessages = [t("teaser1"), t("teaser2"), t("teaser3")];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setTeaserVisible(false);
      return;
    }

    if (document.visibilityState === "hidden") return;

    let hideTimer: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    const showTeaser = () => {
      if (document.visibilityState === "hidden") return;
      setTeaserVisible(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setTeaserVisible(false);
        setTeaserIndex((i) => (i + 1) % teaserMessages.length);
      }, TEASER_VISIBLE_MS);
    };

    const initialTimer = setTimeout(() => {
      showTeaser();
      intervalId = setInterval(showTeaser, TEASER_INTERVAL_MS);
    }, TEASER_INITIAL_DELAY_MS);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearInterval(intervalId);
    };
  }, [open, teaserMessages.length, locale]);

  useEffect(() => {
    if (open && !welcomeShown) {
      setMessages([WELCOME_MESSAGE]);
      setWelcomeShown(true);
    }
  }, [open, welcomeShown]);

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const suggestions = getChatSuggestions(messages);
  const showSuggestions =
    !loading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, suggestions]);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !sessionId || loading) return;

      const userMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const reply = await sendChatMessage(trimmed, sessionId);

        if (reply?.trim()) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: reply.trim(),
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.error("[Chat] send failed:", err);
        setError("تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    },
    [sessionId, loading],
  );

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ui = (
    <>
      {open && (
        <>
          <div
            className="animate-chat-backdrop-in fixed inset-0 z-100 bg-black/45 backdrop-blur-[3px] sm:bg-black/25"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            role="dialog"
            aria-label="محادثة لينا"
            aria-modal="true"
            dir={isRTL ? "rtl" : "ltr"}
            className="animate-chat-panel-in fixed inset-x-0 bottom-0 z-101 flex h-[min(92dvh,720px)] max-h-[92dvh] min-h-0 w-full flex-col overflow-hidden rounded-t-[1.35rem] border border-b-0 border-slate-200/80 bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.18)] dark:border-slate-700/80 dark:bg-[#0d1117] sm:inset-x-auto sm:top-20 sm:right-6 sm:bottom-6 sm:h-auto sm:max-h-[calc(100dvh-6.5rem)] sm:w-[min(420px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.22)]"
          >
            {/* Mobile drag handle */}
            <div
              className="flex shrink-0 justify-center pt-2.5 pb-0 sm:hidden"
              aria-hidden
            >
              <span className="h-1 w-10 rounded-full bg-slate-300/90 dark:bg-slate-600" />
            </div>

            {/* Header */}
            <div className="relative shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-accent-purple/95 via-[#7c3aed]/90 to-deep-indigo/95" />
              <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white opacity-15 blur-2xl" />
              <div className="relative flex items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <LenaAvatar
                    size={40}
                    glow
                    variant="onGradient"
                    className="sm:hidden"
                  />
                  <LenaAvatar
                    size={44}
                    glow
                    variant="onGradient"
                    className="hidden sm:block"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold tracking-tight text-white sm:text-[15px]">
                      لينا ✨
                    </p>
                    <p className="truncate text-[11px] font-medium text-white/75 sm:text-xs">
                      مساعدة Ensmenu الذكية
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-[0.92] sm:size-8"
                >
                  <FiX size={20} className="sm:hidden" />
                  <FiX size={18} className="hidden sm:block" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-slate-50/40 px-3 py-4 [-webkit-overflow-scrolling:touch] sm:gap-5 sm:px-4 sm:py-5 dark:bg-[#0d1117]/50">
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}

              {loading && <TypingIndicator />}

              {showSuggestions && (
                <ChatSuggestions
                  key={lastAssistantMessage?.id}
                  messageKey={lastAssistantMessage?.id}
                  suggestions={suggestions}
                  onSelect={sendMessage}
                  isRTL={isRTL}
                />
              )}

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </p>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-slate-200/70 bg-white/95 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-3 dark:border-slate-700/70 dark:bg-[#0d1117]/95">
              <div className="flex items-end gap-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm transition-all duration-200 focus-within:border-accent-purple/35 focus-within:shadow-md focus-within:shadow-purple-500/8 sm:p-2 dark:border-slate-700/80 dark:bg-slate-800/50 dark:focus-within:border-purple-500/35">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="اكتب رسالتك..."
                  className="max-h-24 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-base leading-snug text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50 sm:max-h-28 sm:min-h-[42px] sm:text-sm dark:text-slate-200 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-accent-purple to-deep-indigo text-white shadow-md shadow-purple-500/25 transition-transform active:scale-[0.92] disabled:cursor-not-allowed disabled:opacity-35 sm:size-10 sm:hover:scale-[1.05]"
                >
                  <FiSend size={18} className="sm:hidden" />
                  <FiSend size={16} className="hidden sm:block" />
                </button>
              </div>
              <p className="mt-1.5 hidden text-center text-[10px] font-medium tracking-wide text-slate-400 sm:block dark:text-slate-600">
                Powered by Ensmenu
              </p>
            </div>
          </div>
        </>
      )}

      {!open && (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-102 size-14 overflow-visible sm:bottom-6 sm:right-6">
          {teaserVisible && (
            <div
              role="status"
              className="animate-contact-picker-in pointer-events-auto absolute bottom-[calc(100%+0.75rem)] right-0 w-[min(260px,calc(100vw-5.5rem))]"
            >
              <button
                type="button"
                onClick={() => {
                  setTeaserVisible(false);
                  setOpen(true);
                }}
                className="w-full rounded-2xl rounded-br-sm border border-slate-200/90 bg-white px-3.5 py-3 text-start text-[13px] leading-snug font-medium text-slate-700 shadow-lg shadow-slate-900/10 transition-colors hover:bg-purple-50/80 dark:border-slate-700/80 dark:bg-[#161b22] dark:text-slate-200 dark:hover:bg-purple-500/10"
              >
                {teaserMessages[teaserIndex]}
              </button>
              <button
                type="button"
                onClick={() => setTeaserVisible(false)}
                aria-label={t("dismissTeaser")}
                className="absolute -top-1.5 -left-1.5 flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <FiX size={12} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("openChat")}
            className="relative size-14 overflow-hidden rounded-full border-2 border-white shadow-lg shadow-purple-500/30 ring-2 ring-accent-purple/40 transition-transform hover:scale-105 active:scale-95 dark:border-slate-700 dark:ring-purple-500/30"
          >
            <Image
              src="/images/AiAvatar.png"
              alt="لينا"
              width={56}
              height={56}
              className="size-full object-cover object-center"
            />
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-accent-purple/90 ring-2 ring-white dark:ring-[#0d1117]"
            />
          </button>
        </div>
      )}
    </>
  );

  if (!mounted) return null;

  return createPortal(ui, document.body);
}
