"use client";

import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { Advertisement } from "@/types/Menu";
import DeleteEntityConfirmModal from "./DeleteEntityConfirmModal";
import { useApiAction } from "@/hooks/useApiAction";

interface DeleteAdvertisementConfirmProps {
  ad: Advertisement;
  localeTitle: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteAdvertisementConfirm({
  ad,
  localeTitle,
  onClose,
  onDeleted,
}: DeleteAdvertisementConfirmProps) {
  const t = useTranslations("Advertisements");
  const locale = useLocale();
  const { runApiAction } = useApiAction();
  const labelText = localeTitle.trim();

  const handleDelete = async () => {
    await runApiAction(() => axiosDelete(`/ads/${ad.id}`, locale), {
      successToast: t("deleteSuccess"),
      errorToast: ({ error }) => error,
      onSuccess: () => {
        onDeleted?.();
        onClose();
      },
    });
  };

  return (
    <DeleteEntityConfirmModal
      titleId="delete-ad-title"
      inputId="delete-ad-confirm-input"
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
