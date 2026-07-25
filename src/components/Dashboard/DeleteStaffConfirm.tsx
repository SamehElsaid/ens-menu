"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { MenuStaff } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";

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
  const labelText = displayLabel.trim();

  const handleDelete = async () => {
    const result = await axiosDelete<unknown>(
      `/dashboard/staff/${staff.id}`,
      locale,
    );
    if (result.status) {
      toast.success(t("deleteSuccess"));
      onDeleted?.();
      onClose();
    } else {
      toast.error(t("deleteError"));
    }
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
          <span className="font-bold text-gray-900 dark:text-white">
            «{labelText}»
          </span>
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
