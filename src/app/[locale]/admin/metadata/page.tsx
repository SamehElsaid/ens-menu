"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { IoCreateOutline, IoAddOutline, IoTrashOutline } from "react-icons/io5";
import { FaCheck, FaTimes, FaMagic } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Field,
  Fieldset,
  Input,
  Modal,
  NoResultsState,
  PageHeader,
  PageShell,
  SearchInput,
  StatCard,
  StatGrid,
  Textarea,
  Toolbar,
  type DataColumn,
} from "@/components/ui";
import {
  axiosGet,
  axiosPost,
  axiosPatch,
  axiosDelete,
} from "@/shared/axiosCall";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";

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

/** A page counts as configured once both locales carry a title and a description. */
function isConfigured(item: PageMetadata): boolean {
  return Boolean(
    item.titleAr?.trim() &&
    item.titleEn?.trim() &&
    item.descriptionAr?.trim() &&
    item.descriptionEn?.trim(),
  );
}

export default function AdminMetadataPage() {
  const locale = useLocale();
  const t = useTranslations("adminMetadata");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tableLabels = useDataTableLabels();

  const [metaList, setMetaList] = useState<PageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

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
      const res = await axiosGet<PageMetadata[] | MetaDataResponse>(
        "/metaData",
        locale,
      );
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
      const res = await axiosDelete<{ message?: string }>(
        `/metaData/${item.pageName}`,
        locale,
      );
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

  const closeGenModal = useCallback(() => {
    setGenModal({
      open: false,
      pageType: "blog",
      articleTitle: "",
      articleContent: "",
    });
  }, []);

  const closeModal = () => {
    setModal({ open: false, isEdit: false, form: EMPTY_FORM });
    closeGenModal();
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
        ? await axiosPatch<MetaForm, { message?: string }>(
            `/metaData/${pageName}`,
            locale,
            payload,
          )
        : await axiosPost<MetaForm, { message?: string }>(
            "/metaData",
            locale,
            payload,
          );

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
      genModal.articleTitle
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

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

  const langBadge = (lang: string) => (
    <Badge tone="neutral" className="ms-1.5 font-mono">
      {lang}
    </Badge>
  );

  const configuredCount = useMemo(
    () => metaList.filter(isConfigured).length,
    [metaList],
  );

  const visibleList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return metaList;
    return metaList.filter((item) =>
      [item.pageName, item.titleAr, item.titleEn]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    );
  }, [metaList, query]);

  const columns = useMemo<DataColumn<PageMetadata>[]>(
    () => [
      {
        id: "pageName",
        header: t("columns.pageName"),
        primary: true,
        sortValue: (item) => item.pageName,
        cell: (item) => (
          <span className="flex flex-wrap items-center gap-2">
            <span className="ui-figure text-[13px] text-fg" lang="en" dir="ltr">
              {item.pageName}
            </span>
            <Badge tone={isConfigured(item) ? "success" : "warning"} dot>
              {isConfigured(item) ? t("configured") : t("notConfigured")}
            </Badge>
          </span>
        ),
      },
      {
        id: "titleAr",
        header: t("columns.titleAr"),
        sortValue: (item) => item.titleAr,
        cell: (item) => (
          <span className="line-clamp-1 text-fg-muted" dir="rtl">
            {item.titleAr || "—"}
          </span>
        ),
      },
      {
        id: "titleEn",
        header: t("columns.titleEn"),
        sortValue: (item) => item.titleEn,
        cell: (item) => (
          <span className="line-clamp-1 text-fg-muted" dir="ltr">
            {item.titleEn || "—"}
          </span>
        ),
      },
    ],
    [t],
  );

  /**
   * SEO records as a ruled index.
   *
   * The page name is the identity of each row, so it is set as a mono ticket
   * and leads the table; whether a record is actually complete used to require
   * reading two truncated title columns, and is now one badge. The counts above
   * answer the only question this screen is opened with — how much of the site
   * still has no metadata.
   */
  return (
    <PageShell
      kind="table"
      header={
        <>
          <PageHeader
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
            actions={
              <Button startIcon={<IoAddOutline />} onClick={() => openCreate()}>
                {t("addNew")}
              </Button>
            }
          />

          <StatGrid columns={2} ruled>
            <StatCard
              label={t("configured")}
              value={
                <span lang="en">{configuredCount.toLocaleString("en-US")}</span>
              }
              loading={loading}
            />
            <StatCard
              label={t("notConfigured")}
              value={
                <span lang="en">
                  {(metaList.length - configuredCount).toLocaleString("en-US")}
                </span>
              }
              loading={loading}
            />
          </StatGrid>
        </>
      }
      toolbar={
        <Toolbar
          search={
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={tCommon("search")}
              label={tCommon("search")}
              clearLabel={tCommon("clearSearch")}
            />
          }
        />
      }
    >
      <DataTable<PageMetadata>
        columns={columns}
        rows={visibleList}
        getRowKey={(item) => item.pageName}
        caption={t("title")}
        loading={loading}
        tableId="admin-metadata"
        stickyHeader
        densityControl
        labels={tableLabels}
        empty={
          query.trim() ? (
            <NoResultsState
              title={tCommon("noResultsTitle")}
              description={tCommon("noResultsDescription")}
              onClear={() => setQuery("")}
              clearLabel={tCommon("clearSearch")}
            />
          ) : (
            <EmptyState
              title={t("empty")}
              action={
                <Button
                  startIcon={<IoAddOutline />}
                  onClick={() => openCreate()}
                >
                  {t("addNew")}
                </Button>
              }
            />
          )
        }
        rowActions={(item) =>
          confirmDeleteId === item.id ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-xs font-medium text-danger">
                {t("confirmDelete")}
              </span>
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
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={t("edit")}
                title={t("edit")}
                onClick={() => openEdit(item)}
              >
                <IoCreateOutline />
              </Button>
              <Button
                variant="dangerGhost"
                size="sm"
                iconOnly
                aria-label={t("delete")}
                title={t("delete")}
                onClick={() => handleDelete(item.id)}
                loading={deletingId === item.id}
              >
                <IoTrashOutline />
              </Button>
            </span>
          )
        }
      />

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
        <div className="flex flex-col gap-4">
          <Field label={t("modal.pageName")} required>
            <Input
              value={modal.form.pageName}
              onChange={(e) => setField("pageName", e.target.value)}
              disabled={modal.isEdit}
              placeholder="home, about, pricing..."
              dir="ltr"
              className="font-mono"
            />
          </Field>

          {modal.form.pageName.trim() && (
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" aria-hidden />
              <Button
                variant="subtle"
                size="sm"
                startIcon={<FaMagic />}
                onClick={() => setGenModal((prev) => ({ ...prev, open: true }))}
              >
                {t("generate.btn")}
              </Button>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-4 sm:grid-cols-2">
            <Fieldset
              legend={
                <>
                  {t("modal.localeGroup")} {langBadge("AR")}
                </>
              }
            >
              <Field label={t("modal.title")}>
                <Input
                  value={modal.form.titleAr}
                  onChange={(e) => setField("titleAr", e.target.value)}
                  dir="rtl"
                  placeholder="العنوان بالعربية"
                />
              </Field>
              <Field label={t("modal.description")}>
                <Textarea
                  value={modal.form.descriptionAr}
                  onChange={(e) => setField("descriptionAr", e.target.value)}
                  rows={3}
                  dir="rtl"
                  placeholder="الوصف بالعربية..."
                />
              </Field>
              <Field label={t("modal.keywords")}>
                <Textarea
                  value={modal.form.keywordsAr}
                  onChange={(e) => setField("keywordsAr", e.target.value)}
                  rows={2}
                  dir="rtl"
                  placeholder="كلمة1، كلمة2..."
                />
              </Field>
            </Fieldset>

            <Fieldset
              legend={
                <>
                  {t("modal.localeGroup")} {langBadge("EN")}
                </>
              }
            >
              <Field label={t("modal.title")}>
                <Input
                  value={modal.form.titleEn}
                  onChange={(e) => setField("titleEn", e.target.value)}
                  dir="ltr"
                  placeholder="Title in English"
                />
              </Field>
              <Field label={t("modal.description")}>
                <Textarea
                  value={modal.form.descriptionEn}
                  onChange={(e) => setField("descriptionEn", e.target.value)}
                  rows={3}
                  dir="ltr"
                  placeholder="Description in English..."
                />
              </Field>
              <Field label={t("modal.keywords")}>
                <Textarea
                  value={modal.form.keywordsEn}
                  onChange={(e) => setField("keywordsEn", e.target.value)}
                  rows={2}
                  dir="ltr"
                  placeholder="keyword1, keyword2..."
                />
              </Field>
            </Fieldset>
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
            <Button
              variant="secondary"
              onClick={closeGenModal}
              disabled={generating}
            >
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
        <div className="flex flex-col gap-4">
          <Field label={t("generate.pageType")}>
            <Input
              value={genModal.pageType}
              onChange={(e) =>
                setGenModal((prev) => ({ ...prev, pageType: e.target.value }))
              }
              placeholder="blog, landing, product..."
              dir="ltr"
              className="font-mono"
            />
          </Field>

          <Field label={t("generate.articleTitle")} required>
            <Input
              value={genModal.articleTitle}
              onChange={(e) =>
                setGenModal((prev) => ({
                  ...prev,
                  articleTitle: e.target.value,
                }))
              }
              placeholder={t("generate.articleTitlePlaceholder")}
            />
          </Field>

          <Field label={t("generate.articleContent")} required>
            <Textarea
              value={genModal.articleContent}
              onChange={(e) =>
                setGenModal((prev) => ({
                  ...prev,
                  articleContent: e.target.value,
                }))
              }
              rows={6}
              placeholder={t("generate.articleContentPlaceholder")}
            />
          </Field>
        </div>
      </Modal>
    </PageShell>
  );
}
