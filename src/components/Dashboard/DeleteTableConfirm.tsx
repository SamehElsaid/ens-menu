"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { MenuTable } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";
import { useApiAction } from "@/hooks/useApiAction";

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
  const { runApiAction } = useApiAction();
  const labelText = String(displayLabel ?? "").trim();

  const handleDelete = async () => {
    await runApiAction(
      () => axiosDelete(`/menus/${menuId}/tables/${table.id}`, locale),
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
      titleId="delete-table-title"
      inputId="delete-table-confirm-input"
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
