"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { MenuTable } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";

interface DeleteTableConfirmProps {
  menuId: string;
  table: MenuTable;
  /** Table number; API may send string or number */
  displayLabel: string | number;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteTableConfirm({
  menuId,
  table,
  displayLabel,
  onClose,
  onDeleted,
}: DeleteTableConfirmProps) {
  const t = useTranslations("Tables");
  const locale = useLocale();
  const labelText = String(displayLabel ?? "").trim();

  const handleDelete = async () => {
    const result = await axiosDelete<unknown>(
      `/menus/${menuId}/tables/${table.id}`,
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
      titleId="delete-table-title"
      inputId="delete-table-confirm-input"
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
