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
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { Button, Field, Input, Select } from "@/components/ui";

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
    <div className="mb-4 rounded-xl border border-dashed border-brand-line bg-brand-soft/40">
      <Button
        type="button"
        variant="ghost"
        fullWidth
        onClick={() => setExpanded((v) => !v)}
        className="justify-between px-3 py-2.5 text-sm font-semibold text-brand-soft-fg hover:bg-brand-soft/60"
        startIcon={<IoAddOutline />}
        endIcon={expanded ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
      >
        {labels.addProduct}
      </Button>

      {expanded && (
        <div className="border-t border-brand-line px-3 pb-3 pt-2">
          <Field className="mb-2">
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.addProductSearch}
              startIcon={<IoSearchOutline />}
            />
          </Field>

          {configItem ? (
            <div className="rounded-lg border border-line bg-surface p-3">
              <p className="mb-2 text-sm font-semibold text-fg">
                {resolveMenuItemName(configItem, locale)}
              </p>
              {configSizes.length > 0 && (
                <Field label={labels.addProductSelectSize} className="mb-2">
                  <Select
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
                  </Select>
                </Field>
              )}
              {configVariants.length > 0 && (
                <Field label={labels.addProductSelectVariant} className="mb-3">
                  <Select
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
                  </Select>
                </Field>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={!canConfirmConfig}
                  onClick={() => {
                    if (!configItem) return;
                    commitAdd(configItem, selectedSize, selectedVariant);
                  }}
                  className="flex-1"
                  size="sm"
                >
                  {labels.addProductConfirm}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetConfig}
                  size="sm"
                >
                  {labels.addProductNone}
                </Button>
              </div>
            </div>
          ) : loading ? (
            <p className="py-4 text-center text-sm text-fg-muted">
              {labels.addProductLoading}
            </p>
          ) : menuItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-fg-muted">
              {labels.addProductEmpty}
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-fg-muted">
              {labels.addProductNoResults}
            </p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {filtered.map((item) => (
                <li key={item.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => handlePickItem(item)}
                    className="justify-between px-2 py-2 text-start text-sm hover:bg-surface-2"
                  >
                    <span className="min-w-0 truncate font-medium text-fg">
                      {resolveMenuItemName(item, locale)}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-brand-soft-fg">
                      {item.price}
                      {currency ? ` ${currency}` : ""}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
