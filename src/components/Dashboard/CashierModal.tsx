"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosHttpPatch } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import CustomBtn from "@/components/Custom/CustomBtn";
import { toast } from "react-toastify";
import { IoCloseOutline, IoMailOutline } from "react-icons/io5";
import { FaCashRegister, FaLock } from "react-icons/fa";
import type { Menu } from "@/types/Menu";

export type CashierRow = {
  id: number;
  email: string;
  name: string;
  phoneNumber: string | null;
  isSuspended?: boolean | number;
  createdAt?: string;
  menuIds: number[];
  pageKeys: string[];
};

const PAGE_KEYS = [
  { key: "overview", labelEn: "Overview", labelAr: "نظرة عامة" },
  { key: "personal", labelEn: "Personal", labelAr: "الملف الشخصي" },
  { key: "categories", labelEn: "Categories", labelAr: "الفئات" },
  { key: "items", labelEn: "Items", labelAr: "العناصر" },
  { key: "table", labelEn: "Tables", labelAr: "الطاولات" },
  { key: "staff", labelEn: "Staff", labelAr: "الموظفون" },
  { key: "advertisements", labelEn: "Advertisements", labelAr: "الإعلانات" },
  { key: "settings", labelEn: "Settings", labelAr: "الإعدادات" },
  { key: "history", labelEn: "Activity log", labelAr: "سجل النشاط" },
] as const;

function menuLabel(m: Menu, ar: boolean): string {
  return ar ? m.nameAr || m.nameEn : m.nameEn || m.nameAr;
}

