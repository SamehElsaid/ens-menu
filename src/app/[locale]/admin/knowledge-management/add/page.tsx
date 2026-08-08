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
import {
  Button,
  PageHeader,
  Skeleton,
  SkeletonRegion,
} from "@/components/ui";

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
  const tCommon = useTranslations("common");
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
        <SkeletonRegion label={tCommon("loading")}>
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="mt-4 h-8 w-72" />
          <CardDashBoard>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
              <Skeleton className="h-[400px] rounded-xl" />
              <Skeleton className="h-[400px] rounded-xl" />
            </div>
          </CardDashBoard>
        </SkeletonRegion>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={isEditMode ? t("editTitle") : t("addTitle")}
        description={t("subtitle")}
        actions={
          <Button
            variant="secondary"
            startIcon={<IoArrowBack className="rtl:rotate-180" />}
            onClick={() => router.back()}
          >
            {t("back")}
          </Button>
        }
      />

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
            <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
              {t("actions.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={editorLoading}
            >
              {isEditMode ? t("actions.save") : t("actions.create")}
            </Button>
          </div>
        </div>
      </CardDashBoard>
    </div>
  );
}
