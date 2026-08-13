"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useLocale, useTranslations } from "next-intl";
import { FiTrash2, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useRouter } from "@/i18n/navigation";
import { axiosDelete } from "@/shared/axiosCall";
import { useAppDispatch } from "@/store/hooks";
import { REMOVE_USER } from "@/store/authSlice/authSlice";

type DeleteAccountModalProps = {
  hasPassword: boolean;
  onClose: () => void;
};

type DeleteAccountResponse = {
  message?: string;
  error?: string;
  errorAr?: string;
  errorEn?: string;
};

export default function DeleteAccountModal({
  hasPassword,
  onClose,
}: DeleteAccountModalProps) {
  const locale = useLocale();
  const t = useTranslations("personalProfile");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const confirmationPhrase = t("deleteAccountConfirmPhrase");
  const canDelete =
    confirmation.trim().toLowerCase() === confirmationPhrase.toLowerCase() &&
    (!hasPassword || password.trim().length > 0);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await axiosDelete<
      DeleteAccountResponse,
      { confirmation: string; password?: string }
    >("/user/delete-my-account", locale, {
      confirmation: confirmation.trim(),
      password: hasPassword ? password : undefined,
    });

    if (!result.status) {
      const body = result.data;
      const message =
        (locale === "ar" ? body?.errorAr : body?.errorEn) ??
        body?.error ??
        t("deleteAccountError");
      toast.error(message);
      setIsDeleting(false);
      return;
    }

    toast.success(t("deleteAccountSuccess"));
    dispatch(REMOVE_USER());
    Cookies.remove("sub", { path: "/" });
    router.replace("/auth/login");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <FiTrash2 className="size-5" />
            </span>
            <div>
              <h2
                id="delete-account-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                {t("deleteAccountTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("deleteAccountModalDescription")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label={t("deleteAccountCancel")}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <FiX />
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <p className="font-semibold">{t("deleteAccountWarningTitle")}</p>
          <p className="mt-1">{t("deleteAccountWarningBody")}</p>
        </div>

        {hasPassword ? (
          <div className="mt-4">
            <label
              htmlFor="delete-account-password"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("deleteAccountPasswordLabel")} *
            </label>
            <input
              id="delete-account-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("deleteAccountPasswordPlaceholder")}
              autoComplete="current-password"
              disabled={isDeleting}
              autoFocus
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
        ) : null}

        <div className="mt-4">
          <label
            htmlFor="delete-account-confirmation"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t("deleteAccountTypeConfirmLabel", {
              phrase: confirmationPhrase,
            })}{" "}
            *
          </label>
          <input
            id="delete-account-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={confirmationPhrase}
            autoComplete="off"
            disabled={isDeleting}
            autoFocus={!hasPassword}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("deleteAccountCancel")}
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={!canDelete || isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiTrash2 />
            {isDeleting
              ? t("deletingAccount")
              : t("deleteAccountConfirmButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
