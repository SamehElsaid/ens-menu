"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiCheckCircle,
  FiGrid,
  FiSmartphone,
} from "react-icons/fi";
import HeroProductThumb from "@/components/HomePage/HeroProductThumb";
import { cn } from "@/lib/cn";

export type LiveFeature = {
  id: string;
  title: string;
  description: string;
};

export type LiveProduct = {
  name: string;
  orders: string;
  image: string;
};

export type LiveOpsHighlight = {
  id: string;
  title: string;
  description: string;
  showStatusLegend?: boolean;
};

export type LiveOrder = {
  id: string;
  items: string;
  time: string;
  status: OrderStatus;
};

export type OrderStatus = "new" | "progress" | "done";

export type OrderStatusLabels = {
  new: string;
  progress: string;
  done: string;
};

export type MobileFeature = {
  id: string;
  title: string;
};

export type MockOrderLabels = {
  badge: string;
  tableLabel: string;
  tableNumber: string;
  itemsLabel: string;
};

export type LiveRestaurantShowcaseProps = {
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  mobileTitle: string;
  mobileSubtitle: string;
  mobileSteps: [string, string, string];
  mobileFeatures: MobileFeature[];
  mockOrderLabels: MockOrderLabels;
  features: LiveFeature[];
  restaurantName: string;
  liveLabel: string;
  popularTitle: string;
  opsTitle: string;
  liveOrdersTitle: string;
  opsHighlights: LiveOpsHighlight[];
  statusLabels: OrderStatusLabels;
  products: LiveProduct[];
  orders: LiveOrder[];
  trustTagline: string;
};

const FEATURE_ICONS = {
  liveTracking: FiActivity,
  orderStatus: FiCheckCircle,
  kitchenAlerts: FiBell,
  tablesQr: FiGrid,
  liveStats: FiBarChart2,
} as const;

const MOBILE_FEATURE_ICONS = {
  liveUpdates: FiActivity,
  kitchenAlert: FiBell,
  statusControl: FiCheckCircle,
} as const;

const OPS_ICONS = {
  "1": FiActivity,
  "2": FiCheckCircle,
  "3": FiBell,
  "4": FiGrid,
  "5": FiBarChart2,
} as const;

/** Consistent icon treatment across the section */
const ICON_STROKE = 1.75;
const ICON_SIZE = 16;
const ICON_SIZE_SM = 14;

const CARD_SURFACE =
  "rounded-xl border border-purple-100/35 bg-white/80 shadow-[0_4px_24px_-16px_rgba(124,58,237,0.08)] backdrop-blur-sm dark:border-purple-500/10 dark:bg-white/[0.04] dark:shadow-[0_8px_32px_-18px_rgba(0,0,0,0.35)]";

const ORDER_STATUS_TONE = {
  new: "bg-sky-50/95 text-sky-600 ring-1 ring-sky-100/70 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/15",
  progress:
    "bg-orange-50/95 text-orange-600 ring-1 ring-orange-100/70 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/15",
  done: "bg-emerald-50/95 text-emerald-600 ring-1 ring-emerald-100/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/15",
} as const;

const LIVE_STATUS_BADGE =
  "inline-flex items-center gap-1 rounded-full bg-emerald-50/95 px-2 py-0.5 text-[9px] font-medium text-emerald-600 ring-1 ring-emerald-100/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/15";

function LiveIconBox({
  children,
  size = "md",
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-violet-50/70 text-purple-600 ring-1 ring-purple-100/50 dark:from-purple-500/12 dark:to-violet-500/8 dark:text-purple-400 dark:ring-purple-500/12",
        size === "sm" ? "h-8 w-8" : "h-9 w-9",
      )}
    >
      {children}
    </span>
  );
}

function LiveMintBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(LIVE_STATUS_BADGE, className)}>
      <span className="live-restaurant-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {children}
    </span>
  );
}

type ShowcaseSlice = Omit<
  LiveRestaurantShowcaseProps,
  | "badge"
  | "title"
  | "titleAccent"
  | "subtitle"
  | "mobileTitle"
  | "mobileSubtitle"
  | "trustTagline"
>;

