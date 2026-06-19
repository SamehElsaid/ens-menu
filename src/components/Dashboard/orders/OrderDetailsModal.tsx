"use client";

import { useLocale, useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import { IoCalendarOutline, IoCallOutline, IoChatboxOutline, IoCheckmarkCircle, IoCloseCircle, IoCloseOutline, IoEllipseSharp, IoHomeOutline, IoListOutline, IoLocationOutline, IoPersonOutline, IoReceiptOutline, IoTimeOutline } from "react-icons/io5";
import {
  actionActorName,
  callItemOptionLabel,
  deliveryGovernorateLabel,
  isGuestOrderAction,
  lastStaffWaiterName,
  orderActionLabel,
  resolveLatestOrderStatus,
  type CallEntry,
  type CallEntryDetail,
  type CallItem,
  type EntryAction,
  type EntryOrder,
} from "@/lib/tableOrders";
import OrderActionButtons from "./OrderActionButtons";

function StatusIcon({ status }: { status: string }) {
  if (status === "confirmed" || status === "delivered")
    return <IoCheckmarkCircle className="text-green-500 text-lg shrink-0" />;
  if (status === "cancelled")
    return <IoCloseCircle className="text-red-500 text-lg shrink-0" />;
  if (status === "prepared")
    return <IoCheckmarkCircle className="text-sky-500 text-lg shrink-0" />;
  return <IoEllipseSharp className="text-amber-500 text-[10px] shrink-0" />;
}

function ModalSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-4 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-2/5 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="mt-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    </div>
  );
}

function ActionDot({ status }: { status: string }) {
  const lc = status.toLowerCase();
  if (lc === "confirmed" || lc === "delivered")
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 ring-4 ring-white dark:ring-slate-900">
        <IoCheckmarkCircle className="text-green-500 text-lg" />
      </span>
    );
  if (lc === "cancelled")
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 ring-4 ring-white dark:ring-slate-900">
        <IoCloseCircle className="text-red-500 text-lg" />
      </span>
    );
  if (lc === "prepared")
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40 ring-4 ring-white dark:ring-slate-900">
        <IoCheckmarkCircle className="text-sky-500 text-lg" />
      </span>
    );
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 ring-4 ring-white dark:ring-slate-900">
      <IoTimeOutline className="text-amber-500 text-base" />
    </span>
  );
}

