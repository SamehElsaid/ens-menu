"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import CardDashBoard from "@/components/Card/CardDashBoard";
import type { SupportCase } from "@/types/AdminCustomer";

interface Props {
  userId: number;
}

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export default function CustomerSupportSection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.support");
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ticketRef, setTicketRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axiosGet<{ cases: SupportCase[] }>(
        `/admin/users/${userId}/support`,
        locale,
      );
      if (result.status && result.data) {
        setCases(result.data.cases);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, locale]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const result = await axiosPost<
        { subject: string; message: string; ticketRef?: string },
        unknown
      >(`/admin/users/${userId}/support`, locale, {
        subject,
        message,
        ticketRef: ticketRef || undefined,
      });
      if (result.status) {
        toast.success(t("createSuccess"));
        setFormOpen(false);
        setSubject("");
        setMessage("");
        setTicketRef("");
        load();
      } else {
        toast.error(t("createError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (caseId: number, status: string) => {
    const result = await axiosPatch<{ status: string }, unknown>(
      `/admin/users/${userId}/support/${caseId}`,
      locale,
      { status },
    );
    if (result.status) {
      toast.success(t("statusSuccess"));
      load();
    }
  };

  return (
    <CardDashBoard>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t("title")}
        </h2>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
        >
          {t("add")}
        </button>
      </div>
      {loading ? (
        <p className="text-slate-500">{t("loading")}</p>
      ) : cases.length === 0 ? (
        <p className="text-slate-500">{t("empty")}</p>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <h3 className="font-semibold">{c.subject}</h3>
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`status.${s}`)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                {c.message}
              </p>
              <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                <span>{formatAdminDate(c.createdAt, locale)}</span>
                {c.ticketRef && (
                  <span>
                    {t("ticket")}: {c.ticketRef}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-3"
          >
            <h3 className="text-lg font-bold">{t("add")}</h3>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subject")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("message")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <input
              value={ticketRef}
              onChange={(e) => setTicketRef(e.target.value)}
              placeholder={t("ticketRef")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
              >
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}
    </CardDashBoard>
  );
}
