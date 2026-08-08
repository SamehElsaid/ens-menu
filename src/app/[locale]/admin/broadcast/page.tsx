"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  IoArrowBack,
  IoMailOutline,
  IoPeopleOutline,
  IoRefreshOutline,
  IoSearchOutline,
} from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  Field,
  Input,
  PageHeader,
  SegmentedControl,
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
  const router = useRouter();
  const textDir = locale === "ar" ? "rtl" : "ltr";
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
    if (audience === "selected" && selectedIds.length === 0) {
      setPreview(null);
      return;
    }
    if (audience === "test" && testEmails.length === 0) {
      setPreview(null);
      return;
    }
    void loadPreview();
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

  return (
    <div dir={textDir} className="admin-broadcast-page space-y-6 p-4 md:p-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              startIcon={<IoArrowBack className="rtl:rotate-180" />}
              onClick={() => router.push("/admin")}
            >
              {t("backToAdmin")}
            </Button>
            <Button
              variant="secondary"
              startIcon={<IoRefreshOutline />}
              onClick={() => void loadPreview()}
            >
              {t("refresh")}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <CardDashBoard className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-fg">
              {t("audienceLabel")}
            </label>
            <SegmentedControl
              label={t("audienceLabel")}
              value={audience}
              onChange={handleAudienceChange}
              options={AUDIENCES.map((item) => ({
                value: item,
                label: t(`audience.${item}`),
              }))}
            />
          </div>

          {audience === "selected" && (
            <div className="space-y-3 rounded-lg border border-dashed border-line p-4">
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
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => removeSelectedUser(user.id)}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {user.name} ×
                    </button>
                  ))}
                </div>
              )}

              {searchLoading ? (
                <p className="text-sm text-fg-subtle">{t("searching")}</p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {searchResults.map((user) => {
                    const checked = selectedUsers.some(
                      (item) => item.id === user.id,
                    );
                    return (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleUser(user)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-fg">
                            {user.name}
                          </span>
                          <span className="block truncate text-xs text-fg-subtle">
                            {user.email}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {audience === "test" && (
            <div className="space-y-2 rounded-lg border border-dashed border-line p-4">
              <label
                htmlFor="broadcast-test-emails"
                className="block text-sm font-semibold text-fg-muted"
              >
                {t("testEmails")}
              </label>
              <p className="text-xs text-fg-muted">{t("testEmailsHint")}</p>
              <textarea
                id="broadcast-test-emails"
                rows={3}
                dir="ltr"
                value={testEmailsInput}
                onChange={(e) => setTestEmailsInput(e.target.value)}
                placeholder={t("testEmailsPlaceholder")}
                className="w-full rounded-lg border border-line bg-white px-4 py-3 font-mono text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {testEmails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {testEmails.map((email) => (
                    <span
                      key={email}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {email}
                    </span>
                  ))}
                </div>
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
            <div className="mt-3 overflow-hidden rounded-lg border border-line">
              <p className="border-b border-line bg-surface-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
                {t("htmlPreview")}
              </p>
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-fg">
              {t("emailLocale")}
            </label>
            <SegmentedControl
              label={t("emailLocale")}
              value={emailLocale}
              onChange={handleEmailLocaleChange}
              options={[
                { value: "ar" as const, label: t("localeAr") },
                { value: "en" as const, label: t("localeEn") },
              ]}
            />
          </div>

          <Button
            disabled={!canSend || sending}
            loading={sending}
            onClick={() => setConfirmOpen(true)}
            className="w-full sm:w-auto"
          >
            {t("send")}
          </Button>
        </CardDashBoard>

        <CardDashBoard className="h-fit space-y-4 p-5">
          <div className="flex items-center gap-2 text-fg-muted">
            <IoPeopleOutline className="text-primary" />
            <h2 className="font-semibold">{t("previewTitle")}</h2>
          </div>

          {previewLoading ? (
            <p className="text-sm text-fg-subtle">{t("previewLoading")}</p>
          ) : preview ? (
            <>
              <p className="text-3xl font-bold text-primary">{preview.count}</p>
              <p className="text-sm text-fg-subtle">{t("recipientsCount")}</p>
              {preview.capped && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  {t("cappedNotice", { max: preview.maxRecipients })}
                </p>
              )}
              {preview.sample.length > 0 && (
                <div className="space-y-2 border-t border-line pt-4 dark:border-line">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                    {t("sampleRecipients")}
                  </p>
                  {preview.sample.map((user) => (
                    <div key={user.id} className="text-sm">
                      <p className="font-medium text-fg">{user.name}</p>
                      <p className="truncate text-xs text-fg-subtle">
                        {user.email}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-fg-subtle">{t("noRecipients")}</p>
          )}

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <IoMailOutline className="mb-2 text-base text-primary" />
            {t("hint")}
          </div>
        </CardDashBoard>
      </div>

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
    </div>
  );
}
