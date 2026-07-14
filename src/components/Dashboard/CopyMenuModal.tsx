"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import { normalizeMenuFromApi } from "@/lib/normalizeMenuFromApi";
import type { Menu, SlugCheckResponse } from "@/types/Menu";
import { toast } from "react-toastify";
import {
  IoCloseOutline,
  IoCopyOutline,
  IoLinkOutline,
  IoPricetagOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";

type CopyMenuModalProps = {
  menu: Menu;
  menuName: string;
  onClose: () => void;
  onCopied: (newMenu: Menu) => void;
};

type CopyMenuPayload = {
  nameAr: string;
  nameEn: string;
  slug: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <IoCopyOutline className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t("title")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("subtitle", { name: menuName })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCopying}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label={t("cancel")}
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {t("description")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <IoPricetagOutline className="text-primary" />
              {t("menuNames")}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t("nameAr")} *
                </label>
                <CustomInput
                  type="text"
                  value={nameAr}
                  onChange={(e) => {
                    const next = e.target.value;
                    setNameAr(next);
                    setNameArError(
                      next.trim() ? null : t("validation.nameArRequired"),
                    );
                  }}
                  className="px-4 py-3 border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder={t("nameArPlaceholder")}
                  error={nameArError ?? undefined}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t("nameEn")} *
                </label>
                <CustomInput
                  type="text"
                  value={nameEn}
                  onChange={(e) => {
                    const next = e.target.value;
                    setNameEn(next);
                    setNameEnError(
                      next.trim() ? null : t("validation.nameEnRequired"),
                    );
                  }}
                  dir="ltr"
                  className="px-4 py-3 border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder={t("nameEnPlaceholder")}
                  error={nameEnError ?? undefined}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <IoLinkOutline className="text-primary" />
              {t("slug")} *
            </label>
            <CustomInput
              type="text"
              value={slug}
              onChange={(e) => {
                const next = e.target.value.toLowerCase().replace(/\s+/g, "-");
                setSlug(next);
                setSlugError(validateSlug(next));
              }}
              dir="ltr"
              className="px-4 py-3 border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder={t("slugPlaceholder")}
              error={slugError ?? undefined}
            />
            <div className="mt-2 min-h-5 text-xs">
              {slugStatus.checking && (
                <span className="text-slate-500">{t("slugChecking")}</span>
              )}
              {!slugStatus.checking && slugStatus.available === true && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <IoCheckmarkCircle />
                  {t("slugAvailable")}
                </span>
              )}
              {!slugStatus.checking && slugStatus.available === false && (
                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                  <IoCloseCircle />
                  {t("slugTaken")}
                </span>
              )}
            </div>
            {slugStatus.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {slugStatus.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setSlug(suggestion);
                      setSlugError(null);
                    }}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 font-mono text-xs text-slate-600 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-slate-700 dark:text-slate-300"
                    dir="ltr"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isCopying}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              {isCopying ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("copying")}
                </>
              ) : (
                <>
                  <IoCopyOutline className="text-base" />
                  {t("copy")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
