"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoArrowBack, IoCloseOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import FollowUpAgentCallsSummaryList from "@/components/Admin/FollowUpAgentCallsSummaryList";
import FollowUpCallsList from "@/components/Admin/FollowUpCallsList";
import LogFollowUpCallModal from "@/components/Admin/LogFollowUpCallModal";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import CallNowPhoneModal from "@/components/Admin/CallNowPhoneModal";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import {
  deleteFollowUpCall,
  fetchFollowUpCalls,
  getFollowUpCallDisplayName,
  getFollowUpCallDisplayPhone,
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
  const [selectedCall, setSelectedCall] = useState<FollowUpCall | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [callNowOpen, setCallNowOpen] = useState(false);

  const isAgentView = Boolean(adminName);
  const showingAgentDetail = isAgentView && Boolean(selectedCall);
  const selectedCallPhone = selectedCall
    ? getFollowUpCallDisplayPhone(selectedCall)
    : null;

  const modalTitle = showingAgentDetail
    ? t("callDetailsTitle")
    : isAgentView
      ? t("agentCallsTitle")
      : t("viewCallsTitle");

  const subtitle = useMemo(() => {
    if (showingAgentDetail && selectedCall) {
      return getFollowUpCallDisplayName(selectedCall);
    }
    if (isAgentView) return adminName;
    return userName;
  }, [adminName, isAgentView, selectedCall, showingAgentDetail, userName]);

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
      setSelectedCall(null);
      setCallNowOpen(false);
    }
  }, [open, load]);

  useEffect(() => {
    setCallNowOpen(false);
  }, [selectedCall?.id]);

  const resolveCallContext = (call: FollowUpCall) => ({
    userId: call.userId,
    userName: call.userName ?? userName ?? `#${call.userId}`,
    phoneNumber: call.phoneNumber ?? phoneNumber ?? null,
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteFollowUpCall(locale, deleteTarget.id);
      if (result.ok) {
        toast.success(t("deleteCallSuccess"));
        const deletedId = deleteTarget.id;
        setDeleteTarget(null);
        if (selectedCall?.id === deletedId) {
          setSelectedCall(null);
        }
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
        if (selectedCall?.id === callId) {
          setSelectedCall(result.call);
        }
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
              {showingAgentDetail && (
                <button
                  type="button"
                  onClick={() => setSelectedCall(null)}
                  className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary dark:text-slate-400"
                >
                  <IoArrowBack
                    className={locale === "ar" ? "rotate-180" : undefined}
                  />
                  {t("backToCallsList")}
                </button>
              )}
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
              {showingAgentDetail && selectedCallPhone ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <PhoneDisplay
                    value={selectedCallPhone}
                    copyOnClick
                    className="text-sm text-primary hover:underline"
                    title={t("copyPhone")}
                    onCopied={() => toast.success(t("phoneCopied"))}
                    onCopyFailed={() => toast.error(t("copyFailed"))}
                  />
                  <button
                    type="button"
                    onClick={() => setCallNowOpen(true)}
                    className="text-xs font-medium text-slate-600 underline hover:text-primary dark:text-slate-300"
                  >
                    {t("callNow")}
                  </button>
                </div>
              ) : showingAgentDetail ? (
                <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
                  {t("noPhone")}
                </p>
              ) : !isAgentView && phoneNumber ? (
                <PhoneDisplay
                  value={phoneNumber}
                  className="mt-0.5 text-sm text-slate-500 dark:text-slate-400"
                />
              ) : !isAgentView ? (
                <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
                  {t("noPhone")}
                </p>
              ) : null}
              {!loading && !showingAgentDetail && (
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
            ) : isAgentView && !selectedCall ? (
              <FollowUpAgentCallsSummaryList
                calls={calls}
                onSelect={setSelectedCall}
              />
            ) : isAgentView && selectedCall ? (
              <FollowUpCallsList
                calls={[selectedCall]}
                detailed
                showCustomer
                onDelete={(call) => setDeleteTarget(call)}
                onEdit={(call) => setActiveLogModal({ kind: "edit", call })}
              />
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

      {selectedCallPhone && (
        <CallNowPhoneModal
          open={callNowOpen}
          onClose={() => setCallNowOpen(false)}
          phoneNumber={selectedCallPhone}
          customerName={
            selectedCall ? getFollowUpCallDisplayName(selectedCall) : undefined
          }
        />
      )}
    </>
  );
}
