"use client";

import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import { IoWarningOutline } from "react-icons/io5";
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
        <p className="text-sm leading-relaxed text-fg-muted">
          {t("freePlanLimitDescription", {
            max: maxProducts,
            current: currentCount,
          })}
        </p>
        {importCount > 0 && (
          <p className="text-sm leading-relaxed text-fg-muted">
            {t("freePlanLimitImport", {
              import: importCount,
              total: totalAfter,
            })}
          </p>
        )}
        {exceedsLimit && (
          <Alert tone="danger">{t("freePlanLimitExceeded")}</Alert>
        )}
      </div>
    </Modal>
  );
}
