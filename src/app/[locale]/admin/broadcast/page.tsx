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
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import CustomBtn from "@/components/Custom/CustomBtn";
import CustomInput from "@/components/Custom/CustomInput";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { cn } from "@/lib/cn";
import {
  getBroadcastTemplate,
  hasBroadcastTemplate,
} from "@/lib/adminBroadcastTemplates";

type BroadcastAudience =
  | "all"
  | "selected"
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
];

export default function AdminBroadcastPage() {
  const locale = useLocale();
  const t = useTranslations("adminBroadcast");
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

  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const applyAudienceTemplate = (nextAudience: BroadcastAudience) => {
    if (hasBroadcastTemplate(nextAudience)) {
      const template = getBroadcastTemplate(nextAudience, emailLocale);
      setSubject(template.subject);
      setMessage(template.message);
      return;
    }

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

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    const params: Record<string, string> = { audience };
    if (audience === "selected" && selectedIds.length > 0) {
      params.userIds = selectedIds.join(",");
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
  }, [audience, locale, selectedIds, t]);

  useEffect(() => {
    if (audience === "selected" && selectedIds.length === 0) {
      setPreview(null);
      return;
    }
    void loadPreview();
  }, [audience, selectedIds, loadPreview]);

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
    (preview?.count ?? 0) > 0;

  const handleSend = async () => {
    setSending(true);
    const response = await axiosPost<
      {
        audience: BroadcastAudience;
        userIds?: number[];
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
      } else {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="mb-2 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary dark:text-slate-400"
          >
            <IoArrowBack className={cn(locale === "ar" && "rotate-180")} />
            {t("backToAdmin")}
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadPreview()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <IoRefreshOutline />
          {t("refresh")}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <CardDashBoard className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("audienceLabel")}
            </label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAudienceChange(item)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    audience === item
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 text-slate-600 hover:border-primary/40 dark:border-slate-600 dark:text-slate-300",
                  )}
                >
                  {t(`audience.${item}`)}
                </button>
              ))}
            </div>
          </div>

          {audience === "selected" && (
            <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-600">
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
                <p className="text-sm text-slate-500">{t("searching")}</p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {searchResults.map((user) => {
                    const checked = selectedUsers.some(
                      (item) => item.id === user.id,
                    );
                    return (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleUser(user)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {user.name}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
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

          <CustomInput
            type="text"
            id="broadcast-subject"
            label={t("subject")}
            placeholder={t("subjectPlaceholder")}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div>
            <label
              htmlFor="broadcast-message"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              {t("message")}
            </label>
            <textarea
              id="broadcast-message"
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("emailLocale")}
            </label>
            <div className="flex gap-2">
              {(["ar", "en"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleEmailLocaleChange(item)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium",
                    emailLocale === item
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300",
                  )}
                >
                  {item === "ar" ? t("localeAr") : t("localeEn")}
                </button>
              ))}
            </div>
          </div>

          <CustomBtn
            text={t("send")}
            loading={sending}
            disabled={!canSend || sending}
            onClick={() => setConfirmOpen(true)}
            className="w-full sm:w-auto"
          />
        </CardDashBoard>

        <CardDashBoard className="h-fit space-y-4 p-5">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <IoPeopleOutline className="text-primary" />
            <h2 className="font-semibold">{t("previewTitle")}</h2>
          </div>

          {previewLoading ? (
            <p className="text-sm text-slate-500">{t("previewLoading")}</p>
          ) : preview ? (
            <>
              <p className="text-3xl font-bold text-primary">{preview.count}</p>
              <p className="text-sm text-slate-500">{t("recipientsCount")}</p>
              {preview.capped && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  {t("cappedNotice", { max: preview.maxRecipients })}
                </p>
              )}
              {preview.sample.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("sampleRecipients")}
                  </p>
                  {preview.sample.map((user) => (
                    <div key={user.id} className="text-sm">
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">{t("noRecipients")}</p>
          )}

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <IoMailOutline className="mb-2 text-base text-primary" />
            {t("hint")}
          </div>
        </CardDashBoard>
      </div>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleSend()}
        title={t("confirmTitle")}
        message={t("confirmMessage", { count: preview?.count ?? 0 })}
        confirmText={t("confirmSend")}
        isLoading={sending}
      />
    </div>
  );
}
