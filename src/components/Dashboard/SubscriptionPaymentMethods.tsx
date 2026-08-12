"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HiShieldCheck } from "react-icons/hi";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

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
    <Card
      as="section"
      padded="none"
      className={cn("min-w-0", className)}
      aria-labelledby="subscription-payment-heading"
    >
      {/* Left-aligned rather than centred: this is a reassurance block on a
          working page, and a centred column of three stacked lines reads as a
          marketing panel the reader learns to skip. */}
      <div className="flex flex-col gap-1 border-b border-line px-3 py-2.5 sm:px-4">
        <p className="ui-label">{t("paymentMethodsTitle")}</p>
        <div className="flex items-center gap-1.5">
          <HiShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
          <h2
            id="subscription-payment-heading"
            className="text-sm font-semibold tracking-[-0.02em] text-fg"
          >
            {t("paymentMethodsSecureNote")}
          </h2>
        </div>
        {!compact ? (
          <p className="text-xs leading-relaxed text-fg-muted">
            {t("paymentMethodsDescription")}
          </p>
        ) : null}
      </div>

      {/* The logo tiles share edges instead of floating apart: they are one
          list of accepted rails, not four separate offers. */}
      <ul className="grid grid-cols-2 divide-x divide-line">
        {PAYMENT_LOGOS.map((logo) => {
          const label = t(`paymentMethod.${logo.id}`);
          return (
            <li
              key={logo.id}
              className="flex min-w-0 items-center justify-center bg-surface px-3 py-3 sm:py-4"
            >
              {logo.isSvg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.src}
                  alt={label}
                  className="h-7 max-w-full object-contain sm:h-8"
                />
              ) : (
                <Image
                  src={logo.src}
                  alt={label}
                  width={logo.width}
                  height={logo.height}
                  className="h-7 w-auto max-w-full object-contain sm:h-8"
                  unoptimized
                />
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
