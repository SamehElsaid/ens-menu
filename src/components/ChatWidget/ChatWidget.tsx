"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiSend, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { ALLOWED_CONTACT } from "@/lib/lena/assistantConfig";
import { cn } from "@/lib/cn";
import { Alert, focusRing } from "@/components/ui";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
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

/** TEMP: hide Lena avatar FAB and link to WhatsApp support instead. */
const TEMP_WHATSAPP_FAB = true;

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
  const pathname = usePathname();
  const isAuthPage = pathname?.includes("/auth/");
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
    if (open || TEMP_WHATSAPP_FAB) {
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
            className="animate-chat-backdrop-in fixed inset-0 z-100 bg-overlay backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            role="dialog"
            aria-label="محادثة لينا"
            aria-modal="true"
            className="animate-chat-panel-in fixed inset-x-0 bottom-0 z-101 flex h-[min(92dvh,720px)] max-h-[92dvh] min-h-0 w-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-line bg-raised shadow-2xl sm:inset-x-auto sm:top-20 sm:end-6 sm:bottom-6 sm:h-auto sm:max-h-[calc(100dvh-6.5rem)] sm:w-[min(420px,calc(100vw-2rem))] sm:rounded-2xl sm:border"
          >
            {/* Mobile drag handle */}
            <div
              className="flex shrink-0 justify-center pt-2.5 pb-0 sm:hidden"
              aria-hidden
            >
              <span className="h-1 w-10 rounded-full bg-line-strong" />
            </div>

            {/* Header — an ink band with a rule at its base, not a gradient
                field: the panel's own edge is what separates it from the page. */}
            <div className="shrink-0 border-b border-line bg-brand text-on-brand">
              <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <LenaAvatar
                    size={36}
                    variant="onBrand"
                    className="sm:hidden"
                  />
                  <LenaAvatar
                    size={40}
                    variant="onBrand"
                    className="hidden sm:block"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold tracking-[-0.02em]">
                      لينا ✨
                    </p>
                    {/* Not `ui-label`: that class sets its own colour and it
                        would fall back to body ink on this band. */}
                    <p className="truncate text-[11px] tracking-[0.04em] text-on-brand/70">
                      مساعدة Ensmenu الذكية
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    "text-on-brand/80 transition-colors duration-(--dur-fast) hover:bg-on-brand/12 hover:text-on-brand sm:size-8",
                  )}
                >
                  <FiX size={20} className="sm:hidden" />
                  <FiX size={18} className="hidden sm:block" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-surface-2 px-3 py-4 [-webkit-overflow-scrolling:touch] sm:gap-5 sm:px-4 sm:py-5">
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
                />
              )}

              {error && <Alert tone="danger">{error}</Alert>}

              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-line bg-surface px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-3">
              {/* `ui-field` takes the brand border and its halo on focus, so the
                  composer reports focus the same way every other field does. */}
              <div className="ui-field flex items-end gap-2 rounded-lg border border-line-control bg-surface p-1.5 sm:p-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="اكتب رسالتك..."
                  className="max-h-24 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-start text-base leading-snug text-fg outline-none placeholder:text-fg-subtle disabled:opacity-50 sm:max-h-28 sm:min-h-[42px] sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className={cn(
                    "mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg sm:size-10",
                    "bg-brand text-on-brand transition-colors duration-(--dur-fast) hover:bg-brand-hover",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    focusRing,
                  )}
                >
                  <FiSend size={18} className="sm:hidden" />
                  <FiSend size={16} className="hidden sm:block" />
                </button>
              </div>
              <p className="ui-label mt-2 hidden text-center sm:block">
                Powered by Ensmenu
              </p>
            </div>
          </div>
        </>
      )}

      {!open && (
        <div
          className={cn(
            "chat-widget-fab fixed end-4 z-102 overflow-visible sm:end-6 sm:bottom-6",
            isAuthPage
              ? "bottom-[max(5.25rem,env(safe-area-inset-bottom))] size-12 sm:size-14"
              : "bottom-[max(1rem,env(safe-area-inset-bottom))] size-14",
          )}
        >
          {teaserVisible && (
            <div
              role="status"
              className={cn(
                "animate-contact-picker-in pointer-events-auto absolute end-0 bottom-[calc(100%+0.75rem)] w-[min(260px,calc(100vw-5.5rem))]",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setTeaserVisible(false);
                  setOpen(true);
                }}
                className="w-full rounded-lg border border-line bg-raised px-3.5 py-3 text-start text-[13px] leading-snug font-medium text-fg shadow-lg transition-colors duration-(--dur-fast) hover:bg-surface-2"
              >
                {teaserMessages[teaserIndex]}
              </button>
              <button
                type="button"
                onClick={() => setTeaserVisible(false)}
                aria-label={t("dismissTeaser")}
                className="absolute -top-1.5 -start-1.5 flex size-6 items-center justify-center rounded-full border border-line bg-raised text-fg-muted shadow-lg transition-colors duration-(--dur-fast) hover:bg-surface-2 hover:text-fg"
              >
                <FiX size={12} />
              </button>
            </div>
          )}

          {TEMP_WHATSAPP_FAB ? (
            <div className="whatsapp-fab-wrap animate-whatsapp-fab-in">
              <span className="whatsapp-fab-ripple" aria-hidden />
              <span
                className="whatsapp-fab-ripple whatsapp-fab-ripple--delay"
                aria-hidden
              />
              <a
                href={ALLOWED_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("contactWhatsApp")}
                className={cn(
                  /* WhatsApp green on the WhatsApp glyph — the one sanctioned
                     third-party hue. */
                  "whatsapp-fab-btn relative flex items-center justify-center rounded-full border-2 border-surface bg-[#25D366] text-white",
                  isAuthPage ? "size-12 sm:size-14" : "size-14",
                )}
              >
                <FaWhatsapp
                  className={
                    isAuthPage ? "text-2xl sm:text-[1.75rem]" : "text-[1.75rem]"
                  }
                  aria-hidden
                />
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("openChat")}
              className={cn(
                "relative size-14 overflow-hidden rounded-full border-2 border-surface bg-surface shadow-lg",
                focusRing,
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/AiAvatar.webp"
                alt="لينا"
                className="size-full object-cover object-center"
              />
              {/* Live, so it is the accent — and it is a filled dot with a
                  surface ring, which reads without relying on the hue. */}
              <span
                aria-hidden
                className="absolute -top-0.5 -end-0.5 size-3 rounded-full bg-accent ring-2 ring-surface"
              />
            </button>
          )}
        </div>
      )}
    </>
  );

  if (!mounted) return null;

  return createPortal(ui, document.body);
}
