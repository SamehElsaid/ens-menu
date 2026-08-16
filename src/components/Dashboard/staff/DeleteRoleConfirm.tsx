"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import type { MenuStaffRole } from "@/types/Menu";
import DeleteEntityConfirmModal from "@/components/Dashboard/DeleteEntityConfirmModal";
import { roleDisplayName } from "@/shared/roleDisplayName";
import { useApiAction } from "@/hooks/useApiAction";

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
  const { runApiAction } = useApiAction();
  const labelText = roleDisplayName(role, locale).trim();

  const handleDelete = async () => {
    await runApiAction(
      () =>
        axiosDelete<RoleErrorBody>(
          `/dashboard/staff-roles/${role.id}`,
          locale,
        ),
      {
        successToast: t("deleteSuccess"),
        errorToast: ({ error }) => error || t("deleteError"),
        onSuccess: () => {
          onDeleted?.();
          onClose();
        },
      },
    );
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
          <span className="font-semibold text-fg">«{labelText}»</span>
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
