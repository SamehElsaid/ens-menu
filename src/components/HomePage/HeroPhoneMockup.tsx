"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheck, FiMinus, FiPlus } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import HeroProductThumb from "@/components/HomePage/HeroProductThumb";
import { formatMockPrice } from "@/components/HomePage/formatMockPrice";
import { cn } from "@/lib/cn";
import { isRtlLocale } from "@/lib/localeDirection";

export type HeroMockProduct = {
  id: string;
  name: string;
  priceAmount: number;
  image: string;
};

export type HeroChatTurn = {
  id: string;
  userMessage: string;
  linaMessage: string;
  products: HeroMockProduct[];
};

type HeroPhoneMockupProps = {
  businessName: string;
  turns: HeroChatTurn[];
  /** Shorter card for mobile hero — same demo, smaller footprint */
  compact?: boolean;
};

type QtyState = Record<string, number>;

type TurnPhase =
  | "user"
  | "typing"
  | "lina"
  | "products"
  | "qty"
  | "add"
  | "added"
  | "done";

const PHASE_ORDER: TurnPhase[] = [
  "user",
  "typing",
  "lina",
  "products",
  "qty",
  "add",
  "added",
  "done",
];

const PHASE_DURATIONS: Record<TurnPhase, number> = {
  user: 550,
  typing: 950,
  lina: 450,
  products: 500,
  qty: 420,
  add: 520,
  added: 1100,
  done: 650,
};

const LOOP_PAUSE_MS = 2400;
const BETWEEN_TURNS_MS = 700;

function phaseAtLeast(current: TurnPhase, min: TurnPhase): boolean {
  return PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(min);
}

function buildInitialQty(turns: HeroChatTurn[]): QtyState {
  const qty: QtyState = {};
  turns.forEach((turn) => {
    turn.products.forEach((p) => {
      qty[p.id] = 1;
    });
  });
  return qty;
}

function TypingDots() {
  return (
    <span className="hero-chat-typing inline-flex items-center gap-1 px-0.5">
      <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
      <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
      <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
    </span>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/90 p-0.5 shadow-sm shadow-slate-900/[0.03] dark:border-slate-700/50 dark:bg-slate-900/60">
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-25 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <FiMinus size={12} strokeWidth={2.5} />
      </button>
      <span className="min-w-[1.35rem] px-0.5 text-center text-[11px] font-semibold tabular-nums text-slate-800 dark:text-slate-100">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(Math.min(9, value + 1))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-500/15 dark:hover:text-purple-300"
      >
        <FiPlus size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function ProductRow({
  product,
  qty,
  showQty,
  formatPrice,
}: {
  product: HeroMockProduct;
  qty: number;
  showQty: boolean;
  formatPrice: (n: number) => string;
}) {
  const lineTotal = product.priceAmount * qty;

  return (
    <div className="grid grid-cols-[2.75rem_1fr] gap-x-3 gap-y-2">
      <div className="relative row-span-2 self-start">
        <HeroProductThumb src={product.image} alt={product.name} />
        {showQty && qty > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700/90 px-1 text-[9px] font-semibold text-white dark:bg-slate-300 dark:text-slate-900">
            ×{qty}
          </span>
        )}
      </div>

      <p className="col-start-2 self-end text-[13px] font-medium leading-snug text-slate-800 dark:text-slate-100">
        {product.name}
      </p>

      {showQty && (
        <div className="hero-chat-animate-in col-start-2 flex items-center justify-between gap-2">
          <QuantityStepper value={qty} onChange={() => {}} />
          <p className="shrink-0 text-[12px] font-semibold tabular-nums text-slate-900 dark:text-white">
            {formatPrice(qty > 1 ? lineTotal : product.priceAmount)}
          </p>
        </div>
      )}
    </div>
  );
}

function RecommendationBlock({
  products,
  quantities,
  phase,
  formatPrice,
  subtotalLabel,
  addLabel,
  addedLabel,
}: {
  products: HeroMockProduct[];
  quantities: QtyState;
  phase: TurnPhase;
  formatPrice: (n: number) => string;
  subtotalLabel: (amount: string) => string;
  addLabel: string;
  addedLabel: string;
}) {
  const showQty = phaseAtLeast(phase, "qty");
  const showAdd = phaseAtLeast(phase, "add");
  const isAdded = phaseAtLeast(phase, "added");

  const subtotal = products.reduce(
    (sum, p) => sum + p.priceAmount * (quantities[p.id] ?? 1),
    0,
  );

  return (
    <div className="mt-2.5 space-y-2.5 border-t border-slate-200/30 pt-2.5 dark:border-slate-700/30">
      <div className="space-y-3.5">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="hero-chat-animate-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <ProductRow
              product={product}
              qty={quantities[product.id] ?? 1}
              showQty={showQty}
              formatPrice={formatPrice}
            />
          </div>
        ))}
      </div>

      {showAdd && (
        <p className="hero-chat-animate-in text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {subtotalLabel(formatPrice(subtotal))}
        </p>
      )}

      {showAdd && (
        <button
          type="button"
          disabled={isAdded}
          className={cn(
            "hero-chat-animate-in flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition-all",
            isAdded
              ? "text-emerald-600 dark:text-emerald-400"
              : "border border-purple-200/70 bg-purple-50/40 text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/5 dark:text-purple-300",
          )}
        >
          {isAdded ? (
            <>
              <FiCheck size={12} strokeWidth={2.5} />
              {addedLabel}
            </>
          ) : (
            addLabel
          )}
        </button>
      )}
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-chat-animate-in flex justify-end">
      <p className="max-w-[88%] rounded-2xl rounded-ee-md bg-slate-800/95 px-3 py-2 text-[12px] leading-snug text-white dark:bg-slate-700">
        {children}
      </p>
    </div>
  );
}