function ActionsTimeline({
  actions,
  locale,
  t,
  order,
}: {
  actions: EntryAction[];
  locale: string;
  t: ReturnType<typeof useTranslations<"tableOrders">>;
  order?: EntryOrder | null;
}) {
  return (
    <ol className="relative space-y-0">
      {actions.map((act, idx) => {
        const isLast = idx === actions.length - 1;
        const actorName = actionActorName(act, order);
        const actorLabel = isGuestOrderAction(act)
          ? t("detailsCustomer")
          : t("colWaiter");
        const summary =
          locale === "ar"
            ? (act.summaryAr ?? act.summaryEn ?? null)
            : (act.summaryEn ?? act.summaryAr ?? null);
        const lc = act.status?.toLowerCase() ?? "";
        const pillCls =
          lc === "confirmed" || lc === "delivered"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : lc === "cancelled"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : lc === "prepared"
                ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";

        return (
          <li key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <ActionDot status={act.status ?? ""} />
              {!isLast && (
                <div className="mt-1 flex-1 w-px min-h-6 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>

            <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {orderActionLabel(act.action ?? "", locale)}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${pillCls}`}
                >
                  {t(`orderStatus.${lc}` as never)}
                </span>
              </div>

              {actorName && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <IoPersonOutline className="shrink-0" />
                  <span className="text-slate-400 dark:text-slate-500">
                    {actorLabel}:
                  </span>
                  {actorName}
                </p>
              )}

              <time className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {act.time ? <ViewTime data={act.time} /> : "—"}
              </time>

              {summary && (
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
                  {summary}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DetailRow({
  icon,
  label,
  value,
  href,
  multiline = false,
  emptyLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode | null | undefined;
  href?: string;
  multiline?: boolean;
  emptyLabel?: string;
}) {
  const hasValue =
    value != null && (typeof value !== "string" || value.trim() !== "");

  return (
    <div
      className={`flex gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3 dark:border-slate-700/80 dark:bg-slate-900/50 ${
        multiline ? "items-start" : "items-center"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800 ${
          multiline ? "mt-0.5" : ""
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </p>
        {hasValue ? (
          href ? (
            <a
              href={href}
              className="mt-0.5 block text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300"
              dir="ltr"
            >
              {value}
            </a>
          ) : (
            <p
              className={`mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100 ${
                multiline ? "whitespace-pre-wrap leading-relaxed" : "truncate"
              }`}
            >
              {value}
            </p>
          )
        ) : (
          <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
            {emptyLabel ?? "—"}
          </p>
        )}
      </div>
    </div>
  );
}

function OrderCustomerSection({
  variant,
  t,
  customerDisplay,
  phoneDisplay,
  zoneLabel,
  addressDisplay,
  notesDisplay,
  tableNumber,
  deliveryFee,
  currency,
  when,
}: {
  variant: "table" | "delivery";
  t: ReturnType<typeof useTranslations<"tableOrders" | "deliveryOrders">>;
  customerDisplay: string | null;
  phoneDisplay: string | null;
  zoneLabel: string | null;
  addressDisplay: string | null;
  notesDisplay: string | null;
  tableNumber?: string | null;
  deliveryFee?: number | null;
  currency: string;
  when: React.ReactNode;
}) {
  const phoneHref = phoneDisplay
    ? `tel:${phoneDisplay.replace(/[^\d+]/g, "")}`
    : undefined;
  const sectionTitle =
    variant === "delivery" ? t("deliveryDetailsTitle") : t("orderDetailsTitle");

  return (
    <section className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
        {sectionTitle}
      </h4>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <DetailRow
          icon={<IoPersonOutline className="text-fuchsia-500" />}
          label={t("detailsCustomer")}
          value={customerDisplay}
          emptyLabel={t("notProvided")}
        />
        <DetailRow
          icon={<IoCallOutline className="text-emerald-500" />}
          label={t("detailsPhone")}
          value={phoneDisplay}
          href={phoneHref}
          emptyLabel={t("notProvided")}
        />
        {variant === "delivery" ? (
          <DetailRow
            icon={<IoLocationOutline className="text-emerald-500" />}
            label={t("detailsZone")}
            value={zoneLabel}
            emptyLabel={t("notProvided")}
          />
        ) : (
          tableNumber &&
          String(tableNumber).trim() !== "" && (
            <DetailRow
              icon={<IoReceiptOutline className="text-violet-500" />}
              label={t("detailsTable")}
              value={tableNumber}
            />
          )
        )}
        <DetailRow
          icon={<IoCalendarOutline className="text-violet-500" />}
          label={t("detailsWhen")}
          value={when}
        />
      </div>

      {variant === "delivery" && (
        <DetailRow
          icon={<IoHomeOutline className="text-sky-500" />}
          label={t("detailsAddress")}
          value={addressDisplay}
          multiline
          emptyLabel={t("notProvided")}
        />
      )}

      <DetailRow
        icon={<IoChatboxOutline className="text-sky-500" />}
        label={t("detailsNotes")}
        value={notesDisplay}
        multiline
        emptyLabel={t("noNotes")}
      />

      {variant === "delivery" && deliveryFee != null && deliveryFee > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            {t("detailsDeliveryFee")}
          </span>
          <span className="text-base font-bold text-emerald-900 dark:text-emerald-100 tabular-nums">
            {deliveryFee}
            {currency && (
              <span className="ms-1 text-xs font-semibold">{currency}</span>
            )}
          </span>
        </div>
      )}
    </section>
  );
}

export default function OrderDetailsModal({
  entry,
  loading,
  currency,
  onClose,
  variant = "table",
  menuId,
  onActionComplete,
}: {
  entry: CallEntryDetail | null;
  loading: boolean;
  currency: string;
  onClose: () => void;
  variant?: "table" | "delivery";
  menuId?: string;
  onActionComplete?: () => void;
}) {
  const t = useTranslations(variant === "delivery" ? "deliveryOrders" : "tableOrders");
  const locale = useLocale();

  const actions = entry?.actions ?? [];
  const lastAction =
    actions.length > 0 ? actions[actions.length - 1] : undefined;

  const order =
    entry?.order ?? lastAction?.detail?.order ?? actions[0]?.detail?.order;

  const items: CallItem[] = entry?.items ?? order?.items ?? [];
  const totalPrice = entry?.totalPrice ?? order?.orderTotal ?? 0;
  const status = resolveLatestOrderStatus(actions, order);

  const summary =
    locale === "ar"
      ? (lastAction?.summaryAr ??
        lastAction?.summaryEn ??
        actions[0]?.summaryAr ??
        null)
      : (lastAction?.summaryEn ??
        lastAction?.summaryAr ??
        actions[0]?.summaryEn ??
        null);

  const customerDisplay =
    order?.customerName?.trim() ||
    (lastAction && isGuestOrderAction(lastAction)
      ? actionActorName(lastAction, order)
      : actions[0] && isGuestOrderAction(actions[0])
        ? actionActorName(actions[0], order)
        : "") ||
    null;
  const waiterDisplay = entry?.actions
    ? lastStaffWaiterName(entry.actions)
    : null;
  const zoneLabel =
    variant === "delivery"
      ? deliveryGovernorateLabel(
          { order: order ?? undefined, ...(entry ?? {}) },
          locale,
        )
      : null;
  const deliveryFee =
    variant === "delivery"
      ? order?.deliveryFee != null
        ? Number(order.deliveryFee)
        : entry?.deliveryFee != null
          ? Number(entry.deliveryFee)
          : null
      : null;
  const phoneDisplay =
    order?.customerPhone?.trim() || entry?.customerPhone?.trim() || null;
  const addressDisplay =
    order?.customerAddress?.trim() || entry?.customerAddress?.trim() || null;
  const notesDisplay =
    order?.orderNotes?.trim() || entry?.orderNotes?.trim() || null;
  const whenDisplay = (
    <ViewTime data={lastAction?.time ?? actions[0]?.time} />
  );

  const statusConfig = {
    confirmed: {
      pill: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 ring-1 ring-green-300/50",
      header:
        "from-green-500/10 to-emerald-500/5 dark:from-green-900/30 dark:to-emerald-900/10",
      border: "border-green-200/60 dark:border-green-700/40",
    },
    prepared: {
      pill: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 ring-1 ring-sky-300/50",
      header:
        "from-sky-500/10 to-cyan-500/5 dark:from-sky-900/30 dark:to-cyan-900/10",
      border: "border-sky-200/60 dark:border-sky-700/40",
    },
    delivered: {
      pill: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 ring-1 ring-violet-300/50",
      header:
        "from-violet-500/10 to-fuchsia-500/5 dark:from-violet-900/30 dark:to-fuchsia-900/10",
      border: "border-violet-200/60 dark:border-violet-700/40",
    },
    cancelled: {
      pill: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-300/50",
      header:
        "from-red-500/10 to-rose-500/5 dark:from-red-900/30 dark:to-rose-900/10",
      border: "border-red-200/60 dark:border-red-700/40",
    },
    pending: {
      pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-300/50",
      header:
        "from-violet-500/10 to-fuchsia-500/5 dark:from-violet-900/30 dark:to-fuchsia-900/10",
      border: "border-violet-200/60 dark:border-violet-700/40",
    },
  };
  const cfg =
    statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative bg-linear-to-br ${cfg.header} px-5 pt-5 pb-4 border-b ${cfg.border}`}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 sm:hidden" />

          <div className="flex items-start justify-between gap-3 mt-3 sm:mt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                <IoReceiptOutline className="text-2xl text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {t("detailsTitle")}
                </h3>
                {entry && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t("colOrderId")}&nbsp;
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      #{entry.orderId}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {entry && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.pill}`}
                >
                  <StatusIcon status={status} />
                  {t(`orderStatus.${status}` as never)}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <IoCloseOutline className="text-lg" />
              </button>
            </div>
          </div>

          {summary && (
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/50 pt-2">
              {summary}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <ModalSkeleton />
          ) : entry ? (
            <>
              <OrderCustomerSection
                variant={variant}
                t={t}
                customerDisplay={customerDisplay}
                phoneDisplay={phoneDisplay}
                zoneLabel={zoneLabel}
                addressDisplay={addressDisplay}
                notesDisplay={notesDisplay}
                tableNumber={order?.tableNumber}
                deliveryFee={deliveryFee}
                currency={currency}
                when={whenDisplay}
              />

              {waiterDisplay && (
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <DetailRow
                    icon={<IoPersonOutline className="text-violet-500" />}
                    label={t("colWaiter")}
                    value={waiterDisplay}
                  />
                </div>
              )}

              <div className="px-5 py-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                    {items.length}
                  </span>
                  {t("itemsTitle")}
                </h4>

                {items.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                    {t("itemsEmpty")}
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-2 rounded-t-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <span>{t("colItemName")}</span>
                      <span className="text-center">{t("colQty")}</span>
                      <span className="text-end">{t("colTotal")}</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border-x border-b border-slate-200 dark:border-slate-700 rounded-b-xl overflow-hidden">
                      {items.map((item, idx) => (
                        <div
                          key={`${item.menuItemId}-${idx}`}
                          className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-3 text-sm items-center odd:bg-white even:bg-slate-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-800/40 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                              {item.name}
                            </p>
                            {(item.size || item.variant) && (
                              <p className="text-[11px] text-violet-600 dark:text-violet-400 mt-0.5 truncate">
                                {[
                                  callItemOptionLabel(item.size, locale, "size"),
                                  callItemOptionLabel(
                                    item.variant,
                                    locale,
                                    "variant",
                                  ),
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                            {item.price != null && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {item.price}
                                {currency && (
                                  <span className="ms-0.5">{currency}</span>
                                )}{" "}
                                × {item.quantity}
                              </p>
                            )}
                          </div>
                          <span className="text-center min-w-8 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            ×{item.quantity}
                          </span>
                          <span className="text-end font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                            {item.total}
                            {currency && (
                              <span className="ms-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                                {currency}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl bg-linear-to-r from-violet-50 to-fuchsia-50/60 dark:from-violet-950/40 dark:to-fuchsia-950/20 border border-violet-200/60 dark:border-violet-700/40">
                      <span className="text-sm font-semibold text-violet-800 dark:text-violet-300">
                        {t("detailsTotal")}
                      </span>
                      <span className="text-lg font-bold text-violet-900 dark:text-violet-200 tabular-nums">
                        {totalPrice}
                        {currency && (
                          <span className="ms-1.5 text-sm font-semibold text-violet-700 dark:text-violet-400">
                            {currency}
                          </span>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {entry.actions && entry.actions.length > 0 && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <IoListOutline className="text-violet-500 text-base" />
                    {t("actionsTitle")}
                  </h4>
                  <ActionsTimeline
                    actions={entry.actions}
                    locale={locale}
                    t={t}
                    order={order}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 bg-slate-50/80 dark:bg-slate-900/80">
          {entry && menuId && onActionComplete && !loading && (
            <OrderActionButtons
              menuId={menuId}
              entry={entry as CallEntry}
              status={status}
              onComplete={onActionComplete}
              translationNs={variant === "delivery" ? "deliveryOrders" : "tableOrders"}
            />
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
