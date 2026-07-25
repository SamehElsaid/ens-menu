"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import type { MenuStaffRole } from "@/types/Menu";
import DeleteEntityConfirmModal from "@/components/Dashboard/DeleteEntityConfirmModal";
import { roleDisplayName } from "@/shared/roleDisplayName";

interface DeleteRoleConfirmProps {
  role: MenuStaffRole;
  onClose: () => void;
  onDeleted?: () => void;
}

interface RoleErrorBody {
  errorEn?: string;
  errorAr?: string;
  error?: string;
  message?: string;
}

export default function DeleteRoleConfirm({
  role,
  onClose,
  onDeleted,
}: DeleteRoleConfirmProps) {
  const t = useTranslations("Roles");
  const locale = useLocale();
  const labelText = roleDisplayName(role, locale).trim();

  const handleDelete = async () => {
    const result = await axiosDelete<RoleErrorBody>(
      `/dashboard/staff-roles/${role.id}`,
      locale,
    );
    if (result.status) {
      toast.success(t("deleteSuccess"));
      onDeleted?.();
      onClose();
    } else {
      const body = result.data;
      const msg =
        (locale === "ar" ? body?.errorAr : body?.errorEn) ??
        body?.error ??
        body?.message;
      toast.error(msg || t("deleteError"));
    }
  };

  return (
    <DeleteEntityConfirmModal
      titleId="delete-role-title"
      inputId="delete-role-confirm-input"
      title={t("deleteConfirmTitle")}
      message={t("deleteConfirm", { name: labelText })}
      typeConfirmLabel={
        <>
          {t("typeToConfirm")}{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            «{labelText}»
          </span>
        </>
      }
      confirmPlaceholder={labelText}
      cancelLabel={t("modal.cancel")}
      confirmDeleteLabel={t("confirmDelete")}
      deletingLabel={t("deleting")}
      onClose={onClose}
      onDelete={handleDelete}
    />
  );
}
