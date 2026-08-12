"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import {
  IoChevronDownOutline,
  IoCheckmark,
  IoSearchOutline,
} from "react-icons/io5";
import { cn } from "@/lib/cn";
import {
  Input,
  controlHeight,
  controlRadius,
  controlText,
  focusRing,
  inputBase,
} from "@/components/ui";

interface Currency {
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
}

const currencies: Currency[] = [
  { code: "AED", name: "UAE Dirham", nameAr: "درهم إماراتي", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", nameAr: "ريال سعودي", symbol: "ر.س" },
  { code: "EGP", name: "Egyptian Pound", nameAr: "جنيه مصري", symbol: "ج.م" },
  { code: "USD", name: "US Dollar", nameAr: "دولار أمريكي", symbol: "$" },
  { code: "EUR", name: "Euro", nameAr: "يورو", symbol: "€" },
  { code: "GBP", name: "British Pound", nameAr: "جنيه إسترليني", symbol: "£" },
  { code: "KWD", name: "Kuwaiti Dinar", nameAr: "دينار كويتي", symbol: "د.ك" },
  { code: "QAR", name: "Qatari Riyal", nameAr: "ريال قطري", symbol: "ر.ق" },
  {
    code: "BHD",
    name: "Bahraini Dinar",
    nameAr: "دينار بحريني",
    symbol: "د.ب",
  },
  { code: "OMR", name: "Omani Rial", nameAr: "ريال عماني", symbol: "ر.ع" },
  {
    code: "JOD",
    name: "Jordanian Dinar",
    nameAr: "دينار أردني",
    symbol: "د.أ",
  },
  {
    code: "LBP",
    name: "Lebanese Pound",
    nameAr: "ليرة لبنانية",
    symbol: "ل.ل",
  },
  { code: "MAD", name: "Moroccan Dirham", nameAr: "درهم مغربي", symbol: "د.م" },
  { code: "TND", name: "Tunisian Dinar", nameAr: "دينار تونسي", symbol: "د.ت" },
  { code: "LYD", name: "Libyan Dinar", nameAr: "دينار ليبي", symbol: "د.ل" },
  { code: "IQD", name: "Iraqi Dinar", nameAr: "دينار عراقي", symbol: "ع.د" },
  { code: "TRY", name: "Turkish Lira", nameAr: "ليرة تركية", symbol: "₺" },
  { code: "INR", name: "Indian Rupee", nameAr: "روبية هندية", symbol: "₹" },
  {
    code: "PKR",
    name: "Pakistani Rupee",
    nameAr: "روبية باكستانية",
    symbol: "₨",
  },
];

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  showArabOnly?: boolean;
}

/**
 * Currency picker.
 *
 * The trigger now shares the field recipe with every other control on the form
 * it sits in — including the brand border and halo it takes on focus — instead
 * of carrying its own border, its own height and a ring pointing at a colour
 * the system no longer has.
 *
 * The chosen row is marked by a check and a tone, not by a tint alone, and the
 * panel is the only part of the control that floats.
 */
export default function CurrencySelector({
  value,
  onChange,
  showArabOnly = false,
}: CurrencySelectorProps) {
  const tCommon = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();

  const selectedCurrency = currencies.find((c) => c.code === value);

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameAr.includes(search),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const label = (currency: Currency) =>
    `${showArabOnly ? currency.nameAr : currency.name} (${currency.code})`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id={triggerId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          inputBase,
          controlHeight.md,
          controlRadius.md,
          controlText.md,
          focusRing,
          "flex items-center justify-between gap-2 px-2.5 text-start",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="ui-figure shrink-0 text-fg-muted">
            {selectedCurrency?.symbol}
          </span>
          <span className="truncate">
            {selectedCurrency ? label(selectedCurrency) : ""}
          </span>
        </span>
        <IoChevronDownOutline
          className={cn(
            "size-4 shrink-0 text-fg-subtle transition-transform duration-(--dur-fast)",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-lg border border-line bg-raised shadow-lg">
          <div className="border-b border-line p-1.5">
            <Input
              inputSize="sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tCommon("search")}
              aria-label={tCommon("search")}
              startIcon={<IoSearchOutline className="size-3.5" />}
            />
          </div>
          <ul
            role="listbox"
            aria-labelledby={triggerId}
            className="max-h-48 overflow-y-auto"
          >
            {filteredCurrencies.map((currency) => {
              const selected = value === currency.code;
              return (
                <li key={currency.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(currency.code);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-2.5 py-2 text-start text-[13px] row-settle",
                      focusRing,
                      selected
                        ? "bg-accent-soft text-accent-strong"
                        : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <span className="ui-figure w-6 shrink-0 text-center">
                      {currency.symbol}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {label(currency)}
                    </span>
                    {selected ? (
                      <IoCheckmark
                        className="size-4 shrink-0 text-accent"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
