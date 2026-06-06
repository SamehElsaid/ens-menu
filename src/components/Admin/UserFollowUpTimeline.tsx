"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  createFollowUpCall,
  fetchFollowUpCalls,
} from "@/lib/fetchAdminFollowUp";
import type { FollowUpCall } from "@/types/AdminFollowUp";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [callNowOpen, setCallNowOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchFollowUpCalls(locale, { userId });
    setCalls(data.calls);
    setLoading(false);
  }, [locale, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (
    payload: Parameters<typeof createFollowUpCall>[1],
  ) => {
    setSubmitting(true);
    try {
      await createFollowUpCall(locale, payload, userName);
      toast.success(t("callSaved"));
      setModalOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir={textDir}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
          >
            {t("logCall")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <FollowUpCallsList calls={calls} />
      )}

      {phoneNumber && (
        <CallNowPhoneModal
          open={callNowOpen}
          onClose={() => setCallNowOpen(false)}
          phoneNumber={phoneNumber}
          customerName={userName}
        />
      )}

      <LogFollowUpCallModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        userName={userName}
        phoneNumber={phoneNumber}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
