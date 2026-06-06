"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoCloseOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import FollowUpCallsList from "@/components/Admin/FollowUpCallsList";
import LogFollowUpCallModal from "@/components/Admin/LogFollowUpCallModal";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import {
  deleteFollowUpCall,
  fetchFollowUpCalls,
  updateFollowUpCall,
  type FollowUpCallsFilters,
} from "@/lib/fetchAdminFollowUp";
import type { FollowUpCall } from "@/types/AdminFollowUp";
import { toast } from "react-toastify";

type UserFollowUpCallsModalProps = {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
  filters: FollowUpCallsFilters;
  userName?: string;
  phoneNumber?: string | null;
  adminName?: string;
  showCustomer?: boolean;
};

type ActiveLogModal = { kind: "edit"; call: FollowUpCall } | null;

export default function UserFollowUpCallsModal({
  open,
  onClose,
  onChanged,
  filters,
  userName,
  phoneNumber,
  adminName,
  showCustomer = false,
}: UserFollowUpCallsModalProps) {
  const locale = useLocale();
  const t = useTranslations("adminFollowUps");
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [calls, setCalls] = useState<FollowUpCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FollowUpCall | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeLogModal, setActiveLogModal] = useState<ActiveLogModal>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAgentView = Boolean(adminName);

  const modalTitle = isAgentView ? t("agentCallsTitle") : t("viewCallsTitle");

  const subtitle = useMemo(() => {
    if (isAgentView) return adminName;
    return userName;
  }, [adminName, isAgentView, userName]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFollowUpCalls(locale, filters);
      setCalls(data.calls);
    } finally {
      setLoading(false);
    }
  }, [filters, locale]);

  useEffect(() => {
    if (open) {
      void load();
    } else {
      setActiveLogModal(null);
    }
  }, [open, load]);

  const resolveCallContext = (call: FollowUpCall) => ({
    userId: call.userId,
    userName: call.userName ?? userName ?? `#${call.userId}`,
    phoneNumber: phoneNumber ?? null,
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteFollowUpCall(locale, deleteTarget.id);
      if (result.ok) {
        toast.success(t("deleteCallSuccess"));
        setDeleteTarget(null);
        await load();
        onChanged?.();
      } else {
        toast.error(t("deleteCallError"));
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateCall = async (
    callId: string,
    payload: Parameters<typeof updateFollowUpCall>[2],
  ) => {
    setSubmitting(true);
    try {
      const result = await updateFollowUpCall(locale, callId, payload);
      if (result) {
        toast.success(t("updateCallSuccess"));
        setActiveLogModal(null);
        await load();
        onChanged?.();
      } else {
        toast.error(t("updateCallError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const logModalContext = activeLogModal
    ? resolveCallContext(activeLogModal.call)
    : null;

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal
          aria-labelledby="follow-up-calls-title"
          dir={textDir}
          className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div className="min-w-0">
              <h2
                id="follow-up-calls-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                {modalTitle}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {subtitle}
                </p>
              )}
              {!isAgentView && phoneNumber ? (
                <PhoneDisplay
                  value={phoneNumber}
                  className="mt-0.5 text-sm text-slate-500 dark:text-slate-400"
                />
              ) : !isAgentView ? (
                <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
                  {t("noPhone")}
                </p>
              ) : null}
              {!loading && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t("callsCount", { count: calls.length })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label={t("close")}
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <FaSpinner className="animate-spin text-2xl text-primary" />
              </div>
            ) : (
              <FollowUpCallsList
                calls={calls}
                detailed
                showCustomer={showCustomer}
                onDelete={(call) => setDeleteTarget(call)}
                onEdit={(call) => setActiveLogModal({ kind: "edit", call })}
              />
            )}
          </div>

          <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>

      {logModalContext && activeLogModal && (
        <LogFollowUpCallModal
          open
          onClose={() => setActiveLogModal(null)}
          userId={logModalContext.userId}
          userName={logModalContext.userName}
          phoneNumber={logModalContext.phoneNumber}
          editingCall={activeLogModal.call}
          onSubmit={async () => {}}
          onUpdate={handleUpdateCall}
          submitting={submitting}
        />
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title={t("deleteCallTitle")}
        message={t("deleteCallMessage")}
        confirmText={t("deleteCall")}
        cancelText={t("cancel")}
        isLoading={deleting}
        loadingText={t("deletingCall")}
      />
    </>
  );
}
