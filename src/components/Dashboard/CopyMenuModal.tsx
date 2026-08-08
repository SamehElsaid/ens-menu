"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { Button, Checkbox, Field, Input, Modal } from "@/components/ui";
import { normalizeMenuFromApi } from "@/lib/normalizeMenuFromApi";
import { sanitizeMenuSlugInput } from "@/lib/publicMenuUrl";
import type { Menu, SlugCheckResponse } from "@/types/Menu";
import { toast } from "react-toastify";
import {
  IoCopyOutline,
  IoPricetagOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoOptionsOutline,
} from "react-icons/io5";

type CopyMenuModalProps = {
  menu: Menu;
  menuName: string;
  onClose: () => void;
  onCopied: (newMenu: Menu) => void;
};

type CopyOptions = {
  copyProducts: boolean;
  copySettings: boolean;
  copyDesign: boolean;
  copyMedia: boolean;
  copyAddress: boolean;
};

type CopyMenuPayload = {
  nameAr: string;
  nameEn: string;
  slug: string;
} & CopyOptions;

type CopyOptionKey = keyof CopyOptions;

const COPY_FORM_ID = "copy-menu-form";

const COPY_OPTION_KEYS: CopyOptionKey[] = [
  "copyProducts",
  "copySettings",
  "copyDesign",
  "copyMedia",
  "copyAddress",
];

const OPTION_LABEL_KEYS: Record<CopyOptionKey, string> = {
  copyProducts: "products",
  copySettings: "settings",
  copyDesign: "design",
  copyMedia: "media",
  copyAddress: "address",
};

