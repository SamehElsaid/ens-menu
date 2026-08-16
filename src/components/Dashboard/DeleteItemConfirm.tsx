"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { Item } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";
import { useApiAction } from "@/hooks/useApiAction";

interface DeleteItemConfirmProps {
  menuId: string;
  item: Item;
  localeName: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteItemConfirm({
  menuId,
  item,
  localeName,
  onClose,
  onDeleted,
}: DeleteItemConfirmProps) {
  const t = useTranslations("Items");
  const locale = useLocale();
  const { runApiAction } = useApiAction();
  const labelText = localeName.trim();

  const handleDelete = async () => {
    await runApiAction(
      () => axiosDelete(`/menus/${menuId}/items/${item.id}`, locale),
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
      titleId="delete-item-title"
      inputId="delete-item-confirm-input"
      title={t("deleteConfirmTitle")}
      message={t("deleteConfirm", { name: labelText })}
      typeConfirmLabel={t("typeNameToConfirm")}
      confirmPlaceholder={labelText}
      cancelLabel={t("addModal.cancel")}
      confirmDeleteLabel={t("confirmDelete")}
      onClose={onClose}
      onDelete={handleDelete}
    />
  );
}
