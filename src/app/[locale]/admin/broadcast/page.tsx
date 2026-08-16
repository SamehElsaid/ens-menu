"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  IoCloseOutline,
  IoMailOutline,
  IoPeopleOutline,
  IoRefreshOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  PageColumns,
  PageHeader,
  PageShell,
  SectionHeader,
  SegmentedControl,
  Skeleton,
  StatCard,
  Textarea,
} from "@/components/ui";
import CustomInput from "@/components/Custom/CustomInput";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  getBroadcastTemplate,
  hasBroadcastTemplate,
} from "@/lib/adminBroadcastTemplates";

type BroadcastAudience =
  | "all"
  | "selected"
  | "test"
  | "pro"
  | "free"
  | "no-menu"
  | "with-menu"
  | "products-no-image";

type PreviewResponse = {
  count: number;
  sample: Array<{ id: number; name: string; email: string }>;
  capped: boolean;
  maxRecipients: number;
};

type SendResponse = {
  total: number;
  sent: number;
  failed: number;
  failures?: string[];
  capped?: boolean;
  maxRecipients?: number;
};

type UserSearchRow = {
  id: number;
  name: string;
  email: string;
};

const AUDIENCES: BroadcastAudience[] = [
  "all",
  "pro",
  "free",
  "no-menu",
  "with-menu",
  "products-no-image",
  "selected",
  "test",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/**
 * Caption for a control that owns its own labelling.
 *
 * A `Field` would emit a `for` pointing at a radiogroup, which is not a
 * labelable element; the group carries its own accessible name instead, so the
 * visible caption is a ticket label and nothing more.
 */
function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="ui-label">{label}</p>
      {children}
    </div>
  );
}

function parseTestEmails(value: string): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];

  for (const part of value.split(/[\s,;]+/)) {
    const email = part.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }

  return emails;
}

