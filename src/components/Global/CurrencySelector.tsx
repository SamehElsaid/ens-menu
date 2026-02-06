"use client";

import { useState, useRef, useEffect } from "react";
import { IoChevronDownOutline, IoSearchOutline } from "react-icons/io5";

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
  { code: "BHD", name: "Bahraini Dinar", nameAr: "دينار بحريني", symbol: "د.ب" },
  { code: "OMR", name: "Omani Rial", nameAr: "ريال عماني", symbol: "ر.ع" },
  { code: "JOD", name: "Jordanian Dinar", nameAr: "دينار أردني", symbol: "د.أ" },
  { code: "LBP", name: "Lebanese Pound", nameAr: "ليرة لبنانية", symbol: "ل.ل" },
  { code: "MAD", name: "Moroccan Dirham", nameAr: "درهم مغربي", symbol: "د.م" },
  { code: "TND", name: "Tunisian Dinar", nameAr: "دينار تونسي", symbol: "د.ت" },
  { code: "IQD", name: "Iraqi Dinar", nameAr: "دينار عراقي", symbol: "ع.د" },
  { code: "TRY", name: "Turkish Lira", nameAr: "ليرة تركية", symbol: "₺" },
  { code: "INR", name: "Indian Rupee", nameAr: "روبية هندية", symbol: "₹" },
  { code: "PKR", name: "Pakistani Rupee", nameAr: "روبية باكستانية", symbol: "₨" },
];

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  showArabOnly?: boolean;
}

export default function CurrencySelector({
  value,
  onChange,
  showArabOnly = false,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = currencies.find((c) => c.code === value);

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameAr.includes(search)
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selectedCurrency?.symbol}</span>
          <span>
            {showArabOnly
              ? selectedCurrency?.nameAr
              : selectedCurrency?.name}{" "}
            ({selectedCurrency?.code})
          </span>
        </span>
        <IoChevronDownOutline
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <IoSearchOutline className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full ps-9 pe-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredCurrencies.map((currency) => (
              <button
                key={currency.code}
                type="button"
                onClick={() => {
                  onChange(currency.code);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`w-full px-4 py-2.5 text-start flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm ${
                  value === currency.code
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="text-base w-6 text-center">
                  {currency.symbol}
                </span>
                <span>
                  {showArabOnly ? currency.nameAr : currency.name} (
                  {currency.code})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
