"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useCallback, useEffect, useId } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { axiosGet, axiosPost, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import Editor from "@/components/Custom/Editor";
import {
  Button,
  Card,
  Field,
  Input,
  Label,
  PageHeader,
  PageShell,
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
  const bodyEnLabelId = useId();
  const bodyArLabelId = useId();

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

  const heading = isEditMode ? t("editTitle") : t("addTitle");

  const header = (
    <PageHeader
      title={heading}
      description={t("subtitle")}
      breadcrumbs={[
        { label: t("title"), href: "/admin/knowledge-management" },
        { label: heading },
      ]}
      breadcrumbsLabel={tCommon("breadcrumb")}
    />
  );

  if (fetchingItem) {
    return (
      <PageShell kind="form" header={header}>
        <SkeletonRegion label={tCommon("loading")}>
          <Card padded="lg">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
            <div className="mt-5 flex flex-col gap-5">
              <Skeleton className="h-100" rounded="lg" />
              <Skeleton className="h-100" rounded="lg" />
            </div>
          </Card>
        </SkeletonRegion>
      </PageShell>
    );
  }

  /**
   * A single authoring column.
   *
   * The entry is one record in two languages, so the form is ordered by field
   * rather than by locale: the two titles sit side by side on one rule, then
   * each body gets its own ruled section. Constraining the column keeps the
   * title inputs at a readable measure instead of stretching them to the width
   * of the editor below them.
   */
  return (
    <PageShell
      kind="form"
      header={header}
      footerSticky
      footer={
        /* Two rich-text editors make this page metres long; the save button used
           to live at the bottom of all of it. Reversed in DOM order so the
           primary action is the first thing a thumb reaches when the row
           stacks. */
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            disabled={saving}
            fullWidth
            className="sm:w-auto"
          >
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={editorLoading}
            fullWidth
            className="sm:w-auto"
          >
            {isEditMode ? t("actions.save") : t("actions.create")}
          </Button>
        </div>
      }
    >
      <Card padded="lg" dir={isRTL ? "rtl" : "ltr"}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("titleEn")} required>
            <Input
              value={form.titleEn}
              onChange={(e) =>
                setForm((f) => ({ ...f, titleEn: e.target.value }))
              }
              placeholder={t("titleEnPlaceholder")}
              dir="ltr"
            />
          </Field>
          <Field label={t("titleAr")} required>
            <Input
              value={form.titleAr}
              onChange={(e) =>
                setForm((f) => ({ ...f, titleAr: e.target.value }))
              }
              placeholder={t("titleArPlaceholder")}
              dir="rtl"
            />
          </Field>
        </div>

        <section
          role="group"
          aria-labelledby={bodyEnLabelId}
          className="mt-5 border-t border-line pt-5"
        >
          <Label id={bodyEnLabelId} required className="mb-1.5">
            {t("descriptionEn")}
          </Label>
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
        </section>

        <section
          role="group"
          aria-labelledby={bodyArLabelId}
          className="mt-5 border-t border-line pt-5"
        >
          <Label id={bodyArLabelId} required className="mb-1.5">
            {t("descriptionAr")}
          </Label>
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
        </section>
      </Card>
    </PageShell>
  );
}
