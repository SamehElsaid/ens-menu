"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import type { CallItem } from "@/lib/tableOrders";
import type { Item, ItemSizeOption, ItemVariantOption } from "@/types/Menu";
import {
  buildCallItemFromMenuItem,
  getMenuItemSizes,
  getMenuItemVariants,
  menuItemHasOptions,
  mergeCallItemIntoDraft,
  resolveMenuItemName,
} from "@/lib/orderItemDraft";
import { IoAddOutline, IoChevronDownOutline, IoChevronUpOutline, IoSearchOutline } from "react-icons/io5";

type PickerLabels = {
  addProduct: string;
  addProductSearch: string;
  addProductLoading: string;
  addProductEmpty: string;
  addProductNoResults: string;
  addProductSelectSize: string;
  addProductSelectVariant: string;
  addProductConfirm: string;
  addProductNone: string;
};

export default function OrderAddItemPicker({
  menuId,
  open,
  onAdd,
  labels,
  currency,
}: {
  menuId: string;
  open: boolean;
  onAdd: (updater: (prev: CallItem[]) => CallItem[]) => void;
  labels: PickerLabels;
  currency: string;
}) {
  const locale = useLocale();
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<Item[]>([]);
  const [configItemId, setConfigItemId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<ItemSizeOption | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ItemVariantOption | null>(
    null,
  );

  const fetchItems = useCallback(async () => {
    if (!menuId) return;
    setLoading(true);
    try {
      const result = await axiosGet<Item[] | { items: Item[] }>(
        `/menus/${menuId}/items?page=1&limit=500&available=true`,
        locale,
      );
      if (result.status && result.data) {
        const raw = result.data as { items?: Item[] };
        const list = (raw.items ?? (Array.isArray(result.data) ? result.data : []))
          .filter((item) => item.available !== false && item.isAvailable !== false);
        setMenuItems(list);
      } else {
        setMenuItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setConfigItemId(null);
      setSelectedSize(null);
      setSelectedVariant(null);
      return;
    }
    void fetchItems();
  }, [open, fetchItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter((item) => {
      const name = resolveMenuItemName(item, locale).toLowerCase();
      const category =
        typeof item.category === "string"
          ? item.category
          : (item.categoryName ??
            item.category?.nameAr ??
            item.category?.nameEn ??
            "");
      return (
        name.includes(q) || String(category).toLowerCase().includes(q)
      );
    });
  }, [menuItems, search, locale]);

  const configItem = useMemo(
    () => menuItems.find((i) => i.id === configItemId) ?? null,
    [menuItems, configItemId],
  );
  const configSizes = configItem ? getMenuItemSizes(configItem) : [];
  const configVariants = configItem ? getMenuItemVariants(configItem) : [];

  const resetConfig = () => {
    setConfigItemId(null);
    setSelectedSize(null);
    setSelectedVariant(null);
  };

  const commitAdd = (item: Item, size?: ItemSizeOption | null, variant?: ItemVariantOption | null) => {
    const line = buildCallItemFromMenuItem(item, locale, size, variant, 1);
    onAdd((prev) => mergeCallItemIntoDraft(prev, line));
    resetConfig();
  };

  const handlePickItem = (item: Item) => {
    if (menuItemHasOptions(item)) {
      const sizes = getMenuItemSizes(item);
      const variants = getMenuItemVariants(item);
      setConfigItemId(item.id);
      setSelectedSize(sizes.length === 1 ? sizes[0] : null);
      setSelectedVariant(variants.length === 1 ? variants[0] : null);
      return;
    }
    commitAdd(item);
  };

  const canConfirmConfig =
    configItem &&
    (configSizes.length === 0 || selectedSize != null) &&
    (configVariants.length === 0 || selectedVariant != null);

  if (!open) return null;

  return (
    <div className="mb-4 rounded-xl border border-dashed border-violet-300/70 bg-violet-50/40 dark:border-violet-700/50 dark:bg-violet-950/20">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-violet-800 dark:text-violet-300"
      >
        <span className="inline-flex items-center gap-1.5">
          <IoAddOutline />
          {labels.addProduct}
        </span>
        {expanded ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
      </button>

      {expanded && (
        <div className="border-t border-violet-200/60 px-3 pb-3 pt-2 dark:border-violet-800/60">
          <div className="relative mb-2">
            <IoSearchOutline className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.addProductSearch}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 ps-9 pe-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-violet-600 dark:focus:ring-violet-900/40"
            />
          </div>

          {configItem ? (
            <div className="rounded-lg border border-violet-200 bg-white p-3 dark:border-violet-800 dark:bg-slate-900">
              <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {resolveMenuItemName(configItem, locale)}
              </p>
              {configSizes.length > 0 && (
                <label className="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  {labels.addProductSelectSize}
                  <select
                    value={selectedSize ? JSON.stringify(selectedSize) : ""}
                    onChange={(e) => {
                      try {
                        setSelectedSize(
                          e.target.value
                            ? (JSON.parse(e.target.value) as ItemSizeOption)
                            : null,
                        );
                      } catch {
                        setSelectedSize(null);
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    <option value="">{labels.addProductNone}</option>
                    {configSizes.map((size) => (
                      <option
                        key={`${size.nameAr}-${size.nameEn}-${size.price}`}
                        value={JSON.stringify(size)}
                      >
                        {locale === "ar"
                          ? size.nameAr || size.nameEn
                          : size.nameEn || size.nameAr}{" "}
                        — {size.price} {currency}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {configVariants.length > 0 && (
                <label className="mb-3 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  {labels.addProductSelectVariant}
                  <select
                    value={selectedVariant ? JSON.stringify(selectedVariant) : ""}
                    onChange={(e) => {
                      try {
                        setSelectedVariant(
                          e.target.value
                            ? (JSON.parse(e.target.value) as ItemVariantOption)
                            : null,
                        );
                      } catch {
                        setSelectedVariant(null);
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    <option value="">{labels.addProductNone}</option>
                    {configVariants.map((variant) => (
                      <option
                        key={`${variant.labelAr}-${variant.labelEn}-${variant.price}`}
                        value={JSON.stringify(variant)}
                      >
                        {locale === "ar"
                          ? variant.labelAr || variant.labelEn
                          : variant.labelEn || variant.labelAr}{" "}
                        — {variant.price} {currency}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!canConfirmConfig}
                  onClick={() => {
                    if (!configItem) return;
                    commitAdd(configItem, selectedSize, selectedVariant);
                  }}
                  className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {labels.addProductConfirm}
                </button>
                <button
                  type="button"
                  onClick={resetConfig}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
                >
                  {labels.addProductNone}
                </button>
              </div>
            </div>
          ) : loading ? (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {labels.addProductLoading}
            </p>
          ) : menuItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {labels.addProductEmpty}
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {labels.addProductNoResults}
            </p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handlePickItem(item)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-start text-sm hover:bg-violet-100/80 dark:hover:bg-violet-900/30"
                  >
                    <span className="min-w-0 truncate font-medium text-slate-800 dark:text-slate-100">
                      {resolveMenuItemName(item, locale)}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-violet-700 dark:text-violet-300">
                      {item.price}
                      {currency ? ` ${currency}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
