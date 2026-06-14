"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { Category } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";

interface DeleteCategoryConfirmProps {
  menuId: string;
  category: Category;
  localeName: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteCategoryConfirm({
  menuId,
  category,
  localeName,
  onClose,
  onDeleted,
}: DeleteCategoryConfirmProps) {
  const t = useTranslations("Categories");
  const locale = useLocale();
  const labelText = localeName.trim();

  const handleDelete = async () => {
    const result = await axiosDelete<unknown>(
      `/menus/${menuId}/categories/${category.id}`,
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
      titleId="delete-category-title"
      inputId="delete-category-confirm-input"
      title={t("deleteConfirmTitle")}
      message={t("deleteConfirm", { name: labelText })}
      typeConfirmLabel={t("typeNameToConfirm")}
      confirmPlaceholder={labelText}
      cancelLabel={t("addModal.cancel")}
      confirmDeleteLabel={t("confirmDelete")}
      deletingLabel={t("deleting")}
      onClose={onClose}
      onDelete={handleDelete}
    />
  );
}