function SectionHeader({
  badge,
  title,
  titleAccent,
  subtitle,
  mobile,
}: {
  badge: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  mobile?: boolean;
}) {
  return (
    <header
      className={cn(
        "mx-auto max-w-3xl text-center",
        mobile ? "mb-10 px-1 sm:mb-11" : "mb-9",
      )}
    >
      <span
        className={cn(
          "live-restaurant-badge inline-flex items-center gap-2 rounded-full border border-purple-100/60 bg-purple-50/80 px-3.5 py-1 text-[11px] font-medium text-purple-700 shadow-[0_2px_12px_-6px_rgba(124,58,237,0.12)] backdrop-blur-sm dark:border-purple-500/15 dark:bg-purple-500/8 dark:text-purple-300",
          mobile ? "mb-4" : "mb-3",
        )}
      >
        <span className="live-restaurant-live-dot h-1.5 w-1.5 rounded-full bg-purple-400" />
        {badge}
      </span>
      <h2
        className={cn(
          "font-bold leading-tight tracking-tight text-slate-900 dark:text-white",
          mobile ? "text-[1.35rem] leading-snug" : "text-[2rem] lg:text-[2.35rem]",
        )}
      >
        {mobile || !titleAccent ? (
          title
        ) : (
          <>
            {title}{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent rtl:bg-gradient-to-l dark:from-purple-400 dark:to-indigo-400">
              {titleAccent}
            </span>
          </>
        )}
      </h2>
      <p
        className={cn(
          "mx-auto max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400",
          mobile
            ? "mt-4 text-[14px] leading-[1.65]"
            : "mt-3 text-base lg:text-[17px]",
        )}
      >
        {subtitle}
      </p>
    </header>
  );
}

const STEP_CYCLE_MS = 2800;

function MobileStepFlow({
  steps,
  animate = true,
}: {
  steps: [string, string, string];
  animate?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!animate || reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % steps.length);
    }, STEP_CYCLE_MS);

    return () => window.clearInterval(interval);
  }, [animate, reduceMotion, steps.length]);

  const progress =
    steps.length > 1 ? activeIndex / (steps.length - 1) : 0;

  return (
    <div
      className="live-restaurant-steps-stage relative"
      style={{ "--step-progress": progress } as React.CSSProperties}
    >
      <div className="live-restaurant-steps-connector" aria-hidden>
        <div className="live-restaurant-steps-connector-track" />
        <div className="live-restaurant-steps-connector-fill" />
      </div>

      <ol className="live-restaurant-mobile-steps relative z-[1] grid grid-cols-3 gap-3">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;

          return (
            <li
              key={step}
              className={cn(
                "live-restaurant-step flex flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 text-center",
                isActive
                  ? "live-restaurant-step--active"
                  : "live-restaurant-step--idle",
              )}
            >
              <span
                className={cn(
                  "live-restaurant-step-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isActive
                    ? "live-restaurant-step-num--active"
                    : "live-restaurant-step-num--idle",
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "live-restaurant-step-label text-[10px] leading-snug",
                  isActive
                    ? "live-restaurant-step-label--active"
                    : "live-restaurant-step-label--idle",
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MobileCompactFeature({
  feature,
  index,
  visible,
}: {
  feature: MobileFeature;
  index: number;
  visible: boolean;
}) {
  const Icon =
    MOBILE_FEATURE_ICONS[feature.id as keyof typeof MOBILE_FEATURE_ICONS] ??
    FiActivity;

  return (
    <li
      className={cn(
        "live-feature-card live-restaurant-mobile-feature flex items-center gap-3 rounded-xl border border-purple-100/30 bg-white/70 px-3 py-2.5",
        "shadow-[0_2px_16px_-12px_rgba(124,58,237,0.1)] backdrop-blur-sm transition-[transform,box-shadow,background-color] duration-200",
        "active:scale-[0.99] active:bg-purple-50/40 dark:border-purple-500/10 dark:bg-white/[0.04] dark:active:bg-purple-500/8",
        visible && "live-feature-card--visible",
      )}
      style={{ transitionDelay: `${index * 70 + 120}ms` }}
    >
      <LiveIconBox size="sm">
        <Icon size={ICON_SIZE_SM} strokeWidth={ICON_STROKE} />
      </LiveIconBox>
      <p className="min-w-0 flex-1 text-start text-[12px] font-medium leading-snug text-slate-700 dark:text-slate-200">
        {feature.title}
      </p>
    </li>
  );
}

function FeatureCard({
  feature,
  visible,
  index,
  variant,
}: {
  feature: LiveFeature;
  visible: boolean;
  index: number;
  variant: "mobile" | "desktop";
}) {
  const Icon = FEATURE_ICONS[feature.id as keyof typeof FEATURE_ICONS] ?? FiActivity;
  const isMobile = variant === "mobile";

  return (
    <div
      className={cn(
        "live-feature-card flex gap-3.5",
        CARD_SURFACE,
        isMobile ? "live-feature-card--slide p-4" : "w-auto shrink-0 gap-3 p-3.5",
        visible && "live-feature-card--visible",
      )}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <LiveIconBox size={isMobile ? "md" : "sm"}>
        <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </LiveIconBox>
      <div className="min-w-0 flex-1 text-start">
        <p
          className={cn(
            "font-medium text-slate-800 dark:text-white",
            isMobile ? "text-[15px]" : "text-[14px]",
          )}
        >
          {feature.title}
        </p>
        <p
          className={cn(
            "mt-1 leading-relaxed text-slate-500 dark:text-slate-400",
            isMobile ? "text-[13px]" : "text-[12px]",
          )}
        >
          {feature.description}
        </p>
      </div>
    </div>
  );
}

function OrderStatusBadge({
  status,
  labels,
  compact,
}: {
  status: OrderStatus;
  labels: OrderStatusLabels;
  compact?: boolean;
}) {
  const label =
    status === "new"
      ? labels.new
      : status === "progress"
        ? labels.progress
        : labels.done;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-wide",
        ORDER_STATUS_TONE[status],
        compact ? "px-1.5 py-px text-[7.5px]" : "px-2 py-0.5 text-[9px]",
      )}
    >
      {label}
    </span>
  );
}

function StatusLegend({ labels }: { labels: OrderStatusLabels }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <OrderStatusBadge status="new" labels={labels} compact />
      <OrderStatusBadge status="progress" labels={labels} compact />
      <OrderStatusBadge status="done" labels={labels} compact />
    </div>
  );
}

