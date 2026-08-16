"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { MenuStaff } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";
import { useApiAction } from "@/hooks/useApiAction";

interface DeleteStaffConfirmProps {
  staff: MenuStaff;
  displayLabel: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteStaffConfirm({
  staff,
  displayLabel,
  onClose,
  onDeleted,
}: DeleteStaffConfirmProps) {
  const t = useTranslations("Staff");
  const locale = useLocale();
  const { runApiAction } = useApiAction();
  const labelText = displayLabel.trim();

  const handleDelete = async () => {
    await runApiAction(
      () => axiosDelete(`/dashboard/staff/${staff.id}`, locale),
      {
        successToast: t("deleteSuccess"),
        errorToast: t("deleteError"),
        onSuccess: () => {
          onDeleted?.();
          onClose();
        },
      },
    );
  };

  return (
    <DeleteEntityConfirmModal
      titleId="delete-staff-title"
      inputId="delete-staff-confirm-input"
      title={t("deleteConfirmTitle")}
      message={t("deleteConfirm", { name: labelText })}
      typeConfirmLabel={
        <>
          {t("typeToConfirm")}{" "}
          <span className="font-semibold text-fg">«{labelText}»</span>
        </>
      }
      confirmPlaceholder={labelText}
      cancelLabel={t("addModal.cancel")}
      confirmDeleteLabel={t("confirmDelete")}
      deletingLabel={t("deleting")}
      onClose={onClose}
      onDelete={handleDelete}
    />
  );
}
