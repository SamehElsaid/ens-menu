"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import ViewTime from "@/shared/ViewTime";
import {
  IoAddOutline,
  IoCreateOutline,
  IoPersonOutline,
  IoPrintOutline,
  IoRemoveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import {
  actionActorName,
  callItemOptionLabel,
  deliveryGovernorateLabel,
  isEditableOrderStatus,
  isGuestOrderAction,
  lastStaffWaiterName,
  orderActionLabel,
  resolveLatestOrderStatus,
  type CallEntry,
  type CallEntryDetail,
  type CallItem,
  type EntryAction,
  type EntryOrder,
  type OrderActionResult,
  type OrderStatus,
} from "@/lib/tableOrders";
import { resolveOrderCharges } from "@/lib/menuOrderCharges";
import { patchTableOrderItems } from "@/lib/tableOrderActions";
import OrderActionButtons from "./OrderActionButtons";
import OrderAddItemPicker from "./OrderAddItemPicker";
import OrderChargesLines from "./OrderChargesLines";
import {
  OrderStatusBadge,
  orderStatusIcon,
  orderStatusTone,
} from "./orderStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { useAuthorization } from "@/hooks/useAuthorization";
import {
  Alert,
  Badge,
  Button,
  CountBadge,
  Modal,
  Skeleton,
  SkeletonRegion,
  statusTone,
} from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * The printed ticket.
 *
 * Styling stays inline and monochrome: `react-to-print` renders this subtree
 * outside the app's token cascade, and a receipt is read on thermal or office
 * paper where the product's hues either cost ink or vanish entirely.
 */
function PrintableReceipt({
  orderId,
  title,
  items,
  totalPrice,
  currency,
  customerDisplay,
  phoneDisplay,
  zoneLabel,
  addressDisplay,
  notesDisplay,
  tableNumber,
  deliveryFee,
  variant,
  locale,
  labels,
  ref,
}: {
  orderId?: string | number;
  title: string;
  items: CallItem[];
  totalPrice: number;
  currency: string;
  customerDisplay: string | null;
  phoneDisplay: string | null;
  zoneLabel: string | null;
  addressDisplay: string | null;
  notesDisplay: string | null;
  tableNumber?: string | null;
  deliveryFee?: number | null;
  variant: "table" | "delivery";
  locale: string;
  labels: {
    customer: string;
    phone: string;
    zone: string;
    address: string;
    table: string;
    notes: string;
    deliveryFee: string;
    total: string;
    itemName: string;
    qty: string;
    itemTotal: string;
  };
  ref: React.Ref<HTMLDivElement>;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";

  const infoRows: { label: string; value: string | null | undefined }[] = [
    { label: labels.customer, value: customerDisplay },
    { label: labels.phone, value: phoneDisplay },
  ];
  if (variant === "delivery") {
    infoRows.push({ label: labels.zone, value: zoneLabel });
    infoRows.push({ label: labels.address, value: addressDisplay });
  } else if (tableNumber && String(tableNumber).trim() !== "") {
    infoRows.push({ label: labels.table, value: tableNumber });
  }
  if (notesDisplay) {
    infoRows.push({ label: labels.notes, value: notesDisplay });
  }

  return (
    <div
      ref={ref}
      dir={dir}
      style={{
        fontFamily: "system-ui, -apple-system, Arial, sans-serif",
        fontSize: 13,
        color: "#111111",
        padding: 24,
        direction: dir,
      }}
    >
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        {title}
      </h1>
      <p style={{ color: "#555555", fontSize: 12, marginBottom: 20 }}>
        #{orderId ?? ""}
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {infoRows
            .filter((r) => r.value && String(r.value).trim() !== "")
            .map((r, i) => (
              <tr key={i}>
                <td
                  style={{
                    color: "#555555",
                    padding: "4px 8px",
                    whiteSpace: "nowrap",
                    textAlign: "start",
                  }}
                >
                  {r.label}
                </td>
                <td
                  style={{
                    padding: "4px 8px",
                    fontWeight: 600,
                    textAlign: "start",
                  }}
                >
                  {r.value}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <hr
        style={{
          border: "none",
          borderTop: "1px dashed #999999",
          margin: "16px 0",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th
              style={{
                padding: 8,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#555555",
                textAlign: "start",
                fontWeight: 600,
              }}
            >
              {labels.itemName}
            </th>
            <th
              style={{
                padding: 8,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#555555",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              {labels.qty}
            </th>
            <th
              style={{
                padding: 8,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#555555",
                textAlign: "end",
                fontWeight: 600,
              }}
            >
              {labels.itemTotal}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #dddddd" }}>
              <td style={{ padding: 8, textAlign: "start" }}>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                {(item.size || item.variant) && (
                  <>
                    <br />
                    <small style={{ color: "#555555" }}>
                      {[
                        callItemOptionLabel(item.size, locale, "size"),
                        callItemOptionLabel(item.variant, locale, "variant"),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </>
                )}
              </td>
              <td style={{ padding: 8, textAlign: "center" }}>
                ×{item.quantity}
              </td>
              <td style={{ padding: 8, textAlign: "end", fontWeight: 600 }}>
                {item.total != null ? `${item.total} ${currency}` : "—"}
              </td>
            </tr>
          ))}

          {variant === "delivery" && deliveryFee != null && deliveryFee > 0 && (
            <tr>
              <td
                colSpan={2}
                style={{
                  padding: 8,
                  fontWeight: 600,
                  textAlign: "start",
                }}
              >
                {labels.deliveryFee}
              </td>
              <td
                style={{
                  padding: 8,
                  fontWeight: 700,
                  textAlign: "end",
                }}
              >
                {deliveryFee} {currency}
              </td>
            </tr>
          )}

          <tr>
            <td
              colSpan={2}
              style={{
                padding: "10px 8px",
                borderTop: "2px solid #111111",
                fontWeight: 700,
                fontSize: 15,
                textAlign: "start",
              }}
            >
              {labels.total}
            </td>
            <td
              style={{
                padding: "10px 8px",
                borderTop: "2px solid #111111",
                fontWeight: 700,
                fontSize: 15,
                textAlign: "end",
              }}
            >
              {totalPrice} {currency}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ModalSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label} className="space-y-4 px-4 py-4 sm:px-5">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/5" />
      <div className="mt-6 space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-full" rounded="lg" />
        ))}
      </div>
    </SkeletonRegion>
  );
}

/**
 * A ruled block of the ticket.
 *
 * Sections share edges with their neighbours instead of each sitting in its
 * own panel: the dialog is already the surface, and nesting cards inside it
 * would be a second elevation doing the first one's job.
 */
function TicketSection({
  title,
  actions,
  children,
  className,
}: {
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("border-b border-line px-4 py-4 sm:px-5", className)}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[-0.02em] text-fg">
          {title}
        </h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

function TicketRow({
  label,
  value,
  href,
  block = false,
  emptyLabel,
}: {
  label: string;
  value: React.ReactNode | null | undefined;
  href?: string;
  /** Stacks the value under the label — for addresses and free text. */
  block?: boolean;
  emptyLabel?: string;
}) {
  const hasValue =
    value != null && (typeof value !== "string" || value.trim() !== "");

  const body = !hasValue ? (
    <span className="text-fg-subtle">{emptyLabel ?? "—"}</span>
  ) : href ? (
    <a
      href={href}
      dir="ltr"
      className="rounded underline-offset-2 transition-colors hover:text-accent hover:underline"
    >
      {value}
    </a>
  ) : (
    value
  );

  return (
    <div
      className={cn(
        "px-3 py-2",
        block
          ? "flex flex-col gap-0.5"
          : "flex items-baseline justify-between gap-3",
      )}
    >
      <dt className="ui-label shrink-0">{label}</dt>
      <dd
        className={cn(
          "min-w-0 text-[13px] text-fg",
          block ? "leading-relaxed whitespace-pre-wrap" : "truncate text-end",
        )}
      >
        {body}
      </dd>
    </div>
  );
}

function TicketRows({ children }: { children: React.ReactNode }) {
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-lg border border-line">
      {children}
    </dl>
  );
}

/**
 * The order's history.
 *
 * The markers used to be four saturated discs ringed in white, which made the
 * timeline the loudest region of a dialog whose point is the order. They are
 * now hairline-ruled tiles carrying the same glyph as the status badge, so the
 * column reads as a rail and the tone is a second signal rather than the only
 * one.
 */
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
    <ol className="flex flex-col">
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
        const tone = orderStatusTone(lc);

        return (
          <li key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md border text-[13px]",
                  statusTone[tone].soft,
                )}
                aria-hidden
              >
                {orderStatusIcon(lc)}
              </span>
              {!isLast ? (
                <span className="min-h-6 w-px flex-1 bg-line" aria-hidden />
              ) : null}
            </div>

            <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-4")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-fg">
                  {orderActionLabel(act.action ?? "", locale)}
                </span>
                {lc ? (
                  <Badge tone={tone}>{t(`orderStatus.${lc}` as never)}</Badge>
                ) : null}
              </div>

              {actorName ? (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
                  <IoPersonOutline className="shrink-0" aria-hidden />
                  <span className="ui-label">{actorLabel}</span>
                  {actorName}
                </p>
              ) : null}

              <time className="ui-label mt-1 block">
                {act.time ? <ViewTime data={act.time} /> : "—"}
              </time>

              {summary ? (
                <p className="mt-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs leading-relaxed text-fg-muted">
                  {summary}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
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
  onItemsUpdated,
}: {
  entry: CallEntryDetail | null;
  loading: boolean;
  currency: string;
  onClose: () => void;
  variant?: "table" | "delivery";
  menuId?: string;
  onActionComplete?: (result: OrderActionResult) => void;
  onItemsUpdated?: (
    entryId: string,
    items: CallItem[],
    orderTotal: number,
    status: OrderStatus,
  ) => void;
}) {
  const t = useTranslations(
    variant === "delivery" ? "deliveryOrders" : "tableOrders",
  );
  const locale = useLocale();
  const { can } = useAuthorization();

  const userData = useAppSelector((s) => s.auth.data);
  const menu = useAppSelector((s) => s.menuData.menu);
  const isPro = Boolean(userData) && !isFreePlanUser(userData);

  const [editingItems, setEditingItems] = useState(false);
  const [draftItems, setDraftItems] = useState<CallItem[]>([]);
  const [savingItems, setSavingItems] = useState(false);

  const actions = entry?.actions ?? [];
  const lastAction =
    actions.length > 0 ? actions[actions.length - 1] : undefined;

  const order =
    entry?.order ?? lastAction?.detail?.order ?? actions[0]?.detail?.order;

  const items: CallItem[] = entry?.items ?? order?.items ?? [];
  const status = resolveLatestOrderStatus(actions, order);
  const canEditItems =
    isEditableOrderStatus(status) && can("orders:edit_items");

  useEffect(() => {
    setEditingItems(false);
    if (entry) {
      setDraftItems(entry.items ?? entry.order?.items ?? []);
    }
  }, [entry]);

  const displayItems = editingItems ? draftItems : items;
  const deliveryFee =
    variant === "delivery"
      ? order?.deliveryFee != null
        ? Number(order.deliveryFee)
        : entry?.deliveryFee != null
          ? Number(entry.deliveryFee)
          : null
      : null;
  const charges = useMemo(
    () =>
      resolveOrderCharges({
        items: displayItems,
        storedItemsSubtotal: editingItems
          ? null
          : (entry?.itemsSubtotal ?? order?.itemsSubtotal ?? null),
        storedTaxAmount: editingItems
          ? null
          : (entry?.taxAmount ?? order?.taxAmount ?? null),
        storedServiceAmount: editingItems
          ? null
          : (entry?.serviceAmount ?? order?.serviceAmount ?? null),
        storedTaxPercent: entry?.taxPercent ?? order?.taxPercent ?? null,
        storedServicePercent:
          entry?.servicePercent ?? order?.servicePercent ?? null,
        storedTotal: editingItems
          ? null
          : (entry?.totalPrice ?? order?.orderTotal ?? null),
        deliveryFee,
        menu,
      }),
    [deliveryFee, displayItems, editingItems, entry, menu, order],
  );
  const printTotal = charges.grandTotal;

  const adjustDraftQty = (index: number, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((item, i) => {
          if (i !== index) return item;
          const nextQty = Math.max(1, (item.quantity ?? 1) + delta);
          const unit = item.price ?? 0;
          return {
            ...item,
            quantity: nextQty,
            total: Math.round(unit * nextQty * 100) / 100,
          };
        })
        .filter((item, i) => i !== index || (item.quantity ?? 0) > 0),
    );
  };

  const removeDraftItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveItemEdits = async () => {
    if (!menuId || !entry?.id || savingItems) return;
    setSavingItems(true);
    try {
      const payload = draftItems.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity ?? 1,
        price: item.price,
        notes: (item as CallItem & { notes?: string }).notes,
        size: item.size,
        variant: item.variant,
      }));
      const result = await patchTableOrderItems(
        menuId,
        String(entry.id),
        payload,
        locale,
      );
      if (!result) {
        toast.error(t("itemsSaveError"));
        return;
      }
      toast.success(t("itemsSaveSuccess"));
      setEditingItems(false);
      onItemsUpdated?.(
        String(entry.id),
        result.items,
        result.orderTotal,
        result.status,
      );
    } catch {
      toast.error(t("itemsSaveError"));
    } finally {
      setSavingItems(false);
    }
  };

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
          {
            governorateNameAr:
              entry?.governorateNameAr || order?.governorateNameAr || null,
            governorateNameEn:
              entry?.governorateNameEn || order?.governorateNameEn || null,
            order: order ?? null,
          },
          locale,
        )
      : null;
  const phoneDisplay =
    order?.customerPhone?.trim() || entry?.customerPhone?.trim() || null;
  const addressDisplay =
    order?.customerAddress?.trim() || entry?.customerAddress?.trim() || null;
  const notesDisplay =
    order?.orderNotes?.trim() || entry?.orderNotes?.trim() || null;
  const tableNumber = order?.tableNumber;
  const phoneHref = phoneDisplay
    ? `tel:${phoneDisplay.replace(/[^\d+]/g, "")}`
    : undefined;
  const billRequested =
    entry?.pendingBillRequest === true || order?.pendingBillRequest === true;

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: () =>
      [`#${entry?.orderId ?? ""}`, customerDisplay].filter(Boolean).join(" - "),
  });

  const itemColumns = editingItems
    ? "grid-cols-[1fr_auto_auto_auto]"
    : "grid-cols-[1fr_auto_auto]";

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={t("detailsTitle")}
        description={
          entry ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="ui-label">{t("colOrderId")}</span>
              <span className="ui-figure text-[15px] text-fg" lang="en">
                #{entry.orderId}
              </span>
              <span role="status" aria-live="polite">
                <OrderStatusBadge
                  status={status}
                  label={t(`orderStatus.${status}` as never)}
                />
              </span>
            </span>
          ) : undefined
        }
        size="lg"
        bare
        dismissible={!savingItems}
        closeLabel={t("close")}
        footer={
          <>
            {entry && menuId && onActionComplete && !loading && (
              <OrderActionButtons
                menuId={menuId}
                entry={{
                  ...(entry as CallEntry),
                  pendingGuestAddition:
                    entry.pendingGuestAddition === true ||
                    order?.pendingGuestAddition === true,
                  pendingBillRequest:
                    entry.pendingBillRequest === true ||
                    order?.pendingBillRequest === true,
                }}
                status={status}
                onComplete={onActionComplete}
                translationNs={
                  variant === "delivery" ? "deliveryOrders" : "tableOrders"
                }
                variant={variant}
              />
            )}
            {isPro && entry && !loading && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrint}
                startIcon={<IoPrintOutline className="text-base" />}
              >
                {t("printOrder")}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("close")}
            </Button>
          </>
        }
      >
        {summary || billRequested ? (
          <div className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:px-5">
            {billRequested ? (
              <Alert tone="danger">{t("billRequestBadge")}</Alert>
            ) : null}
            {summary ? (
              <p className="text-xs leading-relaxed text-fg-muted">{summary}</p>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <ModalSkeleton label={t("loading")} />
        ) : entry ? (
          <>
            <TicketSection
              title={
                variant === "delivery"
                  ? t("deliveryDetailsTitle")
                  : t("orderDetailsTitle")
              }
            >
              <TicketRows>
                <TicketRow
                  label={t("detailsCustomer")}
                  value={customerDisplay}
                  emptyLabel={t("notProvided")}
                />
                <TicketRow
                  label={t("detailsPhone")}
                  value={phoneDisplay}
                  href={phoneHref}
                  emptyLabel={t("notProvided")}
                />
                {variant === "delivery" ? (
                  <TicketRow
                    label={t("detailsZone")}
                    value={zoneLabel}
                    emptyLabel={t("notProvided")}
                  />
                ) : tableNumber && String(tableNumber).trim() !== "" ? (
                  <TicketRow label={t("detailsTable")} value={tableNumber} />
                ) : null}
                <TicketRow
                  label={t("detailsWhen")}
                  value={
                    <ViewTime data={lastAction?.time ?? actions[0]?.time} />
                  }
                />
                {waiterDisplay ? (
                  <TicketRow label={t("colWaiter")} value={waiterDisplay} />
                ) : null}
                {variant === "delivery" ? (
                  <TicketRow
                    label={t("detailsAddress")}
                    value={addressDisplay}
                    block
                    emptyLabel={t("notProvided")}
                  />
                ) : null}
                <TicketRow
                  label={t("detailsNotes")}
                  value={notesDisplay}
                  block
                  emptyLabel={t("noNotes")}
                />
              </TicketRows>
            </TicketSection>

            <TicketSection
              title={
                <>
                  {t("itemsTitle")}
                  <CountBadge count={displayItems.length} />
                </>
              }
              actions={
                canEditItems && menuId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (editingItems) {
                        setDraftItems(items);
                        setEditingItems(false);
                      } else {
                        setEditingItems(true);
                      }
                    }}
                    startIcon={<IoCreateOutline className="text-sm" />}
                  >
                    {editingItems ? t("editItemsCancel") : t("editItems")}
                  </Button>
                ) : undefined
              }
            >
              {editingItems && menuId && (
                <OrderAddItemPicker
                  menuId={menuId}
                  open={editingItems}
                  currency={currency}
                  onAdd={(updater) => setDraftItems(updater)}
                  labels={{
                    addProduct: t("addProduct"),
                    addProductSearch: t("addProductSearch"),
                    addProductLoading: t("addProductLoading"),
                    addProductEmpty: t("addProductEmpty"),
                    addProductNoResults: t("addProductNoResults"),
                    addProductSelectSize: t("addProductSelectSize"),
                    addProductSelectVariant: t("addProductSelectVariant"),
                    addProductConfirm: t("addProductConfirm"),
                    addProductNone: t("addProductCancel"),
                  }}
                />
              )}

              {displayItems.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line-strong bg-surface-2/40 px-3 py-6 text-center text-[13px] text-fg-muted">
                  {t("itemsEmpty")}
                </p>
              ) : (
                <>
                  {/* One ruled ledger: header, lines and money share a single
                      frame so the total reads as the foot of the list rather
                      than as a separate panel. */}
                  <div className="overflow-hidden rounded-lg border border-line">
                    <div
                      className={cn(
                        "grid gap-x-3 border-b border-line bg-surface-2 px-3 py-1.5",
                        itemColumns,
                      )}
                    >
                      <span className="ui-label">{t("colItemName")}</span>
                      <span className="ui-label text-center">
                        {t("colQty")}
                      </span>
                      <span className="ui-label text-end">{t("colTotal")}</span>
                      {editingItems ? <span /> : null}
                    </div>

                    <div className="divide-y divide-line">
                      {displayItems.map((item, idx) => (
                        <div
                          key={`${item.menuItemId}-${idx}`}
                          className={cn(
                            "grid items-center gap-x-3 px-3 py-2",
                            itemColumns,
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-fg">
                              {item.name}
                            </p>
                            {(item.size || item.variant) && (
                              <p className="mt-0.5 truncate text-xs text-fg-muted">
                                {[
                                  callItemOptionLabel(
                                    item.size,
                                    locale,
                                    "size",
                                  ),
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
                            {!editingItems && item.price != null && (
                              <p className="ui-label mt-0.5" lang="en">
                                {item.price}
                                {currency ? (
                                  <span className="ms-0.5">{currency}</span>
                                ) : null}{" "}
                                × {item.quantity}
                              </p>
                            )}
                          </div>
                          {editingItems ? (
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                iconOnly
                                onClick={() => adjustDraftQty(idx, -1)}
                                aria-label={t("qtyDecrease")}
                              >
                                <IoRemoveOutline />
                              </Button>
                              <span
                                className="ui-figure min-w-6 text-center text-[13px] text-fg"
                                lang="en"
                              >
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                iconOnly
                                onClick={() => adjustDraftQty(idx, 1)}
                                aria-label={t("qtyIncrease")}
                              >
                                <IoAddOutline />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="ui-figure min-w-8 text-center text-[13px] text-fg-muted"
                              lang="en"
                            >
                              ×{item.quantity}
                            </span>
                          )}
                          <span
                            className="ui-figure text-end text-[13px] text-fg"
                            lang="en"
                          >
                            {item.total}
                            {currency ? (
                              <span className="ms-1 text-[10px] font-medium text-fg-muted">
                                {currency}
                              </span>
                            ) : null}
                          </span>
                          {editingItems && (
                            <Button
                              type="button"
                              variant="dangerGhost"
                              size="sm"
                              iconOnly
                              onClick={() => removeDraftItem(idx)}
                              aria-label={t("removeItem")}
                            >
                              <IoTrashOutline />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-line bg-surface-2 px-3 py-2.5">
                      <OrderChargesLines
                        charges={charges}
                        currency={currency}
                        labels={{
                          subtotal: t("detailsSubtotal"),
                          tax: t("detailsTax"),
                          service: t("detailsService"),
                          deliveryFee:
                            variant === "delivery"
                              ? t("detailsDeliveryFee" as never)
                              : undefined,
                          total: t("detailsTotal"),
                        }}
                      />
                    </div>
                  </div>

                  {editingItems && (
                    <Button
                      type="button"
                      fullWidth
                      disabled={savingItems || draftItems.length === 0}
                      loading={savingItems}
                      onClick={() => void saveItemEdits()}
                      className="mt-3"
                    >
                      {savingItems ? t("itemsSaving") : t("itemsSave")}
                    </Button>
                  )}
                </>
              )}
            </TicketSection>

            {entry.actions && entry.actions.length > 0 ? (
              <TicketSection title={t("actionsTitle")} className="border-b-0">
                <ActionsTimeline
                  actions={entry.actions}
                  locale={locale}
                  t={t}
                  order={order}
                />
              </TicketSection>
            ) : null}
          </>
        ) : null}
      </Modal>

      {isPro && entry && (
        <div style={{ overflow: "hidden", height: 0, position: "absolute" }}>
          <PrintableReceipt
            ref={printRef}
            orderId={entry.orderId}
            title={t("detailsTitle")}
            items={items}
            totalPrice={printTotal}
            currency={currency}
            customerDisplay={customerDisplay}
            phoneDisplay={phoneDisplay}
            zoneLabel={zoneLabel}
            addressDisplay={addressDisplay}
            notesDisplay={notesDisplay}
            tableNumber={order?.tableNumber}
            deliveryFee={deliveryFee}
            variant={variant}
            locale={locale}
            labels={{
              customer: t("detailsCustomer"),
              phone: t("detailsPhone"),
              zone: variant === "delivery" ? t("detailsZone" as never) : "",
              address: t("detailsAddress" as never),
              table: t("detailsTable" as never),
              notes: t("detailsNotes"),
              deliveryFee:
                variant === "delivery" ? t("detailsDeliveryFee" as never) : "",
              total: t("detailsTotal"),
              itemName: t("colItemName"),
              qty: t("colQty"),
              itemTotal: t("colTotal"),
            }}
          />
        </div>
      )}
    </>
  );
}
