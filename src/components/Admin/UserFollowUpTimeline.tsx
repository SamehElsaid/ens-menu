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
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  SectionHeader,
  Skeleton,
} from "@/components/ui";
import CallNowPhoneModal from "@/components/Admin/CallNowPhoneModal";
import FollowUpCallsList from "@/components/Admin/FollowUpCallsList";
import LogFollowUpCallModal from "@/components/Admin/LogFollowUpCallModal";
import { toast } from "react-toastify";
import { IoCallOutline } from "react-icons/io5";

type UserFollowUpTimelineProps = {
  userId: number;
  userName: string;
  phoneNumber: string | null;
};

type ActiveLogModal =
  { kind: "create" } | { kind: "edit"; call: FollowUpCall } | null;

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
      const result = await createFollowUpCall(locale, payload, userName);
      if (!result.call) {
        toast.error(t("callSaveError"));
        return;
      }
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
      <SectionHeader
        className="mb-4"
        title={t("timelineTitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            {phoneNumber ? (
              <Button
                type="button"
                variant="secondary"
                startIcon={<IoCallOutline />}
                onClick={() => setCallNowOpen(true)}
              >
                {t("callNow")}
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={() => setActiveLogModal({ kind: "create" })}
            >
              {t("logCall")}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title={t("deleteCallTitle")}
        description={t("deleteCallMessage")}
        confirmLabel={t("deleteCall")}
        cancelLabel={t("cancel")}
        loading={deleting}
        tone="brand"
        icon={<FiAlertTriangle />}
      />
    </div>
  );
}
