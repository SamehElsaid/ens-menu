"use client";

import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { IoCallOutline, IoCloseOutline, IoCopyOutline } from "react-icons/io5";
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

  if (!open || !formatted) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      toast.success(t("phoneCopied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="call-now-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2
            id="call-now-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {t("callNowTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t("close")}
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-center">
          {customerName && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {customerName}
            </p>
          )}

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-5 flex justify-center">
            <PhoneDisplay
              value={formatted}
              className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-wide"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              <IoCopyOutline className="text-lg" />
              {t("copyPhone")}
            </button>
            <a
              href={`tel:${formatted}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <IoCallOutline className="text-lg" />
              {t("callNow")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