function parseSlugAvailability(
  data: SlugCheckResponse | undefined,
): boolean | null {
  if (!data) return null;
  if (typeof data.available === "boolean") return data.available;
  const isAvailable = (data as { isAvailable?: boolean }).isAvailable;
  if (typeof isAvailable === "boolean") return isAvailable;
  return null;
}

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function CopyMenuModal({
  menu,
  menuName,
  onClose,
  onCopied,
}: CopyMenuModalProps) {
  const t = useTranslations("Menus.copyModal");
  const locale = useLocale();
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameArError, setNameArError] = useState<string | null>(null);
  const [nameEnError, setNameEnError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [options, setOptions] = useState<CopyOptions>({
    copyProducts: false,
    copySettings: true,
    copyDesign: true,
    copyMedia: true,
    copyAddress: true,
  });
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    suggestions: string[];
  }>({
    checking: false,
    available: null,
    suggestions: [],
  });

  useEffect(() => {
    const normalized = slug.trim().toLowerCase();
    if (!normalized || normalized.length < 3) {
      setSlugStatus({ checking: false, available: null, suggestions: [] });
      return;
    }

    if (!slugRegex.test(normalized)) {
      setSlugStatus({ checking: false, available: false, suggestions: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSlugStatus({ checking: true, available: null, suggestions: [] });
      try {
        const result = await axiosGet<SlugCheckResponse>(
          "/menus/check-slug",
          locale,
          undefined,
          { slug: normalized },
        );
        const payload = result.data as SlugCheckResponse | undefined;
        setSlugStatus({
          checking: false,
          available: parseSlugAvailability(payload),
          suggestions: payload?.suggestions ?? [],
        });
      } catch {
        setSlugStatus({ checking: false, available: null, suggestions: [] });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slug, locale]);

  const validateSlug = (value: string): string | null => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return t("validation.slugRequired");
    if (normalized.length < 3) return t("validation.slugMin");
    if (!slugRegex.test(normalized)) return t("validation.slugInvalid");
    return null;
  };

  const toggleOption = (key: CopyOptionKey) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNameAr = nameAr.trim();
    const trimmedNameEn = nameEn.trim();
    const normalizedSlug = slug.trim().toLowerCase();

    const nextNameArError = trimmedNameAr
      ? null
      : t("validation.nameArRequired");
    const nextNameEnError = trimmedNameEn
      ? null
      : t("validation.nameEnRequired");
    const nextSlugError = validateSlug(normalizedSlug);

    setNameArError(nextNameArError);
    setNameEnError(nextNameEnError);
    setSlugError(nextSlugError);

    if (nextNameArError || nextNameEnError || nextSlugError) return;
    if (slugStatus.available === false) {
      toast.error(t("slugTakenError"));
      return;
    }

    try {
      setIsCopying(true);
      const payload: CopyMenuPayload = {
        nameAr: trimmedNameAr,
        nameEn: trimmedNameEn,
        slug: normalizedSlug,
        ...options,
      };
      const result = await axiosPost<CopyMenuPayload, Menu>(
        `/menus/${menu.id}/copy`,
        locale,
        payload,
      );

      if (result.status && result.data) {
        const apiPayload = result.data as Record<string, unknown>;
        const createdMenu = normalizeMenuFromApi({
          ...payload,
          ...apiPayload,
          id: apiPayload.menuId ?? apiPayload.id,
          slug: apiPayload.slug ?? normalizedSlug,
        });

        if (!createdMenu) {
          toast.error(t("copyError"));
          return;
        }

        toast.success(t("copySuccess"));
        onCopied(createdMenu);
        onClose();
      } else {
        toast.error(t("copyError"));
      }
    } catch {
      toast.error(t("copyError"));
    } finally {
      setIsCopying(false);
    }
  };

  const canSubmit =
    !isCopying &&
    !nameArError &&
    !nameEnError &&
    !slugError &&
    nameAr.trim().length > 0 &&
    nameEn.trim().length > 0 &&
    slug.trim().length >= 3 &&
    !slugStatus.checking &&
    slugStatus.available !== false;

  return (
    <Modal
      open
      onClose={onClose}
      title={t("title")}
      description={t("subtitle", { name: menuName })}
      icon={<IoCopyOutline className="size-5" />}
      dismissible={!isCopying}
      closeLabel={t("cancel")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isCopying}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={COPY_FORM_ID}
            loading={isCopying}
            disabled={!canSubmit}
            startIcon={<IoCopyOutline className="size-4" />}
          >
            {isCopying ? t("copying") : t("copy")}
          </Button>
        </>
      }
    >
      <form
        id={COPY_FORM_ID}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        <p className="text-sm leading-relaxed text-fg-muted">
          {t("description")}
        </p>

        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoPricetagOutline className="text-fg-muted" aria-hidden />
            {t("menuNames")}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label={t("nameAr")}
              required
              error={nameArError ?? undefined}
            >
              <Input
                value={nameAr}
                onChange={(e) => {
                  const next = e.target.value;
                  setNameAr(next);
                  setNameArError(
                    next.trim() ? null : t("validation.nameArRequired"),
                  );
                }}
                placeholder={t("nameArPlaceholder")}
                data-autofocus
              />
            </Field>
            <Field
              label={t("nameEn")}
              required
              error={nameEnError ?? undefined}
            >
              <Input
                value={nameEn}
                onChange={(e) => {
                  const next = e.target.value;
                  setNameEn(next);
                  setNameEnError(
                    next.trim() ? null : t("validation.nameEnRequired"),
                  );
                }}
                placeholder={t("nameEnPlaceholder")}
                dir="ltr"
              />
            </Field>
          </div>
        </div>

        <div>
          <Field label={t("slug")} required error={slugError ?? undefined}>
            <Input
              value={slug}
              onChange={(e) => {
                const next = sanitizeMenuSlugInput(e.target.value);
                setSlug(next);
                setSlugError(validateSlug(next));
              }}
              placeholder={t("slugPlaceholder")}
              dir="ltr"
              className="font-mono"
            />
          </Field>

          <div className="mt-2 min-h-5 text-xs" aria-live="polite">
            {slugStatus.checking && (
              <span className="text-fg-muted">{t("slugChecking")}</span>
            )}
            {!slugStatus.checking && slugStatus.available === true && (
              <span className="inline-flex items-center gap-1 text-success">
                <IoCheckmarkCircle aria-hidden />
                {t("slugAvailable")}
              </span>
            )}
            {!slugStatus.checking && slugStatus.available === false && (
              <span className="inline-flex items-center gap-1 text-danger">
                <IoCloseCircle aria-hidden />
                {t("slugTaken")}
              </span>
            )}
          </div>

          {slugStatus.suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {slugStatus.suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  size="xs"
                  onClick={() => {
                    setSlug(suggestion);
                    setSlugError(null);
                  }}
                  className="font-mono"
                  dir="ltr"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoOptionsOutline className="text-fg-muted" aria-hidden />
            {t("whatToCopy")}
          </p>
          <div className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
            {COPY_OPTION_KEYS.map((key) => (
              <Checkbox
                key={key}
                checked={options[key]}
                onChange={() => toggleOption(key)}
                disabled={isCopying}
                label={t(`options.${OPTION_LABEL_KEYS[key]}`)}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
