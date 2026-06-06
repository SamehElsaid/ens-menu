"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import type {
  CreateFollowUpCallPayload,
  FollowUpOutcome,
} from "@/types/AdminFollowUp";
import { IoCloseOutline } from "react-icons/io5";
import PhoneDisplay from "@/components/Global/PhoneDisplay";

type LogFollowUpCallModalProps = {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  phoneNumber: string | null;
  onSubmit: (payload: CreateFollowUpCallPayload) => Promise<void>;
  submitting?: boolean;
};

const OUTCOMES: FollowUpOutcome[] = [
  "answered",
  "no_answer",
  "busy",
  "wrong_number",
  "callback_requested",
];

export default function LogFollowUpCallModal({
  open,
  onClose,
  userId,
  userName,
  phoneNumber,
  onSubmit,
  submitting = false,
}: LogFollowUpCallModalProps) {
  const t = useTranslations("adminFollowUps");
  const authData = useAppSelector((state) => state.auth.data) as {
    name?: string;
  } | null;

  const [outcome, setOutcome] = useState<FollowUpOutcome>("answered");
  const [purpose, setPurpose] = useState("");
  const [agentName, setAgentName] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");

  useEffect(() => {
    if (open) {
      setAgentName(authData?.name ?? "");
    }
  }, [open, authData?.name]);

  if (!open) return null;

  const fieldClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAgent = agentName.trim();
    if (!trimmedAgent) return;

    await onSubmit({
      userId,
      outcome,
      purpose: purpose.trim() || undefined,
      agentName: trimmedAgent,
      notes: notes.trim() || undefined,
      nextFollowUpAt: nextFollowUpAt || null,
    });
    setNotes("");
    setNextFollowUpAt("");
    setPurpose("");
    setOutcome("answered");
    setAgentName(authData?.name ?? "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal
        aria-labelledby="log-call-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2
            id="log-call-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {t("logCallTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={t("close")}
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {userName}
            </p>
            {phoneNumber ? (
              <PhoneDisplay
                value={phoneNumber}
                className="text-sm text-slate-500 dark:text-slate-400"
              />
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">{t("noPhone")}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("agentName")} *
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              required
              className={fieldClass}
              placeholder={t("agentNamePlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("outcome")}
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as FollowUpOutcome)}
              className={fieldClass}
            >
              {OUTCOMES.map((o) => (
                <option key={o} value={o}>
                  {t(`outcomes.${o}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("purpose")}
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className={fieldClass}
              placeholder={t("purposePlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`${fieldClass} resize-none`}
              placeholder={t("notesPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("nextFollowUp")}
            </label>
            <input
              type="date"
              value={nextFollowUpAt}
              onChange={(e) => setNextFollowUpAt(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || !agentName.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? t("saving") : t("saveCall")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
