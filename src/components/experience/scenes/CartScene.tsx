"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { isRtlLocale } from "@/lib/localeDirection";
import ExperienceScene from "../ExperienceScene";
import { useExperience } from "../ExperienceContext";

export default function CartScene() {
  const t = useTranslations("experienceHome");
  const locale = useLocale();
  const isRTL = isRtlLocale(locale);
  const { cart, cartTotal, cartCount } = useExperience();

  const formatPrice = (price: number) =>
    isRTL ? `${price} ج.م` : `${price} EGP`;

  return (
    <ExperienceScene
      index={4}
      height="compact"
      className="items-center justify-center bg-white dark:bg-[#0d1117]"
    >
      <div className="container max-w-md px-6">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
          {t("cartTitle")}
        </h2>

        {cartCount === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            {t("cartEmpty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {cart.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <span className="text-start text-sm font-medium text-slate-800 dark:text-slate-100">
                  {line.name}
                  {line.qty > 1 && (
                    <span className="ms-1 text-slate-400">×{line.qty}</span>
                  )}
                </span>
                <span className="shrink-0 text-sm font-bold text-purple-600 dark:text-purple-400">
                  {formatPrice(line.price * line.qty)}
                </span>
              </li>
            ))}
            <li
              className={cn(
                "flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700",
              )}
            >
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {t("cartTotal")}
              </span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatPrice(cartTotal)}
              </span>
            </li>
          </ul>
        )}
      </div>
    </ExperienceScene>
  );
}
