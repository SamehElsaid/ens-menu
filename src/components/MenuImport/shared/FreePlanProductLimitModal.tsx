"use client";

import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import { IoWarningOutline } from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Alert, Button, Modal, buttonClasses } from "@/components/ui";

interface FreePlanProductLimitModalProps {
  menuId: string;
  maxProducts: number;
  currentCount: number;
  importCount: number;
  totalAfter: number;
  exceedsLimit: boolean;
  mode: "info" | "confirm";
  onClose: () => void;
  onContinue?: () => void;
}

/**
 * The plan ceiling, stated as arithmetic.
 *
 * The counts used to be interpolated into two sentences, which asked the reader
 * to do the sum in their head to see whether the import fits. They are ledger
 * lines now — what is stored, what is arriving, what the total becomes, and the
 * limit it is measured against — so the row that fails is the one the eye
 * lands on.
 */
export default function FreePlanProductLimitModal({
  menuId,
  maxProducts,
  currentCount,
  importCount,
  totalAfter,
  exceedsLimit,
  mode,
  onClose,
  onContinue,
}: FreePlanProductLimitModalProps) {
  const t = useTranslations("MenuImport");
  const tCommon = useTranslations("common");

  const footer = exceedsLimit ? (
    <>
      <Button variant="secondary" onClick={onClose}>
        {t("freePlanLimitClose")}
      </Button>
      <LinkTo
        href={`/dashboard/${menuId}/subscription`}
        className={buttonClasses({ variant: "primary" })}
      >
        {t("freePlanLimitUpgrade")}
      </LinkTo>
    </>
  ) : mode === "confirm" ? (
    <>
      <Button variant="secondary" onClick={onClose}>
        {t("freePlanLimitClose")}
      </Button>
      <Button onClick={onContinue}>{t("freePlanLimitContinue")}</Button>
    </>
  ) : (
    <Button onClick={onClose} fullWidth className="sm:w-auto">
      {t("freePlanLimitClose")}
    </Button>
  );

  const lines: {
    key: string;
    label: string;
    value: number;
    alert?: boolean;
  }[] = [
    {
      key: "current",
      label: t("freePlanLimitLedgerCurrent"),
      value: currentCount,
    },
  ];

  if (importCount > 0) {
    lines.push({
      key: "import",
      label: t("freePlanLimitLedgerImport"),
      value: importCount,
    });
    lines.push({
      key: "total",
      label: t("freePlanLimitLedgerTotal"),
      value: totalAfter,
      alert: exceedsLimit,
    });
  }

  lines.push({
    key: "max",
    label: t("freePlanLimitLedgerMax"),
    value: maxProducts,
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={t("freePlanLimitTitle")}
      icon={<IoWarningOutline className="text-xl" />}
      iconTone={exceedsLimit ? "danger" : "warning"}
      size="sm"
      closeLabel={tCommon("close")}
      footer={footer}
    >
      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-fg-muted">
          {t("freePlanLimitDescription", {
            max: maxProducts,
            current: currentCount,
          })}
        </p>

        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => (
            <li
              key={line.key}
              className="flex items-baseline justify-between gap-3 py-2"
            >
              <span
                className={cn(
                  "min-w-0 text-[13px]",
                  line.alert ? "font-medium text-danger-fg" : "text-fg-muted",
                )}
              >
                {line.label}
              </span>
              <span
                dir="ltr"
                className={cn(
                  "ui-figure shrink-0 text-[13px]",
                  line.alert ? "text-danger" : "text-fg",
                )}
              >
                {line.value}
              </span>
            </li>
          ))}
        </ul>

        {exceedsLimit && (
          <Alert tone="danger">{t("freePlanLimitExceeded")}</Alert>
        )}
      </div>
    </Modal>
  );
}
