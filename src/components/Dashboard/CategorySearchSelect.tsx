"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Select, { type SingleValue } from "react-select";
import { useLocale, useTranslations } from "next-intl";
import { IoSearchOutline } from "react-icons/io5";
import { axiosGet } from "@/shared/axiosCall";
import type { Category } from "@/types/Menu";

export type CategoryOption = {
  value: string;
  label: string;
};

interface CategorySearchSelectProps {
  menuId: string;
  value: string;
  selectedOption?: CategoryOption | null;
  onChange: (value: string, option: CategoryOption | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  isClearable?: boolean;
  hasError?: boolean;
  instanceId?: string;
  minHeight?: number;
  variant?: "default" | "filter";
}

export default function CategorySearchSelect({
  menuId,
  value,
  selectedOption: selectedOptionProp = null,
  onChange,
  onBlur,
  placeholder,
  isClearable = true,
  hasError = false,
  instanceId = "category-search",
  minHeight = 44,
  variant = "default",
}: CategorySearchSelectProps) {
  const locale = useLocale();
  const tAuth = useTranslations("auth");
  const isFilter = variant === "filter";
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<CategoryOption | null>(
    selectedOptionProp,
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const isBusy = loading || initialLoading;
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    setSelectedOption(selectedOptionProp);
  }, [selectedOptionProp]);

  const fetchCategories = useCallback(
    async (query: string, options?: { clearOptions?: boolean }) => {
      const requestId = ++searchRequestRef.current;
      setLoading(true);
      if (options?.clearOptions) {
        setCategoryOptions([]);
      }

      try {
        const trimmed = query.trim();
        const searchParam = trimmed
          ? `&search=${encodeURIComponent(trimmed)}`
          : "";
        const result = await axiosGet<Category[] | { categories: Category[] }>(
          `/menus/${menuId}/categories?page=1&limit=20${searchParam}`,
          locale,
        );

        if (requestId !== searchRequestRef.current) return;

        if (result.status && result.data) {
          const list = Array.isArray(result.data)
            ? result.data
            : ((result.data as { categories: Category[] }).categories ?? []);
          setCategoryOptions(
            list.map((cat) => ({
              value: String(cat.id),
              label:
                locale === "ar"
                  ? cat.nameAr || cat.nameEn || ""
                  : cat.nameEn || cat.nameAr || "",
            })),
          );
        } else {
          setCategoryOptions([]);
        }
      } catch {
        if (requestId === searchRequestRef.current) {
          setCategoryOptions([]);
        }
      } finally {
        if (requestId === searchRequestRef.current) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    },
    [menuId, locale],
  );

  const scheduleSearch = useCallback(
    (query: string) => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      setLoading(true);
      setMenuIsOpen(true);
      if (query.trim()) {
        setCategoryOptions([]);
      }
      searchTimerRef.current = setTimeout(() => {
        void fetchCategories(query, { clearOptions: Boolean(query.trim()) });
      }, 300);
    },
    [fetchCategories],
  );

  useEffect(() => {
    void fetchCategories("");
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      searchRequestRef.current += 1;
    };
  }, [fetchCategories]);

  useEffect(() => {
    if (!value) {
      setSelectedOption(null);
      return;
    }
    if (selectedOption?.value === value) return;

    const fromOptions = categoryOptions.find((option) => option.value === value);
    if (fromOptions) {
      setSelectedOption(fromOptions);
    }
  }, [value, categoryOptions, selectedOption?.value]);

  return (
    <div className="relative">
      <div
        className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none ${
          locale === "ar" ? "right-3" : "left-3"
        }`}
      >
        {!isFilter && isBusy ? (
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
        ) : (
          <IoSearchOutline className="text-slate-400 dark:text-slate-500 text-xl" />
        )}
      </div>
      <Select<CategoryOption>
        instanceId={instanceId}
        classNamePrefix={isFilter ? "filter-select" : "select"}
        className={hasError ? "error" : ""}
        isSearchable
        isClearable={isClearable}
        isLoading={isBusy}
        menuIsOpen={menuIsOpen}
        onMenuOpen={() => setMenuIsOpen(true)}
        onMenuClose={() => setMenuIsOpen(false)}
        filterOption={() => true}
        dir={locale === "ar" ? "rtl" : "ltr"}
        placeholder={placeholder}
        options={categoryOptions}
        value={selectedOption}
        onChange={(option: SingleValue<CategoryOption>) => {
          setSelectedOption(option);
          onChange(option?.value ?? "", option);
          setMenuIsOpen(false);
        }}
        onInputChange={(inputValue, meta) => {
          if (meta.action === "input-change") {
            scheduleSearch(inputValue);
          }
        }}
        onFocus={() => {
          setMenuIsOpen(true);
          if (initialLoading) {
            void fetchCategories("");
          }
        }}
        onBlur={onBlur}
        noOptionsMessage={() => (
          <span>{isBusy ? tAuth("loading") : tAuth("noOptions")}</span>
        )}
        loadingMessage={() => <span>{tAuth("loading")}</span>}
        styles={
          isFilter
            ? {
                control: (base) => ({
                  ...base,
                  minHeight: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "0.75rem",
                  paddingInlineStart: "2.5rem",
                  boxShadow: "none",
                }),
                valueContainer: (base) => ({
                  ...base,
                  paddingTop: 0,
                  paddingBottom: 0,
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: "2.75rem",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 1000,
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                }),
              }
            : {
                control: (base) => ({
                  ...base,
                  minHeight: `${minHeight}px`,
                  borderRadius: "1rem",
                  paddingInlineStart: "2.25rem",
                }),
              }
        }
      />
    </div>
  );
}
