"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { Item } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";

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
  const labelText = localeName.trim();

  const handleDelete = async () => {
    const result = await axiosDelete<unknown>(
      `/menus/${menuId}/items/${item.id}`,
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
