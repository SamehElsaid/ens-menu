"use client";

import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { IoCallOutline, IoCopyOutline } from "react-icons/io5";
import { Button, ButtonLink, Modal } from "@/components/ui";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import { normalizePhoneNumber } from "@/lib/formatPhone";

type CallNowPhoneModalProps = {
  open: boolean;
  onClose: () => void;
  phoneNumber: string;
  customerName?: string;
};

export default function CallNowPhoneModal({
  open,
  onClose,
  phoneNumber,
  customerName,
}: CallNowPhoneModalProps) {
  const t = useTranslations("adminFollowUps");
  const formatted = normalizePhoneNumber(phoneNumber);

  if (!formatted) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      toast.success(t("phoneCopied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("callNowTitle")}
      description={customerName}
      size="xs"
      closeLabel={t("close")}
      footer={
        <>
          <ButtonLink
            external
            href={`tel:${formatted}`}
            variant="secondary"
            startIcon={<IoCallOutline className="text-lg" />}
          >
            {t("callNow")}
          </ButtonLink>
          <Button
            variant="primary"
            onClick={() => void handleCopy()}
            startIcon={<IoCopyOutline className="text-lg" />}
          >
            {t("copyPhone")}
          </Button>
        </>
      }
    >
      <div className="flex justify-center rounded-lg border border-line bg-surface-2 px-4 py-5">
        <PhoneDisplay
          value={formatted}
          className="text-2xl font-semibold tracking-wide text-fg"
        />
      </div>
    </Modal>
  );
}