type Props = {
  mode: "create" | "edit";
  cashier?: CashierRow | null;
  menus: Menu[];
  menusLoading: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CashierModal({
  mode,
  cashier,
  menus,
  menusLoading,
  onClose,
  onSuccess,
}: Props) {
  const locale = useLocale();
  const ar = locale === "ar";
  const t = useTranslations("dashboardCashiers.modal");
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedMenus, setSelectedMenus] = useState<number[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([
    "overview",
    "categories",
    "items",
  ]);
  const [editPassword, setEditPassword] = useState("");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    if (mode === "edit" && cashier) {
      setName(cashier.name ?? "");
      setPhone(cashier.phoneNumber ?? "");
      setEditPassword("");
      setSelectedMenus([...cashier.menuIds]);
      setSelectedPages(
        cashier.pageKeys?.length ? [...cashier.pageKeys] : ["overview"],
      );
      const suspended = Boolean(
        cashier.isSuspended === true || cashier.isSuspended === 1,
      );
      setEditActive(!suspended);
    } else {
      setEmail("");
      setPassword("");
      setName("");
      setPhone("");
      setSelectedMenus([]);
      setSelectedPages(["overview", "categories", "items"]);
    }
  }, [mode, cashier]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const toggleMenu = (id: number) => {
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const togglePage = (key: string) => {
    setSelectedPages((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const title = mode === "create" ? t("createTitle") : t("editTitle");

  const subtitle =
    mode === "edit" && cashier ? cashier.email : t("createSubtitle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "create") {
        const result = await axiosPost<
          Record<string, unknown>,
          { message?: string }
        >("/user/cashiers", locale, {
          email,
          password,
          name,
          phoneNumber: phone || undefined,
          menuIds: selectedMenus,
          pageKeys: selectedPages,
        });
        if (result.status) {
          toast.success(t("createSuccess"));
          onSuccess();
          onClose();
        } else {
          toast.error(
            (result.data as { message?: string })?.message ||
              t("createError"),
          );
        }
      } else if (cashier) {
        const payload: Record<string, unknown> = {
          name: name.trim(),
          phoneNumber: phone.trim() || null,
          menuIds: selectedMenus,
          pageKeys: selectedPages,
          isActive: editActive,
        };
        if (editPassword.trim().length >= 6) {
          payload.password = editPassword;
        }
        const res = await axiosHttpPatch<typeof payload, { message?: string }>(
          `/user/cashiers/${cashier.id}`,
          locale,
          payload,
        );
        if (res.status) {
          toast.success(t("updateSuccess"));
          onSuccess();
          onClose();
        } else {
          toast.error(
            (res.data as { message?: string })?.message || t("updateError"),
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const disableSubmit =
    submitting ||
    selectedMenus.length === 0 ||
    selectedPages.length === 0 ||
    (mode === "create" &&
      (!email.trim() || !password || password.length < 6 || !name.trim()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-2xl dark:border-gray-700/50 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-gray-200 bg-linear-to-br from-primary/5 to-transparent px-6 pb-4 pt-6 dark:border-gray-700 dark:from-primary/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-accent-purple/10 shadow-sm ring-1 ring-primary/10">
                <FaCashRegister className="text-2xl text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {title}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={t("close")}
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-y-auto px-6 py-5"
        >
          {mode === "create" && (
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wide text-slate-600 dark:border-slate-600 dark:text-slate-300">
                  {t("sectionProfile")}
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="cashier-create-name"
                      className="block text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {t("name")}
                    </label>
                    <CustomInput
                      id="cashier-create-name"
                      type="text"
                      autoComplete="name"
                      placeholder={t("namePlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="cashier-create-phone"
                      className="block text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {t("phoneOptional")}
                    </label>
                    <CustomInput
                      id="cashier-create-phone"
                      type="text"
                      autoComplete="tel"
                      placeholder={t("phonePlaceholder")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-1 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wide text-slate-600 dark:border-slate-600 dark:text-slate-300">
                  {t("sectionLogin")}
                </h4>
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                  {t("sectionLoginHint")}
                </p>
                <div className="grid gap-4 sm:grid-cols-1">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="cashier-create-email"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      <IoMailOutline className="text-lg text-primary" aria-hidden />
                      {t("email")}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("emailHint")}
                    </p>
                    <CustomInput
                      id="cashier-create-email"
                      type="email"
                      autoComplete="email"
                      icon={<IoMailOutline className="text-lg" />}
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="cashier-create-password"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      <FaLock className="text-sm text-primary" aria-hidden />
                      {t("password")}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("passwordHint")}
                    </p>
                    <CustomInput
                      id="cashier-create-password"
                      type="password"
                      autoComplete="new-password"
                      icon={<FaLock className="text-sm" />}
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="cashier-edit-name"
                  className="block text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  {t("name")}
                </label>
                <CustomInput
                  id="cashier-edit-name"
                  type="text"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="cashier-edit-phone"
                  className="block text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  {t("phoneOptional")}
                </label>
                <CustomInput
                  id="cashier-edit-phone"
                  type="text"
                  autoComplete="tel"
                  placeholder={t("phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="cashier-edit-password"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  <FaLock className="text-sm text-primary" aria-hidden />
                  {t("newPasswordOptional")}
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("editPasswordHint")}
                </p>
                <CustomInput
                  id="cashier-edit-password"
                  type="password"
                  autoComplete="new-password"
                  icon={<FaLock className="text-sm" />}
                  placeholder={t("passwordPlaceholder")}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                {t("activeLabel")}
              </label>
            </div>
          )}

          <div className="mt-5">
            <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
              {t("menusSection")}
            </h3>
            {menusLoading ? (
              <p className="text-sm text-slate-500">{t("menusLoading")}</p>
            ) : menus.length === 0 ? (
              <p className="text-sm text-amber-600">{t("noMenus")}</p>
            ) : (
              <ul className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                {menus.map((m) => {
                  const mid = typeof m.id === "number" ? m.id : Number(m.id);
                  return (
                    <label
                      key={String(m.id)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMenus.includes(mid)}
                        onChange={() => toggleMenu(mid)}
                      />
                      <span>{menuLabel(m, ar)}</span>
                    </label>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-5">
            <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
              {t("pagesSection")}
            </h3>
            <ul className="grid max-h-44 gap-2 overflow-y-auto sm:grid-cols-2">
              {PAGE_KEYS.map((p) => (
                <label
                  key={p.key}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(p.key)}
                    onChange={() => togglePage(p.key)}
                  />
                  {ar ? p.labelAr : p.labelEn}
                </label>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6 dark:border-slate-700">
            <CustomBtn type="submit" disabled={disableSubmit} className="min-w-[120px]">
              {submitting
                ? mode === "create"
                  ? t("creating")
                  : t("saving")
                : mode === "create"
                  ? t("createSubmit")
                  : t("save")}
            </CustomBtn>
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
