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
import {
  Button,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";
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

const FORM_ID = "log-follow-up-call-form";

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
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="md"
      dismissible={!submitting}
      closeLabel={t("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            loading={submitting}
            disabled={!agentName.trim()}
          >
            {submitting
              ? t("saving")
              : isEditing
                ? t("saveChanges")
                : t("saveCall")}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div>
          <p className="text-sm font-medium text-fg">{userName}</p>
          {phoneNumber ? (
            <PhoneDisplay value={phoneNumber} className="text-sm text-fg-muted" />
          ) : (
            <p className="text-sm text-fg-subtle">{t("noPhone")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("customerName")} optionalLabel={t("optional")}>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t("customerNamePlaceholder")}
            />
          </Field>
          <Field label={t("governorate")} optionalLabel={t("optional")}>
            <Input
              type="text"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              placeholder={t("governoratePlaceholder")}
            />
          </Field>
          <Field label={t("cafeName")} optionalLabel={t("optional")}>
            <Input
              type="text"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              placeholder={t("cafeNamePlaceholder")}
            />
          </Field>
          <Field
            label={t("otherContactNumbers")}
            optionalLabel={t("optional")}
          >
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              className="tabular-nums"
              value={otherContactNumbers}
              onChange={(e) => setOtherContactNumbers(e.target.value)}
              placeholder={t("otherContactNumbersPlaceholder")}
            />
          </Field>
        </div>

        <Field label={t("agentName")} required>
          <Input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            required
            placeholder={t("agentNamePlaceholder")}
          />
        </Field>

        <Field label={t("outcome")}>
          <Select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as FollowUpOutcome)}
          >
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {t(`outcomes.${o}`)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("purpose")}>
          <Select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as FollowUpPurpose)}
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {t(`purposes.${p}`)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("notes")}>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
            placeholder={t("notesPlaceholder")}
          />
        </Field>

        <Field label={t("nextFollowUp")}>
          <Input
            type="date"
            value={nextFollowUpAt}
            onChange={(e) => setNextFollowUpAt(e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