function OpsHighlightsPanel({
  title,
  highlights,
  statusLabels,
  compact,
}: {
  title: string;
  highlights: LiveOpsHighlight[];
  statusLabels: OrderStatusLabels;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-purple-100/30 bg-slate-50/50 backdrop-blur-sm dark:border-purple-500/10 dark:bg-white/[0.03]",
        compact ? "p-3" : "p-4",
      )}
    >
      <p
        className={cn(
          "text-start font-semibold text-slate-700 dark:text-slate-200",
          compact ? "mb-2.5 text-[11px]" : "mb-3 text-[14px]",
        )}
      >
        {title}
      </p>
      <ul className={cn(compact ? "space-y-2" : "space-y-2.5")}>
        {highlights.map((item) => {
          const Icon = OPS_ICONS[item.id as keyof typeof OPS_ICONS] ?? FiActivity;

          return (
            <li
              key={item.id}
              className={cn(
                "flex gap-2 text-start",
                compact
                  ? "rounded-lg border border-purple-100/25 bg-white/80 px-2.5 py-2 dark:border-purple-500/8 dark:bg-white/[0.02]"
                  : "rounded-xl border border-purple-100/30 bg-white/80 px-3.5 py-3 dark:border-purple-500/10 dark:bg-white/[0.04]",
              )}
            >
              <LiveIconBox size={compact ? "sm" : "md"}>
                <Icon
                  size={compact ? ICON_SIZE_SM : ICON_SIZE}
                  strokeWidth={ICON_STROKE}
                />
              </LiveIconBox>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-semibold text-slate-800 dark:text-white",
                    compact ? "text-[10px]" : "text-[13px]",
                  )}
                >
                  {item.title}
                </p>
                {!compact ? (
                  <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                ) : null}
                {item.showStatusLegend ? (
                  <StatusLegend labels={statusLabels} />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MobileSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-purple-100/35 bg-white/85 p-4 backdrop-blur-md",
        "shadow-[0_6px_28px_-14px_rgba(124,58,237,0.1)]",
        "dark:border-purple-500/12 dark:bg-[#12151f]/90 dark:shadow-[0_10px_36px_-16px_rgba(124,58,237,0.15)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LiveRestaurantPhoneFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="live-restaurant-phone-stage">
      <div className="live-restaurant-phone">
        <div className="live-restaurant-phone-bezel">
          <div aria-hidden className="live-restaurant-phone-island-row">
            <span className="live-restaurant-phone-island" />
          </div>
          <div className="live-restaurant-phone-screen">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MobileOrderMockup({
  labels,
  order,
  statusLabels,
  liveLabel,
  visible,
}: {
  labels: MockOrderLabels;
  order: LiveOrder;
  statusLabels: OrderStatusLabels;
  liveLabel: string;
  visible: boolean;
}) {
  return (
    <LiveRestaurantPhoneFrame>
      <div className="live-restaurant-phone-order flex h-full min-h-0 flex-col">
        <div className="live-restaurant-phone-order-header shrink-0">
          <p className="live-restaurant-phone-order-title truncate text-start font-semibold text-slate-800 dark:text-white">
            {labels.badge}
          </p>
          <LiveMintBadge className="live-restaurant-live-badge--pulse live-restaurant-phone-live-badge shrink-0">
            {liveLabel}
          </LiveMintBadge>
        </div>

        <div
          className={cn(
            "live-restaurant-phone-order-body min-h-0 flex-1 text-start",
            visible && "live-order-row--visible",
          )}
        >
          <div className="live-restaurant-phone-order-glow">
            <div className="live-restaurant-phone-order-block live-restaurant-phone-order-block--table">
              <p className="live-restaurant-phone-order-label">
                {labels.tableLabel}
              </p>
              <p className="live-restaurant-phone-order-table-num tabular-nums">
                {labels.tableNumber}
              </p>
            </div>

            <div className="live-restaurant-phone-order-block live-restaurant-phone-order-block--items">
              <p className="live-restaurant-phone-order-label">
                {labels.itemsLabel}
              </p>
              <p className="live-restaurant-phone-order-items line-clamp-2">
                {order.items}
              </p>
            </div>

            <div className="live-restaurant-phone-order-footer">
              <p className="live-restaurant-phone-order-time">{order.time}</p>
              <OrderStatusBadge
                status={order.status}
                labels={statusLabels}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </LiveRestaurantPhoneFrame>
  );
}

function MobileShowcase({
  visible,
  ...props
}: ShowcaseSlice & { visible: boolean }) {
  const {
    mobileSteps,
    mobileFeatures,
    mockOrderLabels,
    statusLabels,
    orders,
    liveLabel,
  } = props;

  const primaryOrder = orders[0];

  return (
    <div className="live-restaurant-mobile flex flex-col pb-1">
      <div className="mb-9 sm:mb-10">
        <MobileStepFlow steps={mobileSteps} animate={visible} />
      </div>

      {primaryOrder ? (
        <div className="mb-10 flex justify-center">
          <MobileOrderMockup
            labels={mockOrderLabels}
            order={primaryOrder}
            statusLabels={statusLabels}
            liveLabel={liveLabel}
            visible={visible}
          />
        </div>
      ) : null}

      <ul className="live-restaurant-mobile-features grid gap-3 border-t border-purple-100/30 pt-7 dark:border-purple-500/10">
        {mobileFeatures.map((feature, index) => (
          <MobileCompactFeature
            key={feature.id}
            feature={feature}
            index={index}
            visible={visible}
          />
        ))}
      </ul>
    </div>
  );
}

function DesktopShowcase({
  visible,
  ...props
}: ShowcaseSlice & { visible: boolean }) {
  const {
    features,
    restaurantName,
    liveLabel,
    popularTitle,
    opsTitle,
    liveOrdersTitle,
    opsHighlights,
    statusLabels,
    products,
    orders,
  } = props;

  return (
    <div className="flex items-start gap-7 xl:gap-9">
      <div className="flex w-[17rem] shrink-0 flex-col gap-3 xl:w-[19rem]">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            visible={visible}
            index={index}
            variant="desktop"
          />
        ))}
      </div>

      <div className="live-dashboard-shell relative min-w-0 flex-1">
        <div
          className={cn(
            "live-dashboard relative overflow-hidden rounded-xl border",
            "border-purple-100/35 bg-white/90 shadow-[0_8px_36px_-18px_rgba(124,58,237,0.1)] backdrop-blur-sm",
            "dark:border-purple-500/12 dark:bg-[#0f1219]/95 dark:shadow-[0_12px_44px_-18px_rgba(124,58,237,0.14)]",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-purple-100/30 bg-gradient-to-b from-purple-50/30 to-transparent px-5 py-3 dark:border-purple-500/10 dark:from-purple-500/5">
            <p className="min-w-0 truncate text-start text-sm font-semibold text-slate-800 dark:text-white">
              {restaurantName}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <LiveMintBadge className="px-2.5 py-0.5 text-[10px]">
                {liveLabel}
              </LiveMintBadge>
              <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-violet-50/70 text-purple-600 ring-1 ring-purple-100/50 dark:from-purple-500/12 dark:to-violet-500/8 dark:text-purple-400 dark:ring-purple-500/12">
                <FiBell size={ICON_SIZE_SM} strokeWidth={ICON_STROKE} />
                <span className="absolute -top-0.5 -end-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
                  3
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4">
            <div className="rounded-xl border border-purple-100/30 bg-slate-50/40 p-3 backdrop-blur-sm dark:border-purple-500/10 dark:bg-white/[0.03]">
              <p className="mb-2.5 text-start text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {liveOrdersTitle}
              </p>
              <ul className="space-y-2">
                {orders.map((order, i) => (
                  <li
                    key={order.id}
                    className={cn(
                      "live-order-row rounded-lg border border-purple-100/25 bg-white/90 px-2.5 py-2 text-start shadow-[0_2px_12px_-10px_rgba(124,58,237,0.08)] dark:border-purple-500/8 dark:bg-white/[0.02]",
                      visible && "live-order-row--visible",
                    )}
                    style={{ transitionDelay: `${i * 120 + 200}ms` }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        {order.id}
                      </p>
                      <OrderStatusBadge
                        status={order.status}
                        labels={statusLabels}
                        compact
                      />
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                      {order.items}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-400">{order.time}</p>
                  </li>
                ))}
              </ul>
            </div>

            <OpsHighlightsPanel
              title={opsTitle}
              highlights={opsHighlights}
              statusLabels={statusLabels}
              compact
            />

            <div className="rounded-xl border border-purple-100/30 bg-slate-50/40 p-3 backdrop-blur-sm dark:border-purple-500/10 dark:bg-white/[0.03]">
              <p className="mb-2.5 text-start text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {popularTitle}
              </p>
              <ul className="space-y-2">
                {products.map((product) => (
                  <li
                    key={product.name}
                    className="flex items-center gap-2.5 text-start"
                  >
                    <HeroProductThumb src={product.image} alt={product.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-slate-800 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {product.orders}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveRestaurantShowcase(props: LiveRestaurantShowcaseProps) {
  const {
    badge,
    title,
    titleAccent,
    subtitle,
    mobileTitle,
    mobileSubtitle,
    trustTagline,
    ...slice
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", visible && "live-restaurant-visible")}>
      <div className="lg:hidden">
        <SectionHeader
          badge={badge}
          title={mobileTitle}
          subtitle={mobileSubtitle}
          mobile
        />
        <MobileShowcase visible={visible} {...slice} />
      </div>

      <div className="hidden lg:block">
        <SectionHeader
          badge={badge}
          title={title}
          titleAccent={titleAccent}
          subtitle={subtitle}
        />
        <DesktopShowcase visible={visible} {...slice} />
      </div>

      <p className="live-social-proof mx-auto mt-10 max-w-xl px-1 text-center text-[12px] font-medium leading-relaxed text-slate-500 lg:mt-10 lg:text-[13px] dark:text-slate-400">
        {trustTagline}
      </p>
    </div>
  );
}
