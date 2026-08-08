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
import { FaCheck, FaTimes, FaMagic } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import {
  Button,
  EmptyState,
  LoadingBlock,
  Modal,
  PageHeader,
} from "@/components/ui";
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
  const tCommon = useTranslations("common");
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
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <>
            <Button
              variant="secondary"
              startIcon={<IoArrowBack className="rtl:rotate-180" />}
              onClick={() => router.back()}
            >
              {t("back")}
            </Button>
            <Button startIcon={<IoAddOutline />} onClick={() => openCreate()}>
              {t("addNew")}
            </Button>
          </>
        }
      />

      <CardDashBoard>
        {loading ? (
          <LoadingBlock label={tCommon("loading")} className="py-20" />
        ) : metaList.length === 0 ? (
          <EmptyState
            title={t("empty")}
            action={
              <Button startIcon={<IoAddOutline />} onClick={() => openCreate()}>
                {t("addNew")}
              </Button>
            }
          />
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
                {metaList.map((item) => (
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
                          <Button
                            variant="subtle"
                            size="sm"
                            startIcon={<IoCreateOutline />}
                            onClick={() => openEdit(item)}
                          >
                            {t("edit")}
                          </Button>
                          {confirmDeleteId === item.id ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-xs font-medium text-danger">{t("confirmDelete")}</span>
                              <Button
                                variant="danger"
                                size="sm"
                                iconOnly
                                aria-label={t("delete")}
                                onClick={() => handleDelete(item.id)}
                                loading={deletingId === item.id}
                              >
                                <FaCheck className="text-xs" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                iconOnly
                                aria-label={t("modal.cancel")}
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                <FaTimes className="text-xs" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="dangerGhost"
                              size="sm"
                              startIcon={<IoTrashOutline />}
                              onClick={() => handleDelete(item.id)}
                              loading={deletingId === item.id}
                            >
                              {t("delete")}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </CardDashBoard>

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.isEdit ? t("modal.editTitle") : t("modal.createTitle")}
        size="lg"
        dismissible={!saving}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              {t("modal.cancel")}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {t("modal.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={labelClass}>{t("modal.pageName")}</label>
            <input
              type="text"
              value={modal.form.pageName}
              onChange={(e) => setField("pageName", e.target.value)}
              disabled={modal.isEdit}
              placeholder="home, about, pricing..."
              className={`${inputClass} ${modal.isEdit ? "cursor-not-allowed opacity-60" : ""}`}
              dir="ltr"
            />
          </div>

          {modal.form.pageName.trim() && (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <Button
                variant="subtle"
                size="sm"
                startIcon={<FaMagic />}
                onClick={() => setGenModal((prev) => ({ ...prev, open: true }))}
              >
                {t("generate.btn")}
              </Button>
              <div className="h-px flex-1 bg-line" />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                {t("modal.title")} {langBadge("AR")}
              </label>
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
              <label className={labelClass}>
                {t("modal.title")} {langBadge("EN")}
              </label>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        </div>
      </Modal>

      <Modal
        open={modal.open && genModal.open}
        onClose={closeGenModal}
        title={t("generate.title")}
        description={modal.form.pageName || "—"}
        icon={<FaMagic />}
        size="md"
        dismissible={!generating}
        footer={
          <>
            <Button variant="secondary" onClick={closeGenModal} disabled={generating}>
              {t("modal.cancel")}
            </Button>
            <Button
              startIcon={<FaMagic />}
              onClick={handleGenerate}
              loading={generating}
            >
              {t("generate.run")}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={labelClass}>{t("generate.pageType")}</label>
            <input
              type="text"
              value={genModal.pageType}
              onChange={(e) =>
                setGenModal((prev) => ({ ...prev, pageType: e.target.value }))
              }
              placeholder="blog, landing, product..."
              className={inputClass}
              dir="ltr"
            />
          </div>

          <div>
            <label className={labelClass}>{t("generate.articleTitle")}</label>
            <input
              type="text"
              value={genModal.articleTitle}
              onChange={(e) =>
                setGenModal((prev) => ({ ...prev, articleTitle: e.target.value }))
              }
              placeholder={t("generate.articleTitlePlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t("generate.articleContent")}</label>
            <textarea
              value={genModal.articleContent}
              onChange={(e) =>
                setGenModal((prev) => ({ ...prev, articleContent: e.target.value }))
              }
              rows={6}
              placeholder={t("generate.articleContentPlaceholder")}
              className={textareaClass}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
