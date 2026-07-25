"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import CustomInput from "@/components/Custom/CustomInput";
import CustomBtn from "@/components/Custom/CustomBtn";
import StaffPermissionsEditor from "./StaffPermissionsEditor";
import type { MenuStaffRole } from "@/types/Menu";
import { roleDisplayName } from "@/shared/roleDisplayName";
import {
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoAddCircleOutline,
} from "react-icons/io5";

interface AddRoleModalProps {
  role?: MenuStaffRole | null;
  /**
   * `duplicate` seeds the form from `role` but saves a brand new role — the way
   * to get an editable version of a read-only default role.
   */
  mode?: "edit" | "duplicate";
  onClose: () => void;
  onSaved?: () => void;
}

interface RoleErrorBody {
  errorEn?: string;
  errorAr?: string;
  error?: string;
  message?: string;
}

export default function AddRoleModal({
  role = null,
  mode = "edit",
  onClose,
  onSaved,
}: AddRoleModalProps) {
  const t = useTranslations("Roles.modal");
  const locale = useLocale();
  const isDuplicate = mode === "duplicate" && Boolean(role);
  const isEdit = Boolean(role?.id) && !isDuplicate;
  const modalRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(() => {
    if (!role) return "";
    return isDuplicate ? t("copyName", { name: role.name }) : role.name;
  });
  const [nameEn, setNameEn] = useState(() => {
    const source = role?.nameEn?.trim();
    if (!source) return "";
    return isDuplicate ? t("copyName", { name: source }) : source;
  });
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions ?? [],
  );
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, isSaving]);

  const onSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t("nameRequired"));
      return;
    }
    setNameError(undefined);
    setIsSaving(true);
    try {
      const payload = {
        name: trimmed,
        nameEn: nameEn.trim(),
        permissions,
      };
      const result = isEdit
        ? await axiosPatch<typeof payload, RoleErrorBody>(
            `/dashboard/staff-roles/${role!.id}`,
            locale,
            payload,
          )
        : await axiosPost<typeof payload, RoleErrorBody>(
            "/dashboard/staff-roles",
            locale,
            payload,
          );

      if (result.status) {
        toast.success(isEdit ? t("editSuccess") : t("createSuccess"));
        onSaved?.();
        onClose();
      } else {
        const body = result.data;
        const msg =
          (locale === "ar" ? body?.errorAr : body?.errorEn) ??
          body?.error ??
          body?.message;
        toast.error(msg || (isEdit ? t("editError") : t("createError")));
      }
    } catch {
      toast.error(isEdit ? t("editError") : t("createError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-role-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-2xl animate-[fadeIn_0.25s_ease-out] dark:border-gray-700/50 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-gray-200 bg-linear-to-br from-primary/5 to-transparent px-6 pb-4 pt-6 dark:border-gray-700 dark:from-primary/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-accent-purple/10 shadow-sm ring-1 ring-primary/10">
                <IoShieldCheckmarkOutline className="text-2xl text-primary" />
              </div>
              <div>
                <h2
                  id="add-role-title"
                  className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
                >
                  {isDuplicate
                    ? t("duplicateTitle")
                    : isEdit
                      ? t("editTitle")
                      : t("title")}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {isDuplicate
                    ? t("duplicateSubtitle", {
                        name: roleDisplayName(role!, locale),
                      })
                    : t("subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700/80 dark:hover:text-gray-200"
              aria-label={t("close")}
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("nameLabel")} *
            </label>
            <CustomInput
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(undefined);
              }}
              placeholder={t("namePlaceholder")}
              error={nameError}
              className="px-4 py-3 border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("nameEnLabel")}
            </label>
            <CustomInput
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={t("nameEnPlaceholder")}
              className="px-4 py-3 border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {t("nameEnHint")}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-600/50 dark:bg-gray-700/30">
            <StaffPermissionsEditor
              value={permissions}
              onChange={setPermissions}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-gray-50/50 p-6 pt-4 dark:border-gray-700 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-2xl border-2 border-gray-300 px-5 py-3 font-medium text-gray-700 transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/30 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t("cancel")}
          </button>
          <div className="w-fit!">
            <CustomBtn
              type="button"
              loading={isSaving}
              disabled={isSaving}
              onClick={onSubmit}
            >
              <div className="flex items-center justify-center gap-2">
                <IoAddCircleOutline className="text-xl" />
                {isEdit ? t("save") : t("create")}
              </div>
            </CustomBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
