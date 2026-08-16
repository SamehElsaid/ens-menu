"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { Category } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";
import { useApiAction } from "@/hooks/useApiAction";

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
  const { runApiAction } = useApiAction();
  const labelText = localeName.trim();
  const itemsCount = Number(category.itemsCount ?? 0);

  const handleDelete = async () => {
    await runApiAction(
      () =>
        axiosDelete<{ deletedItemsCount?: number }>(
          `/menus/${menuId}/categories/${category.id}`,
          locale,
        ),
      {
        successToast: ({ data }) => {
          const deletedCount = Number(
            (data as { deletedItemsCount?: number } | undefined)
              ?.deletedItemsCount ?? itemsCount,
          );
          return deletedCount > 0
            ? t("deleteSuccessWithItems", { count: deletedCount })
            : t("deleteSuccess");
        },
        errorToast: t("deleteError"),
        onSuccess: () => {
          onDeleted?.();
          onClose();
        },
      },
    );
  };

  const message =
    itemsCount > 0
      ? t("deleteConfirmWithItems", { name: labelText, count: itemsCount })
      : t("deleteConfirm", { name: labelText });

  return (
    <DeleteEntityConfirmModal
      titleId="delete-category-title"
      inputId="delete-category-confirm-input"
      title={t("deleteConfirmTitle")}
      message={message}
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
