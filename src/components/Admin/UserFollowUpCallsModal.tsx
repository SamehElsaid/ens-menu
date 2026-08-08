"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoArrowBack } from "react-icons/io5";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, ConfirmDialog, LoadingBlock, Modal } from "@/components/ui";
import FollowUpAgentCallsSummaryList from "@/components/Admin/FollowUpAgentCallsSummaryList";
import FollowUpCallsList from "@/components/Admin/FollowUpCallsList";
import LogFollowUpCallModal from "@/components/Admin/LogFollowUpCallModal";
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
      <Modal
        open={open}
        onClose={onClose}
        title={modalTitle}
        size="lg"
        closeLabel={t("close")}
        footer={
          <Button variant="secondary" fullWidth onClick={onClose}>
            {t("close")}
          </Button>
        }
      >
        <div dir={textDir} className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-1">
            {showingAgentDetail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCall(null)}
                startIcon={<IoArrowBack className="rtl:rotate-180" />}
                className="-ms-3 mb-1"
              >
                {t("backToCallsList")}
              </Button>
            )}

            {subtitle && (
              <p className="text-sm font-medium text-fg">{subtitle}</p>
            )}

            {showingAgentDetail && selectedCallPhone ? (
              <div className="flex flex-wrap items-center gap-2">
                <PhoneDisplay
                  value={selectedCallPhone}
                  copyOnClick
                  className="text-sm text-brand hover:underline"
                  title={t("copyPhone")}
                  onCopied={() => toast.success(t("phoneCopied"))}
                  onCopyFailed={() => toast.error(t("copyFailed"))}
                />
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setCallNowOpen(true)}
                >
                  {t("callNow")}
                </Button>
              </div>
            ) : showingAgentDetail ? (
              <p className="text-sm text-fg-subtle">{t("noPhone")}</p>
            ) : !isAgentView && phoneNumber ? (
              <PhoneDisplay
                value={phoneNumber}
                className="text-sm text-fg-muted"
              />
            ) : !isAgentView ? (
              <p className="text-sm text-fg-subtle">{t("noPhone")}</p>
            ) : null}

            {!loading && !showingAgentDetail && (
              <p className="text-xs text-fg-muted">
                {t("callsCount", { count: calls.length })}
              </p>
            )}
          </div>

          {loading ? (
            <LoadingBlock />
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
      </Modal>

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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title={t("deleteCallTitle")}
        description={t("deleteCallMessage")}
        confirmLabel={t("deleteCall")}
        cancelLabel={t("cancel")}
        loading={deleting}
        tone="danger"
        icon={<FiAlertTriangle />}
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
