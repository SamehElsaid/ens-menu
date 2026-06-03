"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HiShieldCheck } from "react-icons/hi";

const EASYKASH_CREDIT_CARD =
  "https://www.easykash.net/assets/images/logos/credit-card.svg";
const EASYKASH_MOBILE_WALLET =
  "https://www.easykash.net/assets/images/logos/mobile-wallet.png";

const PAYMENT_LOGOS = [
  {
    id: "creditCard",
    src: EASYKASH_CREDIT_CARD,
    width: 160,
    height: 40,
    isSvg: true,
  },
  {
    id: "mobileWallet",
    src: EASYKASH_MOBILE_WALLET,
    width: 200,
    height: 64,
    isSvg: false,
  },
] as const;

type SubscriptionPaymentMethodsProps = {
  className?: string;
  compact?: boolean;
};

export default function SubscriptionPaymentMethods({
  className = "",
  compact = false,
}: SubscriptionPaymentMethodsProps) {
  const t = useTranslations("PricingPage");

  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70 ${compact ? "p-4 sm:p-5" : "p-5 sm:rounded-3xl sm:p-7"} ${className}`}
      aria-labelledby="subscription-payment-heading"
    >
      <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
        <div className="flex items-center gap-2">
          <HiShieldCheck
            className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
          <h2
            id="subscription-payment-heading"
            className={`font-bold text-slate-900 dark:text-white ${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}
          >
            {t("paymentMethodsTitle")}
          </h2>
        </div>
        {!compact && (
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t("paymentMethodsDescription")}
          </p>
        )}
        <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {PAYMENT_LOGOS.map((logo) => {
            const label = t(`paymentMethod.${logo.id}`);
            return (
              <li key={logo.id}>
                <div className="flex h-14 min-w-28 items-center justify-center rounded-xl border border-slate-200/90 bg-white px-4 py-2 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/80 sm:h-16 sm:min-w-32 sm:px-5">
                  {logo.isSvg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo.src}
                      alt={label}
                      className="h-8 max-w-28 object-contain sm:h-9 sm:max-w-32"
                    />
                  ) : (
                    <Image
                      src={logo.src}
                      alt={label}
                      width={logo.width}
                      height={logo.height}
                      className="h-8 w-auto max-w-28 object-contain sm:h-9 sm:max-w-32"
                      unoptimized
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          {t("paymentMethodsSecureNote")}
        </p>
      </div>
    </section>
  );
}
