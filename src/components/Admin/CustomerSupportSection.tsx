"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPut, axiosPost } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  SectionHeader,
  Select,
  Textarea,
} from "@/components/ui";
import type { SupportCase } from "@/types/AdminCustomer";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

interface Props {
  userId: number;
}

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

const FORM_ID = "customer-support-case-form";

export default function CustomerSupportSection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.support");
  const tOrders = useTranslations(
    "adminUsers.userDetails.customerSections.orders",
  );
  const tCommon = useTranslations("common");
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ticketRef, setTicketRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { runApiAction } = useApiAction();

  const requestCases = useCallback(
    () =>
      axiosGet<{ cases: SupportCase[] }>(
        `/admin/users/${userId}/support`,
        locale,
      ),
    [userId, locale],
  );
  const casesQuery = useApiQuery({
    request: requestCases,
    errorToast: ({ error }) => error,
    onSuccess: (data) => setCases(data.cases),
  });
  const loading = casesQuery.loading;
  const load = casesQuery.refetch;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await runApiAction(
        () =>
          axiosPost(`/admin/users/${userId}/support`, locale, {
            subject,
            message,
            ticketRef: ticketRef || undefined,
          }),
        {
          successToast: t("createSuccess"),
          errorToast: t("createError"),
          onSuccess: () => {
            setFormOpen(false);
            setSubject("");
            setMessage("");
            setTicketRef("");
            void load();
          },
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (caseId: number, status: string) => {
    await runApiAction(
      () =>
        axiosPut(`/admin/users/${userId}/support/${caseId}`, locale, {
          status,
        }),
      {
        successToast: t("statusSuccess"),
        errorToast: ({ error }) => error,
        onSuccess: () => void load(),
      },
    );
  };

  return (
    <Card padded="lg">
      <SectionHeader
        title={t("title")}
        className="mb-4"
        actions={
          <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
            {t("add")}
          </Button>
        }
      />

      {loading ? (
        <LoadingBlock label={t("loading")} />
      ) : cases.length === 0 ? (
        <EmptyState title={t("empty")} size="sm" />
      ) : (
        <ul className="flex flex-col gap-4">
          {cases.map((c) => (
            <Card as="li" key={c.id} padded="md">
              <CardHeader
                title={c.subject}
                className="mb-2"
                actions={
                  <Select
                    inputSize="sm"
                    value={c.status}
                    aria-label={tOrders("status")}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                    wrapperClassName="w-auto"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`status.${s}`)}
                      </option>
                    ))}
                  </Select>
                }
              />
              <p className="mb-2 text-sm text-fg-muted">{c.message}</p>
              <div className="flex flex-wrap gap-3 text-xs text-fg-subtle">
                <span>{formatAdminDate(c.createdAt, locale)}</span>
                {c.ticketRef && (
                  <span>
                    {t("ticket")}: {c.ticketRef}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </ul>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t("add")}
        size="sm"
        dismissible={!submitting}
        closeLabel={tCommon("close")}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              variant="primary"
              loading={submitting}
            >
              {t("save")}
            </Button>
          </>
        }
      >
        <form
          id={FORM_ID}
          onSubmit={handleCreate}
          className="flex flex-col gap-4"
        >
          <Field label={t("subject")} required>
            <Input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field label={t("message")} required>
            <Textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>
          <Field label={t("ticketRef")}>
            <Input
              value={ticketRef}
              onChange={(e) => setTicketRef(e.target.value)}
            />
          </Field>
        </form>
      </Modal>
    </Card>
  );
}
