/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { TemplateCatalogMeta } from "@/lib/template-builder/schema";
import { useBuilderStore } from "./store/useBuilderStore";
import { focusField, focusRing, settle } from "@/components/ui";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif";

type Props = {
  open: boolean;
  onClose: () => void;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function SaveTemplateModal({ open, onClose }: Props) {
  const t = useTranslations("templateBuilder");
  const locale = useLocale();
  const router = useRouter();
  const document = useBuilderStore((s) => s.document);
  const saving = useBuilderStore((s) => s.saving);
  const save = useBuilderStore((s) => s.save);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [image, setImage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TemplateCatalogMeta, string>>
  >({});

  useEffect(() => {
    if (!open || !document) return;
    setName(document.name ?? "");
    setNameAr(document.nameAr ?? "");
    setDescription(document.description ?? "");
    setDescriptionAr(document.descriptionAr ?? "");
    setImage(document.image ?? "");
    setErrors({});
    setImageBusy(false);
  }, [open, document]);

  if (!open || !document) return null;

  const validate = (): TemplateCatalogMeta | null => {
    const next: Partial<Record<keyof TemplateCatalogMeta, string>> = {};
    if (!name.trim()) next.name = t("saveModal.nameEnRequired");
    if (!nameAr.trim()) next.nameAr = t("saveModal.nameArRequired");
    if (!description.trim())
      next.description = t("saveModal.descriptionEnRequired");
    if (!descriptionAr.trim())
      next.descriptionAr = t("saveModal.descriptionArRequired");
    if (!image.trim()) next.image = t("saveModal.imageRequired");
    setErrors(next);
    if (Object.keys(next).length) return null;
    return {
      name: name.trim(),
      nameAr: nameAr.trim(),
      description: description.trim(),
      descriptionAr: descriptionAr.trim(),
      image: image.trim(),
    };
  };

  const onPickImage = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: t("saveModal.imageInvalid") }));
      return;
    }
    setImageBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImage(dataUrl);
      setErrors((e) => ({ ...e, image: undefined }));
    } catch {
      setErrors((e) => ({ ...e, image: t("saveModal.imageInvalid") }));
    } finally {
      setImageBusy(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const meta = validate();
    if (!meta) return;
    await save(meta);
    onClose();
    router.push(`/${locale}/admin/template`);
  };

  /* Local classes rather than the `Field`/`Input`/`Button` primitives: `Modal`
     portals to `document.body`, which escapes this route's dark token scope, so
     the dialog would come back in whatever theme the rest of the app is in.
     These carry the same semantic tokens, resolved dark here — the builder
     keeping its own chrome is DESIGN.md §14.3. */
  const inputClass = `w-full rounded-lg border border-line-strong bg-app px-3 py-2 text-sm text-fg placeholder:text-fg-subtle ${settle} ${focusField}`;
  const labelClass = "mb-1 block text-xs font-medium text-fg-muted";
  const errorClass = "mt-1 text-[11px] text-danger-fg";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tpl-save-title"
    >
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h2 id="tpl-save-title" className="text-sm font-semibold text-fg">
            {t("saveModal.title")}
          </h2>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className={`rounded-md px-2 py-1 text-xs text-fg-muted ${settle} ${focusRing} hover:bg-surface-2 hover:text-fg`}
            disabled={saving}
          >
            {t("close")}
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <p className="text-xs text-fg-muted">{t("saveModal.subtitle")}</p>

          <div>
            <span className={labelClass}>{t("saveModal.image")}</span>
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              disabled={imageBusy || saving}
              onClick={() => fileRef.current?.click()}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-app px-3 py-4 text-xs text-fg-muted ${settle} ${focusRing} hover:border-accent hover:text-fg disabled:opacity-50`}
            >
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="h-28 w-full rounded-md object-cover"
                />
              ) : (
                <span className="py-6">
                  {imageBusy
                    ? t("saveModal.imageLoading")
                    : t("saveModal.imageHint")}
                </span>
              )}
              {image ? <span>{t("saveModal.changeImage")}</span> : null}
            </button>
            {errors.image ? (
              <p role="alert" className={errorClass}>
                {errors.image}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="tpl-name-en">
                {t("saveModal.nameEn")}
              </label>
              <input
                id="tpl-name-en"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("saveModal.nameEnPlaceholder")}
                disabled={saving}
              />
              {errors.name ? (
                <p role="alert" className={errorClass}>
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div>
              <label className={labelClass} htmlFor="tpl-name-ar">
                {t("saveModal.nameAr")}
              </label>
              <input
                id="tpl-name-ar"
                className={inputClass}
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder={t("saveModal.nameArPlaceholder")}
                disabled={saving}
                dir="rtl"
              />
              {errors.nameAr ? (
                <p role="alert" className={errorClass}>
                  {errors.nameAr}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="tpl-desc-en">
              {t("saveModal.descriptionEn")}
            </label>
            <textarea
              id="tpl-desc-en"
              className={`${inputClass} min-h-[72px] resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("saveModal.descriptionEnPlaceholder")}
              disabled={saving}
              rows={3}
            />
            {errors.description ? (
              <p role="alert" className={errorClass}>
                {errors.description}
              </p>
            ) : null}
          </div>

          <div>
            <label className={labelClass} htmlFor="tpl-desc-ar">
              {t("saveModal.descriptionAr")}
            </label>
            <textarea
              id="tpl-desc-ar"
              className={`${inputClass} min-h-[72px] resize-y`}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder={t("saveModal.descriptionArPlaceholder")}
              disabled={saving}
              rows={3}
              dir="rtl"
            />
            {errors.descriptionAr ? (
              <p role="alert" className={errorClass}>
                {errors.descriptionAr}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={`rounded-md border border-line-strong px-3 py-1.5 text-xs text-fg-muted ${settle} ${focusRing} hover:bg-surface-2 hover:text-fg disabled:opacity-50`}
          >
            {t("close")}
          </button>
          <button
            type="submit"
            disabled={saving || imageBusy}
            className={`rounded-md bg-accent px-4 py-1.5 text-xs font-medium text-on-accent ${settle} ${focusRing} hover:bg-accent-strong disabled:opacity-50`}
          >
            {saving ? t("saving") : t("saveModal.confirm")}
          </button>
        </div>
      </form>
    </div>
  );
}
