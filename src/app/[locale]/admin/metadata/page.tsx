"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  IoArrowBack,
  IoCreateOutline,
  IoAddOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { FaSpinner, FaCheck, FaTimes, FaMagic } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosPost, axiosPatch, axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";

interface PageMetadata {
  id: number;
  pageName: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  keywordsAr: string;
  keywordsEn: string;
}

interface MetaDataResponse {
  metaData?: PageMetadata[];
  data?: PageMetadata[];
  items?: PageMetadata[];
}

interface SeoResponse {
  output?: {
    seo?: {
      title?: { ar?: string; en?: string };
      description?: { ar?: string; en?: string };
      keywords?: { ar?: string[]; en?: string[] };
    };
  };
}

type MetaForm = Omit<PageMetadata, "id"> & { id?: number };

const EMPTY_FORM: MetaForm = {
  id: undefined,
  pageName: "",
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  keywordsAr: "",
  keywordsEn: "",
};


export default function AdminMetadataPage() {
  const locale = useLocale();
  const t = useTranslations("adminMetadata");
  const router = useRouter();
  const isRTL = locale === "ar";

  const [metaList, setMetaList] = useState<PageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [modal, setModal] = useState<{
    open: boolean;
    isEdit: boolean;
    form: MetaForm;
  }>({ open: false, isEdit: false, form: EMPTY_FORM });

  const [genModal, setGenModal] = useState<{
    open: boolean;
    pageType: string;
    articleTitle: string;
    articleContent: string;
  }>({ open: false, pageType: "blog", articleTitle: "", articleContent: "" });
  const [generating, setGenerating] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosGet<PageMetadata[] | MetaDataResponse>("/metaData", locale);
      if (res.status) {
        let items: PageMetadata[] = [];
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (Array.isArray((res.data as MetaDataResponse)?.metaData)) {
          items = (res.data as MetaDataResponse).metaData!;
        } else if (Array.isArray((res.data as MetaDataResponse)?.data)) {
          items = (res.data as MetaDataResponse).data!;
        } else if (Array.isArray((res.data as MetaDataResponse)?.items)) {
          items = (res.data as MetaDataResponse).items!;
        }
        setMetaList(items);
      } else {
        toast.error(t("fetchError"));
      }
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (id: number) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const item = metaList.find((m) => m.id === id);
      if (!item) return;
      const res = await axiosDelete<{ message?: string }>(`/metaData/${item.pageName}`, locale);
      if (res.status) {
        toast.success(t("deleteSuccess"));
        fetchAll();
      } else {
        toast.error(t("deleteError"));
      }
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = (pageName = "") => {
    setModal({ open: true, isEdit: false, form: { ...EMPTY_FORM, pageName } });
  };

  const openEdit = (item: PageMetadata) => {
    setConfirmDeleteId(null);
    setModal({ open: true, isEdit: true, form: { ...item } });
  };

  const closeModal = () => {
    setModal({ open: false, isEdit: false, form: EMPTY_FORM });
    closeGenModal();
  };

  const closeGenModal = () => {
    setGenModal({ open: false, pageType: "blog", articleTitle: "", articleContent: "" });
  };

  const setField = (key: keyof MetaForm, value: string) => {
    setModal((prev) => ({
      ...prev,
      form: { ...prev.form, [key]: value },
    }));
  };

  const handleSave = async () => {
    const { form, isEdit } = modal;
    if (!form.pageName.trim()) {
      toast.error(t("pageNameRequired"));
      return;
    }
    setSaving(true);
    try {
      const pageName = form.pageName.trim().toLowerCase();
      const payload = { ...form, pageName };
      const res = isEdit
        ? await axiosPatch<MetaForm, { message?: string }>(`/metaData/${pageName}`, locale, payload)
        : await axiosPost<MetaForm, { message?: string }>("/metaData", locale, payload);

      if (res.status) {
        toast.success(isEdit ? t("updateSuccess") : t("createSuccess"));
        closeModal();
        fetchAll();
      } else {
        toast.error(isEdit ? t("updateError") : t("createError"));
      }
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!genModal.articleTitle.trim() || !genModal.articleContent.trim()) {
      toast.error(t("generate.fieldsRequired"));
      return;
    }

    const resolvedPageName =
      modal.form.pageName.trim() ||
      genModal.articleTitle.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    setGenerating(true);
    try {
      const payload = {
        pageName: resolvedPageName,
        pageType: genModal.pageType,
        language: ["ar", "en"],
        article: {
          title: genModal.articleTitle.trim(),
          content: genModal.articleContent.trim(),
        },
      };

      const res = await fetch("/api/seo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error(t("generate.error"));
        return;
      }

      const data: SeoResponse = await res.json();
      const seo = data?.output?.seo;
      if (!seo) {
        toast.error(t("generate.error"));
        return;
      }

      setModal((prev) => ({
        ...prev,
        form: {
          ...prev.form,
          pageName: prev.form.pageName.trim() || resolvedPageName,
          titleAr: seo.title?.ar ?? prev.form.titleAr,
          titleEn: seo.title?.en ?? prev.form.titleEn,
          descriptionAr: seo.description?.ar ?? prev.form.descriptionAr,
          descriptionEn: seo.description?.en ?? prev.form.descriptionEn,
          keywordsAr: seo.keywords?.ar?.join("، ") ?? prev.form.keywordsAr,
          keywordsEn: seo.keywords?.en?.join(", ") ?? prev.form.keywordsEn,
        },
      }));

      toast.success(t("generate.success"));
      closeGenModal();
    } catch {
      toast.error(t("generate.error"));
    } finally {
      setGenerating(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";
  const textareaClass =
    "w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors resize-none";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const langBadge = (lang: string) => (
    <span className="ms-2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {lang}
    </span>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            type="button"
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <IoArrowBack className="text-lg" />
            <span className="font-medium">{t("back")}</span>
          </button>
        </div>
        <div className={`flex items-start justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {t("title")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => openCreate()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
          >
            <IoAddOutline className="text-lg" />
            {t("addNew")}
          </button>
        </div>
      </div>

      {/* Table */}
      <CardDashBoard>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-3xl text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className={`py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"}`}>
                    {t("columns.pageName")}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"} hidden md:table-cell`}>
                    {t("columns.titleAr")}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"} hidden md:table-cell`}>
                    {t("columns.titleEn")}
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-center">
                    {t("columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {metaList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400 dark:text-slate-500">
                      {t("empty")}
                    </td>
                  </tr>
                ) : (
                  metaList.map((item) => (
                    <tr
                      key={item.pageName}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className={`py-3 px-4 font-mono text-sm font-medium text-slate-800 dark:text-slate-200 ${isRTL ? "text-right" : "text-left"}`}>
                        {item.pageName}
                      </td>
                      <td className={`py-3 px-4 text-slate-600 dark:text-slate-400 hidden md:table-cell max-w-[200px] truncate ${isRTL ? "text-right" : "text-left"}`}>
                        {item.titleAr || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className={`py-3 px-4 text-slate-600 dark:text-slate-400 hidden md:table-cell max-w-[200px] truncate ${isRTL ? "text-right" : "text-left"}`}>
                        {item.titleEn || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-2 ${isRTL ? "justify-start flex-row-reverse" : "justify-end"}`}>
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium text-sm transition-colors"
                          >
                            <IoCreateOutline className="text-base" />
                            {t("edit")}
                          </button>
                          {confirmDeleteId === item.id ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-xs text-red-500 font-medium">{t("confirmDelete")}</span>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium text-sm transition-colors disabled:opacity-50"
                              >
                                {deletingId === item.id ? (
                                  <FaSpinner className="animate-spin text-xs" />
                                ) : (
                                  <FaCheck className="text-xs" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 font-medium text-sm transition-colors"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 font-medium text-sm transition-colors disabled:opacity-50"
                            >
                              {deletingId === item.id ? (
                                <FaSpinner className="animate-spin text-sm" />
                              ) : (
                                <IoTrashOutline className="text-base" />
                              )}
                              {t("delete")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardDashBoard>

      {/* Main Modal (Create / Edit) */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {modal.isEdit ? t("modal.editTitle") : t("modal.createTitle")}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Page Name */}
              <div>
                <label className={labelClass}>{t("modal.pageName")}</label>
                <input
                  type="text"
                  value={modal.form.pageName}
                  onChange={(e) => setField("pageName", e.target.value)}
                  disabled={modal.isEdit}
                  placeholder="home, about, pricing..."
                  className={`${inputClass} ${modal.isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
                  dir="ltr"
                />
              </div>

              {/* Generate from API button — only when pageName is filled */}
              {modal.form.pageName.trim() && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <button
                    type="button"
                    onClick={() => setGenModal((prev) => ({ ...prev, open: true }))}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20 font-semibold text-sm transition-colors shrink-0"
                  >
                    <FaMagic className="text-sm" />
                    {t("generate.btn")}
                  </button>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>
              )}

              {/* Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("modal.title")} {langBadge("AR")}</label>
                  <input
                    type="text"
                    value={modal.form.titleAr}
                    onChange={(e) => setField("titleAr", e.target.value)}
                    className={inputClass}
                    dir="rtl"
                    placeholder="العنوان بالعربية"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("modal.title")} {langBadge("EN")}</label>
                  <input
                    type="text"
                    value={modal.form.titleEn}
                    onChange={(e) => setField("titleEn", e.target.value)}
                    className={inputClass}
                    dir="ltr"
                    placeholder="Title in English"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("modal.description")} {langBadge("AR")}</label>
                  <textarea
                    value={modal.form.descriptionAr}
                    onChange={(e) => setField("descriptionAr", e.target.value)}
                    rows={3}
                    className={textareaClass}
                    dir="rtl"
                    placeholder="الوصف بالعربية..."
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("modal.description")} {langBadge("EN")}</label>
                  <textarea
                    value={modal.form.descriptionEn}
                    onChange={(e) => setField("descriptionEn", e.target.value)}
                    rows={3}
                    className={textareaClass}
                    dir="ltr"
                    placeholder="Description in English..."
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("modal.keywords")} {langBadge("AR")}</label>
                  <textarea
                    value={modal.form.keywordsAr}
                    onChange={(e) => setField("keywordsAr", e.target.value)}
                    rows={2}
                    className={textareaClass}
                    dir="rtl"
                    placeholder="كلمة1، كلمة2..."
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("modal.keywords")} {langBadge("EN")}</label>
                  <textarea
                    value={modal.form.keywordsEn}
                    onChange={(e) => setField("keywordsEn", e.target.value)}
                    rows={2}
                    className={textareaClass}
                    dir="ltr"
                    placeholder="keyword1, keyword2..."
                  />
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {t("modal.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      {t("modal.saving")}
                    </>
                  ) : (
                    t("modal.save")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Sub-Modal */}
      {modal.open && genModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                    <FaMagic className="text-violet-600 dark:text-violet-400 text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {t("generate.title")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {modal.form.pageName || "—"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeGenModal}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Page Type */}
              <div>
                <label className={labelClass}>{t("generate.pageType")}</label>
                <input
                  type="text"
                  value={genModal.pageType}
                  onChange={(e) => setGenModal((prev) => ({ ...prev, pageType: e.target.value }))}
                  placeholder="blog, landing, product..."
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              {/* Article Title */}
              <div>
                <label className={labelClass}>{t("generate.articleTitle")}</label>
                <input
                  type="text"
                  value={genModal.articleTitle}
                  onChange={(e) => setGenModal((prev) => ({ ...prev, articleTitle: e.target.value }))}
                  placeholder={t("generate.articleTitlePlaceholder")}
                  className={inputClass}
                />
              </div>

              {/* Article Content */}
              <div>
                <label className={labelClass}>{t("generate.articleContent")}</label>
                <textarea
                  value={genModal.articleContent}
                  onChange={(e) => setGenModal((prev) => ({ ...prev, articleContent: e.target.value }))}
                  rows={6}
                  placeholder={t("generate.articleContentPlaceholder")}
                  className={textareaClass}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeGenModal}
                  disabled={generating}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {t("modal.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {generating ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      {t("generate.generating")}
                    </>
                  ) : (
                    <>
                      <FaMagic className="text-sm" />
                      {t("generate.run")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
