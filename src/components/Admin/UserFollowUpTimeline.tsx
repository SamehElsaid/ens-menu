"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  createFollowUpCall,
  deleteFollowUpCall,
  fetchFollowUpCalls,
  updateFollowUpCall,
} from "@/lib/fetchAdminFollowUp";
import type { FollowUpCall } from "@/types/AdminFollowUp";
import CallNowPhoneModal from "@/components/Admin/CallNowPhoneModal";
import FollowUpCallsList from "@/components/Admin/FollowUpCallsList";
import LogFollowUpCallModal from "@/components/Admin/LogFollowUpCallModal";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import { toast } from "react-toastify";
import { IoCallOutline } from "react-icons/io5";

type UserFollowUpTimelineProps = {
  userId: number;
  userName: string;
  phoneNumber: string | null;
};

type ActiveLogModal =
  | { kind: "create" }
  | { kind: "edit"; call: FollowUpCall }
  | null;

export default function UserFollowUpTimeline({
  userId,
  userName,
  phoneNumber,
}: UserFollowUpTimelineProps) {
  const locale = useLocale();
  const t = useTranslations("adminFollowUps");
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [calls, setCalls] = useState<FollowUpCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLogModal, setActiveLogModal] = useState<ActiveLogModal>(null);
  const [callNowOpen, setCallNowOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FollowUpCall | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchFollowUpCalls(locale, { userId });
    setCalls(data.calls);
    setLoading(false);
  }, [locale, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (
    payload: Parameters<typeof createFollowUpCall>[1],
  ) => {
    setSubmitting(true);
    try {
      await createFollowUpCall(locale, payload, userName);
      toast.success(t("callSaved"));
      setActiveLogModal(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (
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
      } else {
        toast.error(t("updateCallError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteFollowUpCall(locale, deleteTarget.id);
      if (result.ok) {
        toast.success(t("deleteCallSuccess"));
        setDeleteTarget(null);
        await load();
      } else {
        toast.error(t("deleteCallError"));
      }
    } finally {
      setDeleting(false);
    }
  };

  const editingCall =
    activeLogModal?.kind === "edit" ? activeLogModal.call : null;

  return (
    <div dir={textDir}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t("timelineTitle")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {phoneNumber && (
            <button
              type="button"
              onClick={() => setCallNowOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <IoCallOutline />
              {t("callNow")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveLogModal({ kind: "create" })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            {t("logCall")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <FollowUpCallsList
          calls={calls}
          onDelete={(call) => setDeleteTarget(call)}
          onEdit={(call) => setActiveLogModal({ kind: "edit", call })}
        />
      )}

      {phoneNumber && (
        <CallNowPhoneModal
          open={callNowOpen}
          onClose={() => setCallNowOpen(false)}
          phoneNumber={phoneNumber}
          customerName={userName}
        />
      )}

      {activeLogModal && (
        <LogFollowUpCallModal
          open
          onClose={() => setActiveLogModal(null)}
          userId={userId}
          userName={userName}
          phoneNumber={phoneNumber}
          editingCall={editingCall}
          onSubmit={handleCreate}
          onUpdate={handleUpdate}
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
    </div>
  );
}
