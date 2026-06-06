"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { parseFollowUpPurpose } from "@/lib/fetchAdminFollowUp";
import type {
  CreateFollowUpCallPayload,
  FollowUpCall,
  FollowUpOutcome,
  FollowUpPurpose,
  UpdateFollowUpCallPayload,
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
  onUpdate?: (
    callId: string,
    payload: UpdateFollowUpCallPayload,
  ) => Promise<void>;
  editingCall?: FollowUpCall | null;
  submitting?: boolean;
};

const OUTCOMES: FollowUpOutcome[] = [
  "answered",
  "no_answer",
  "busy",
  "wrong_number",
  "callback_requested",
];

const PURPOSES: FollowUpPurpose[] = [
  "onboarding",
  "free_plan",
  "upgrade_pro",
  "renewal",
  "support",
  "other",
];

export default function LogFollowUpCallModal({
  open,
  onClose,
  userId,
  userName,
  phoneNumber,
  onSubmit,
  onUpdate,
  editingCall = null,
  submitting = false,
}: LogFollowUpCallModalProps) {
  const t = useTranslations("adminFollowUps");
  const authData = useAppSelector((state) => state.auth.data) as {
    name?: string;
  } | null;

  const isEditing = Boolean(editingCall);

  const [outcome, setOutcome] = useState<FollowUpOutcome>("answered");
  const [purpose, setPurpose] = useState<FollowUpPurpose>("onboarding");
  const [agentName, setAgentName] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [cafeName, setCafeName] = useState("");
  const [otherContactNumbers, setOtherContactNumbers] = useState("");

  useEffect(() => {
    if (!open) return;

    if (editingCall) {
      setOutcome(editingCall.outcome);
      setPurpose(parseFollowUpPurpose(editingCall.purpose));
      setAgentName(editingCall.adminName ?? authData?.name ?? "");
      setNotes(editingCall.notes ?? "");
      setNextFollowUpAt(editingCall.nextFollowUpAt?.slice(0, 10) ?? "");
      setCustomerName(editingCall.customerName ?? "");
      setGovernorate(editingCall.governorate ?? "");
      setCafeName(editingCall.cafeName ?? "");
      setOtherContactNumbers(editingCall.otherContactNumbers ?? "");
      return;
    }

    setOutcome("answered");
    setPurpose("onboarding");
    setAgentName(authData?.name ?? "");
    setNotes("");
    setNextFollowUpAt("");
    setCustomerName("");
    setGovernorate("");
    setCafeName("");
    setOtherContactNumbers("");
  }, [open, editingCall, authData?.name]);

  if (!open) return null;

  const fieldClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40";

  const resetForm = () => {
    setNotes("");
    setNextFollowUpAt("");
    setPurpose("onboarding");
    setOutcome("answered");
    setAgentName(authData?.name ?? "");
    setCustomerName("");
    setGovernorate("");
    setCafeName("");
    setOtherContactNumbers("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAgent = agentName.trim();
    if (!trimmedAgent) return;

    const payload = {
      outcome,
      purpose,
      agentName: trimmedAgent,
      notes: notes.trim() || undefined,
      nextFollowUpAt: nextFollowUpAt || null,
      customerName: customerName.trim() || undefined,
      governorate: governorate.trim() || undefined,
      cafeName: cafeName.trim() || undefined,
      otherContactNumbers: otherContactNumbers.trim() || undefined,
    };

    if (isEditing && editingCall && onUpdate) {
      await onUpdate(editingCall.id, payload);
    } else {
      await onSubmit({ userId, ...payload });
    }

    resetForm();
  };

  const modalTitle = isEditing ? t("editCallTitle") : t("logCallTitle");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal
        aria-labelledby="log-call-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2
            id="log-call-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {modalTitle}
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

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
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
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {t("noPhone")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("customerName")}{" "}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  ({t("optional")})
                </span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={fieldClass}
                placeholder={t("customerNamePlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("governorate")}{" "}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  ({t("optional")})
                </span>
              </label>
              <input
                type="text"
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className={fieldClass}
                placeholder={t("governoratePlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("cafeName")}{" "}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  ({t("optional")})
                </span>
              </label>
              <input
                type="text"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className={fieldClass}
                placeholder={t("cafeNamePlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("otherContactNumbers")}{" "}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  ({t("optional")})
                </span>
              </label>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                value={otherContactNumbers}
                onChange={(e) => setOtherContactNumbers(e.target.value)}
                className={`${fieldClass} tabular-nums`}
                placeholder={t("otherContactNumbersPlaceholder")}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("purpose")}
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as FollowUpPurpose)}
              className={fieldClass}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {t(`purposes.${p}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting
                ? t("saving")
                : isEditing
                  ? t("saveChanges")
                  : t("saveCall")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