function LinaAvatar({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "lg" ? "h-11 w-11" : size === "md" ? "h-8 w-8" : "h-7 w-7";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/20 ring-offset-1 ring-offset-[#fafaf9] dark:ring-offset-[#0f1115]",
        sizeClass,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/AiAvatar.png"
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function LinaBubble({
  assistantName,
  children,
  recommendation,
  isTyping,
  animateIn,
}: {
  assistantName: string;
  children?: React.ReactNode;
  recommendation?: React.ReactNode;
  isTyping?: boolean;
  animateIn?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        animateIn && !isTyping && "hero-chat-animate-in",
      )}
    >
      <LinaAvatar size="md" />
      <div className="min-w-0 max-w-[94%] flex-1 text-start">
        <p className="mb-1 text-[11px] font-semibold text-purple-600/90 dark:text-purple-400/90">
          {assistantName}
        </p>
        {isTyping ? (
          <div className="hero-chat-animate-in inline-flex rounded-2xl rounded-es-md bg-slate-100/90 px-3.5 py-2.5 dark:bg-slate-800/50">
            <TypingDots />
          </div>
        ) : (
          <>
            {children && (
              <p className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-200">
                {children}
              </p>
            )}
            {recommendation && (
              <div className="mt-2 border-s border-purple-200/50 ps-2.5 dark:border-purple-500/20">
                {recommendation}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function HeroPhoneMockup({
  businessName,
  turns,
  compact = false,
}: HeroPhoneMockupProps) {
  const t = useTranslations("heroSection");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const formatPrice = useCallback(
    (amount: number) => formatMockPrice(amount, isRtl),
    [isRtl],
  );

  const subtotalLabel = useCallback(
    (amount: string) => t("mockChat.subtotalLine", { amount }),
    [t],
  );

  const [quantities] = useState<QtyState>(() => buildInitialQty(turns));
  const [addedTurns, setAddedTurns] = useState<Set<string>>(new Set());
  const [turnIndex, setTurnIndex] = useState(0);
  const [phase, setPhase] = useState<TurnPhase>("user");
  const [loopId, setLoopId] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (phase !== "added") return;
    const turnId = turns[turnIndex]?.id;
    if (!turnId) return;
    setAddedTurns((prev) => new Set(prev).add(turnId));
  }, [phase, turnIndex, turns]);

  useEffect(() => {
    const duration = reduceMotion ? 120 : PHASE_DURATIONS[phase];

    const timer = window.setTimeout(() => {
      if (phase === "done") {
        if (turnIndex < turns.length - 1) {
          window.setTimeout(
            () => {
              setTurnIndex((i) => i + 1);
              setPhase("user");
            },
            reduceMotion ? 0 : BETWEEN_TURNS_MS,
          );
          return;
        }

        window.setTimeout(
          () => {
            setAddedTurns(new Set());
            setTurnIndex(0);
            setPhase("user");
            setLoopId((id) => id + 1);
          },
          reduceMotion ? 200 : LOOP_PAUSE_MS,
        );
        return;
      }

      const nextIndex = PHASE_ORDER.indexOf(phase) + 1;
      const nextPhase = PHASE_ORDER[nextIndex];
      if (nextPhase) setPhase(nextPhase);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [phase, turnIndex, turns.length, reduceMotion, loopId]);

  const cartItemCount = useMemo(() => {
    let count = 0;
    turns.forEach((turn) => {
      if (!addedTurns.has(turn.id)) return;
      turn.products.forEach((p) => {
        count += quantities[p.id] ?? 1;
      });
    });
    return count;
  }, [turns, addedTurns, quantities]);

  return (
    <div
      className={cn(
        "hero-lina-chat-mockup relative mx-auto w-full shrink-0 overflow-visible",
        compact && "hero-lina-chat-mockup--compact",
        compact
          ? "h-[min(360px,72vw)] max-w-[280px] sm:h-[400px] sm:max-w-[300px] lg:max-w-[400px]"
          : "h-[440px] max-w-[320px] sm:h-[480px] sm:max-w-[350px]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-b from-purple-400/[0.08] via-purple-400/[0.02] to-transparent blur-xl sm:-inset-4 lg:-inset-5"
      />

      <div className="hero-lina-chat-card flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-slate-200/60 bg-[#fafaf9] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_16px_40px_-14px_rgba(15,23,42,0.1)] dark:border-slate-800/70 dark:bg-[#0f1115]">
        <header
          className={cn(
            "shrink-0 border-b border-purple-100/50 bg-linear-to-b from-purple-50/40 to-white/80 px-3 py-2 dark:border-purple-500/10 dark:from-purple-500/5 dark:to-slate-900/40 sm:px-3.5 sm:py-2.5",
            compact ? "h-[60px] sm:h-[68px] lg:h-[76px]" : "h-[72px]",
          )}
        >
          <div className="flex h-full items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 text-start">
              <div className="relative">
                <LinaAvatar size="lg" />
                <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0f1115]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold tracking-tight text-slate-900 dark:text-white">
                  {t("mockChat.assistantName")}
                </p>
                <p className="text-[10px] font-medium text-purple-600/80 dark:text-purple-400/90">
                  {t("mockChat.status")}
                </p>
              </div>
            </div>
            <div className="flex h-10 shrink-0 flex-col justify-center text-end">
              <p className="truncate text-[9px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {businessName}
              </p>
              <p
                className={cn(
                  "mt-0.5 min-h-3.5 text-[10px] leading-snug text-slate-500 transition-opacity duration-300 dark:text-slate-400",
                  cartItemCount > 0
                    ? "hero-chat-animate-in opacity-100"
                    : "opacity-0 lg:invisible",
                )}
                aria-hidden={cartItemCount === 0}
              >
                {t("mockChat.itemsInCart", { count: cartItemCount || 0 })}
              </p>
            </div>
          </div>
        </header>

        <div className="hero-chat-scroll min-h-0 flex-1 space-y-3.5 overflow-hidden overscroll-none px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {turns.map((turn, index) => {
            if (index !== turnIndex) return null;

            const effectivePhase = phase;

            const showUser = phaseAtLeast(effectivePhase, "user");
            const showTyping =
              index === turnIndex && effectivePhase === "typing";
            const showLina =
              phaseAtLeast(effectivePhase, "lina") && !showTyping;
            const showProducts = phaseAtLeast(effectivePhase, "products");

            if (!showUser && !showTyping && !showLina) return null;

            return (
              <div key={`${turn.id}-${loopId}`} className="space-y-2.5">
                {showUser && <UserBubble>{turn.userMessage}</UserBubble>}

                {(showTyping || showLina) && (
                  <LinaBubble
                    assistantName={t("mockChat.assistantName")}
                    isTyping={showTyping}
                    animateIn={showLina}
                    recommendation={
                      showLina && showProducts && turn.products.length > 0 ? (
                        <RecommendationBlock
                          products={turn.products}
                          quantities={quantities}
                          phase={effectivePhase}
                          formatPrice={formatPrice}
                          subtotalLabel={subtotalLabel}
                          addLabel={t("mockChat.addToCart")}
                          addedLabel={t("mockChat.addedToCart")}
                        />
                      ) : undefined
                    }
                  >
                    {showLina ? turn.linaMessage : undefined}
                  </LinaBubble>
                )}
              </div>
            );
          })}
        </div>

        <footer
          className={cn(
            "shrink-0 border-t border-slate-200/40 px-3 py-2 dark:border-slate-800/50",
            compact ? "h-[44px] sm:h-[48px] lg:h-[52px]" : "h-[52px]",
          )}
        >
          <div
            aria-hidden
            className="flex h-full items-center gap-2 rounded-lg bg-slate-100/60 px-2.5 py-1.5 dark:bg-slate-900/40"
          >
            <span className="flex-1 text-start text-[11px] text-slate-400">
              {t("mockChat.inputPlaceholder")}
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-purple-500/50">
              ↑
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
