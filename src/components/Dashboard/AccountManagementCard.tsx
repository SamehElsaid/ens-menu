"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiSettings, FiTrash2, FiUser } from "react-icons/fi";
import { useAppSelector } from "@/store/hooks";
import DeleteAccountModal from "@/components/Dashboard/DeleteAccountModal";
import LinkTo from "@/components/Global/LinkTo";

type AccountUser = {
  name?: string;
  email?: string;
  hasPassword?: boolean;
};

export default function AccountManagementCard() {
  const t = useTranslations("personalProfile");
  const authData = useAppSelector((state) => state.auth.data) as {
    user?: AccountUser;
  } | null;
  const user = authData?.user;
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  return (
    <>
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {t("accountManagement")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("accountManagementDescription")}
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FiSettings className="size-4.5" />
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <FiUser className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || user?.email || t("notEntered")}
              </p>
              {user?.email ? (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkTo
              href="/dashboard/personal"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FiSettings className="size-4" />
              {t("editAccount")}
            </LinkTo>
            <button
              type="button"
              onClick={() => setDeleteAccountOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <FiTrash2 className="size-4" />
              {t("deleteAccount")}
            </button>
          </div>
        </div>
      </section>

      {deleteAccountOpen ? (
        <DeleteAccountModal
          hasPassword={Boolean(user?.hasPassword)}
          onClose={() => setDeleteAccountOpen(false)}
        />
      ) : null}
    </>
  );
}
