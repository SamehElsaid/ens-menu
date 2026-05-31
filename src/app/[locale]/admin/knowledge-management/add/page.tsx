"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { axiosGet, axiosPost, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import CardDashBoard from "@/components/Card/CardDashBoard";
import Editor from "@/components/Custom/Editor";

const defaultForm = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
};

interface KnowledgeItem {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

interface KnowledgeItemResponse {
  success: boolean;
  data: KnowledgeItem;
}

export default function KnowledgeManagementAddPage() {
  const locale = useLocale();
  const t = useTranslations("adminKnowledge");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRTL = locale === "ar";

  const editId = searchParams.get("id");
  const isEditMode = !!editId;

  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(isEditMode);
  const [refreshKey, setRefreshKey] = useState({});

  useEffect(() => {
    if (!editId) return;

    setFetchingItem(true);
    axiosGet<KnowledgeItemResponse>(`/searchInformation/${editId}`, locale)
      .then((res) => {
        if (res.status && res.data?.data) {
          const item = res.data.data;
          setForm({
            titleAr: item.titleAr ?? "",
            titleEn: item.titleEn ?? "",
            descriptionAr: item.descriptionAr ?? "",
            descriptionEn: item.descriptionEn ?? "",
          });
          setRefreshKey({});
        } else {
          toast.error(t("error"));
          router.push("/admin/knowledge-management");
        }
      })
      .catch(() => {
        toast.error(t("error"));
        router.push("/admin/knowledge-management");
      })
      .finally(() => setFetchingItem(false));
  }, [editId, locale, t, router]);

  const handleSetValue = useCallback((field: string, val: string) => {
    const fieldMap: Record<string, keyof typeof defaultForm> = {
      description_ar: "descriptionAr",
      description_en: "descriptionEn",
    };
    const key = fieldMap[field];
    if (key) setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const handleTrigger = useCallback((_field: string) => {}, []);

  const handleSave = useCallback(async () => {
    if (!form.titleAr.trim() || !form.titleEn.trim()) {
      toast.error(t("validationError"));
      return;
    }
    if (!form.descriptionAr.trim() || !form.descriptionEn.trim()) {
      toast.error(t("validationError"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titleAr: form.titleAr.trim(),
        titleEn: form.titleEn.trim(),
        descriptionAr: form.descriptionAr.trim(),
        descriptionEn: form.descriptionEn.trim(),
      };

      const result = isEditMode
        ? await axiosPatch<typeof payload, { message?: string }>(
            `/searchInformation/${editId}`,
            locale,
            payload,
          )
        : await axiosPost<typeof payload, { message?: string }>(
            "/searchInformation",
            locale,
            payload,
          );

      if (result.status) {
        toast.success(isEditMode ? t("editSuccess") : t("createSuccess"));
        router.push("/admin/knowledge-management");
      } else {
        toast.error(isEditMode ? t("editError") : t("createError"));
      }
    } catch {
      toast.error(isEditMode ? t("editError") : t("createError"));
    } finally {
      setSaving(false);
    }
  }, [form, isEditMode, editId, locale, t, router]);

  if (fetchingItem) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-8 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <CardDashBoard>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            </div>
            <div className="h-[400px] bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="h-[400px] bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
        </CardDashBoard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <IoArrowBack className="text-lg" />
            <span className="font-medium">{t("back")}</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {isEditMode ? t("editTitle") : t("addTitle")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      {/* Form */}
      <CardDashBoard>
        <div className="space-y-5" dir={isRTL ? "rtl" : "ltr"}>
          {/* Titles row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("titleEn")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titleEn}
                onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                placeholder={t("titleEnPlaceholder")}
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("titleAr")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titleAr}
                onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                placeholder={t("titleArPlaceholder")}
                dir="rtl"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              />
            </div>
          </div>

          {/* Description EN */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("descriptionEn")} <span className="text-red-500">*</span>
            </label>
            <Editor
              initialTemplateName={form.descriptionEn}
              setValue={handleSetValue}
              trigger={handleTrigger}
              type={"description_en"}
              setShowDescription={() => {}}
              to={"description_ar"}
              refresh={refreshKey}
              loadingSave={editorLoading}
              setLoadingSave={setEditorLoading}
            />
          </div>

          {/* Description AR */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("descriptionAr")} <span className="text-red-500">*</span>
            </label>
            <Editor
              initialTemplateName={form.descriptionAr}
              setValue={handleSetValue}
              trigger={handleTrigger}
              type={"description_ar"}
              setShowDescription={() => {}}
              to={"description_en"}
              refresh={refreshKey}
              loadingSave={editorLoading}
              setLoadingSave={setEditorLoading}
            />
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-3 pt-2 ${isRTL ? "flex-row-reverse" : "justify-end"}`}>
            <button
              onClick={() => router.back()}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("actions.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || editorLoading}
              className="px-6 py-2.5 rounded-xl font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 min-w-[110px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("saving")}</span>
                </>
              ) : (
                <span>{isEditMode ? t("actions.save") : t("actions.create")}</span>
              )}
            </button>
          </div>
        </div>
      </CardDashBoard>
    </div>
  );
}
