"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";
import { useApiAction } from "@/hooks/useApiAction";

interface DeleteMenuConfirmProps {
  menuId: string;
  menuTitle: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteMenuConfirm({
  menuId,
  menuTitle,
  onClose,
  onDeleted,
}: DeleteMenuConfirmProps) {
  const locale = useLocale();
  const t = useTranslations("Menus");
  const tCommon = useTranslations("common");
  const { runApiAction } = useApiAction();
  const labelText = menuTitle.trim();

  const handleDelete = async () => {
    await runApiAction(() => axiosDelete(`/menus/${menuId}`, locale), {
      successToast: t("deleteSuccessDetail"),
      errorToast: ({ error }) => error,
      onSuccess: () => {
        onDeleted?.();
        onClose();
      },
    });
  };

  return (
    <DeleteEntityConfirmModal
      titleId="delete-menu-title"
      inputId="delete-menu-confirm-input"
      title={t("deleteConfirmTitle")}
      message={
        <>
          {t("deletePermanentInstruction")}{" "}
          <span className="font-semibold text-fg">«{labelText}»</span>
        </>
      }
      typeConfirmLabel={t("typeMenuNameToConfirm")}
      confirmPlaceholder={labelText}
      cancelLabel={tCommon("cancel")}
      confirmDeleteLabel={tCommon("confirmDelete")}
      deletingLabel={t("deleting")}
      closeAriaLabel={tCommon("close")}
      onClose={onClose}
      onDelete={handleDelete}
    />
  );
}