export default function AdminBroadcastPage() {
  const locale = useLocale();
  const t = useTranslations("adminBroadcast");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const defaultEmailLocale = locale === "ar" ? "ar" : "en";
  const defaultTemplate = getBroadcastTemplate(
    "products-no-image",
    defaultEmailLocale,
  );

  const [audience, setAudience] =
    useState<BroadcastAudience>("products-no-image");
  const [subject, setSubject] = useState(defaultTemplate.subject);
  const [message, setMessage] = useState(defaultTemplate.message);
  const [emailLocale, setEmailLocale] = useState<"ar" | "en">(
    defaultEmailLocale,
  );

  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchRow[]>([]);
  const [testEmailsInput, setTestEmailsInput] = useState("");

  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const applyAudienceTemplate = (nextAudience: BroadcastAudience) => {
    if (hasBroadcastTemplate(nextAudience)) {
      const template = getBroadcastTemplate(nextAudience, emailLocale);
      setSubject(template.subject);
      setMessage(template.message);
      return;
    }

    if (nextAudience === "test") return;

    setSubject("");
    setMessage("");
  };

  const handleAudienceChange = (nextAudience: BroadcastAudience) => {
    setAudience(nextAudience);
    applyAudienceTemplate(nextAudience);
  };

  const handleEmailLocaleChange = (nextLocale: "ar" | "en") => {
    setEmailLocale(nextLocale);
    if (hasBroadcastTemplate(audience)) {
      const template = getBroadcastTemplate(audience, nextLocale);
      setSubject(template.subject);
      setMessage(template.message);
    }
  };

  const selectedIds = useMemo(
    () => selectedUsers.map((user) => user.id),
    [selectedUsers],
  );

  const testEmails = useMemo(
    () => parseTestEmails(testEmailsInput),
    [testEmailsInput],
  );

  const loadPreview = useCallback(async () => {
    if (audience === "selected" && selectedIds.length === 0) {
      setPreview(null);
      return;
    }
    if (audience === "test" && testEmails.length === 0) {
      setPreview(null);
      return;
    }

    setPreviewLoading(true);
    const params: Record<string, string> = { audience };
    if (audience === "selected" && selectedIds.length > 0) {
      params.userIds = selectedIds.join(",");
    }
    if (audience === "test" && testEmails.length > 0) {
      params.emails = testEmails.join(",");
    }

    const response = await axiosGet<PreviewResponse>(
      "/admin/broadcast/preview",
      locale,
      undefined,
      params,
    );
    setPreviewLoading(false);

    if (response.status && response.data) {
      setPreview(response.data);
      return;
    }

    setPreview(null);
    toast.error(t("previewError"));
  }, [audience, locale, selectedIds, testEmails, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (audience === "selected" && selectedIds.length === 0) {
        setPreview(null);
        return;
      }
      if (audience === "test" && testEmails.length === 0) {
        setPreview(null);
        return;
      }
      void loadPreview();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [audience, selectedIds, testEmails, loadPreview]);

  useEffect(() => {
    if (audience !== "selected") return;

    const timeout = setTimeout(async () => {
      const query = userSearch.trim();
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      const response = await axiosGet<{
        users: UserSearchRow[];
      }>("/admin/users", locale, undefined, {
        search: query,
        limit: "20",
        page: "1",
        filter: "all",
      });
      setSearchLoading(false);

      if (response.status && response.data?.users) {
        setSearchResults(response.data.users);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [audience, userSearch, locale]);

  const toggleUser = (user: UserSearchRow) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((item) => item.id === user.id);
      if (exists) return prev.filter((item) => item.id !== user.id);
      return [...prev, user];
    });
  };

  const removeSelectedUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const canSend =
    subject.trim().length >= 2 &&
    message.trim().length >= 5 &&
    (audience !== "selected" || selectedIds.length > 0) &&
    (audience !== "test" || testEmails.length > 0) &&
    (preview?.count ?? 0) > 0;

  const handleSend = async () => {
    setSending(true);
    const response = await axiosPost<
      {
        audience: BroadcastAudience;
        userIds?: number[];
        emails?: string[];
        subject: string;
        message: string;
        locale: "ar" | "en";
      },
      SendResponse
    >(
      "/admin/broadcast/send",
      locale,
      {
        audience,
        userIds: audience === "selected" ? selectedIds : undefined,
        emails: audience === "test" ? testEmails : undefined,
        subject: subject.trim(),
        message: message.trim(),
        locale: emailLocale,
      },
      false,
    );
    setSending(false);
    setConfirmOpen(false);

    if (response.status && response.data) {
      const { sent, failed, total } = response.data;
      if (failed > 0) {
        toast.warn(t("sendPartial", { sent, failed, total }));
      } else {
        toast.success(t("sendSuccess", { sent, total }));
      }
      if (hasBroadcastTemplate(audience)) {
        const template = getBroadcastTemplate(audience, emailLocale);
        setSubject(template.subject);
        setMessage(template.message);
      } else if (audience !== "test") {
        setSubject("");
        setMessage("");
      }
      return;
    }

    const payload = response.data as { error?: string };
    toast.error(payload?.error || t("sendError"));
  };

  const recipientsAside = (
    <Card as="aside" padded="md" className="space-y-3">
      <SectionHeader
        ruled
        eyebrow={t("audienceLabel")}
        title={
          <span className="inline-flex items-center gap-2">
            <IoPeopleOutline className="text-fg-subtle" aria-hidden />
            {t("previewTitle")}
          </span>
        }
      />

      <div aria-live="polite" className="space-y-3">
        {preview || previewLoading ? (
          <StatCard
            label={t("recipientsCount")}
            value={
              <span lang="en">
                {(preview?.count ?? 0).toLocaleString("en-US")}
              </span>
            }
            loading={previewLoading}
            hint={previewLoading ? t("previewLoading") : undefined}
          />
        ) : (
          <EmptyState title={t("noRecipients")} size="sm" />
        )}

        {preview?.capped ? (
          <Alert tone="warning">
            {t("cappedNotice", { max: preview.maxRecipients })}
          </Alert>
        ) : null}

        {preview && preview.sample.length > 0 ? (
          <div>
            <p className="ui-label border-b border-line pb-1.5">
              {t("sampleRecipients")}
            </p>
            <ul className="divide-y divide-line">
              {preview.sample.map((user) => (
                <li key={user.id} className="py-2">
                  <p className="truncate text-[13px] font-medium text-fg">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-fg-subtle">
                    {user.email}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <Alert tone="info" icon={<IoMailOutline />}>
        {t("hint")}
      </Alert>
    </Card>
  );

  return (
    <PageShell
      kind="wide"
      className="admin-broadcast-page"
      header={
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            { label: tAdmin("title"), href: "/admin" },
            { label: t("title") },
          ]}
          breadcrumbsLabel={tCommon("breadcrumb")}
          actions={
            <Button
              variant="secondary"
              startIcon={<IoRefreshOutline />}
              onClick={() => void loadPreview()}
            >
              {t("refresh")}
            </Button>
          }
        />
      }
      footerSticky
      footer={
        /* Sending to thousands of people is the page's one irreversible act, so
           the button stays visible rather than sitting past a 420px preview
           iframe and an eighteen-row textarea. */
        <div className="flex items-center justify-end gap-3">
          {preview ? (
            <p className="text-xs text-fg-muted">
              {t("recipientsCount")}:{" "}
              <span className="ui-figure text-fg" lang="en">
                {preview.count.toLocaleString("en-US")}
              </span>
            </p>
          ) : null}
          <Button
            disabled={!canSend || sending}
            loading={sending}
            onClick={() => setConfirmOpen(true)}
          >
            {t("send")}
          </Button>
        </div>
      }
    >
      <PageColumns side={recipientsAside}>
        <Card as="section" padded="md" className="space-y-4">
          <ControlGroup label={t("audienceLabel")}>
            <SegmentedControl
              label={t("audienceLabel")}
              value={audience}
              onChange={handleAudienceChange}
              options={AUDIENCES.map((item) => ({
                value: item,
                label: t(`audience.${item}`),
              }))}
            />
          </ControlGroup>

          {audience === "selected" && (
            <div className="space-y-3 rounded-lg border border-dashed border-line-strong bg-surface-2/40 p-3">
              <CustomInput
                type="text"
                id="broadcast-user-search"
                label={t("searchUsers")}
                placeholder={t("searchUsersPlaceholder")}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                icon={<IoSearchOutline />}
              />

              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="secondary"
                      size="xs"
                      endIcon={<IoCloseOutline />}
                      onClick={() => removeSelectedUser(user.id)}
                      aria-label={`${t("audience.selected")}: ${user.name}`}
                    >
                      {user.name}
                    </Button>
                  ))}
                </div>
              )}

              <div
                className="max-h-56 overflow-y-auto rounded-lg border border-line bg-surface"
                aria-busy={searchLoading || undefined}
                aria-live="polite"
              >
                {searchLoading ? (
                  <div className="flex flex-col gap-2 p-3">
                    <span className="sr-only">{t("searching")}</span>
                    {[0, 1, 2].map((row) => (
                      <Skeleton key={row} className="h-8 w-full" />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-fg-muted">
                    {t("searchUsersPlaceholder")}
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {searchResults.map((user) => (
                      <li key={user.id} className="px-3 py-2">
                        <Checkbox
                          checked={selectedUsers.some(
                            (item) => item.id === user.id,
                          )}
                          onChange={() => toggleUser(user)}
                          label={user.name}
                          hint={user.email}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {audience === "test" && (
            <div className="space-y-2 rounded-lg border border-dashed border-line-strong bg-surface-2/40 p-3">
              <Field
                label={t("testEmails")}
                htmlFor="broadcast-test-emails"
                hint={t("testEmailsHint")}
              >
                <Textarea
                  id="broadcast-test-emails"
                  rows={3}
                  dir="ltr"
                  value={testEmailsInput}
                  onChange={(e) => setTestEmailsInput(e.target.value)}
                  placeholder={t("testEmailsPlaceholder")}
                  className="font-mono"
                />
              </Field>
              {testEmails.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" dir="ltr">
                  {testEmails.map((email) => (
                    <li key={email}>
                      <Badge tone="brand">{email}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Field label={t("subject")} htmlFor="broadcast-subject">
            <Input
              id="broadcast-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subjectPlaceholder")}
            />
          </Field>

          <Field
            label={t("message")}
            htmlFor="broadcast-message"
            hint={t("messageHint")}
          >
            <Textarea
              id="broadcast-message"
              rows={18}
              dir="ltr"
              spellCheck={false}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              className="font-mono text-sm leading-relaxed"
            />
          </Field>

          {message.trim() ? (
            <div className="overflow-hidden rounded-lg border border-line">
              <p className="ui-label border-b border-line bg-surface-2 px-3 py-2">
                {t("htmlPreview")}
              </p>
              {/* The frame renders the mail body as a client will render it, so
                  it keeps the paper white rather than the product's bone. */}
              <iframe
                title={t("htmlPreview")}
                srcDoc={message.replace(
                  /\{\{\s*name\s*\}\}/gi,
                  emailLocale === "ar" ? "اسم العميل" : "Customer Name",
                )}
                className="h-[420px] w-full border-0 bg-white"
                sandbox=""
              />
            </div>
          ) : null}

          <ControlGroup label={t("emailLocale")}>
            <SegmentedControl
              label={t("emailLocale")}
              value={emailLocale}
              onChange={handleEmailLocaleChange}
              options={[
                { value: "ar" as const, label: t("localeAr") },
                { value: "en" as const, label: t("localeEn") },
              ]}
            />
          </ControlGroup>
        </Card>
      </PageColumns>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleSend()}
        title={t("confirmTitle")}
        description={t("confirmMessage", { count: preview?.count ?? 0 })}
        confirmLabel={t("confirmSend")}
        cancelLabel={tCommon("cancel")}
        loading={sending}
        tone="brand"
        icon={<FiAlertTriangle />}
      />
    </PageShell>
  );
}
