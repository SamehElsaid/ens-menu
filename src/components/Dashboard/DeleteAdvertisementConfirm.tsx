"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { Advertisement } from "@/types/Menu";
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import CustomBtn from "../Custom/CustomBtn";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const isConfirmMatch = confirmName.trim() === localeTitle.trim();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await axiosDelete<unknown>(`/ads/${ad.id}`, locale);
      if (result.status) {
        toast.success(t("deleteSuccess"));
        onDeleted?.();
        onClose();
      } 
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && !isDeleting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-advertisement-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700/50 animate-[fadeIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <IoTrashOutline className="text-red-600 dark:text-red-400 text-2xl" />
            </div>
            <h2
              id="delete-advertisement-title"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              {t("deleteConfirmTitle")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t("deleteConfirm")} <strong>«{localeTitle}»</strong>
        </p>

        <div className="mb-5">
          <label
            htmlFor="delete-advertisement-confirm-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t("typeNameToConfirm")}
          </label>
          <input
            id="delete-advertisement-confirm-input"
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={localeTitle}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
            dir="auto"
            autoComplete="off"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            {t("addModal.cancel")}
          </button>
          <CustomBtn
            type="button"
            loading={isDeleting}
            disabled={isDeleting || !isConfirmMatch}
            onClick={handleDelete}
            variant="danger"
            className="w-fit!"
          >
            <div className="flex items-center justify-center gap-2">
              <IoTrashOutline className="text-xl" />
              {t("confirmDelete")}
            </div>
          </CustomBtn>
        </div>
      </div>
    </div>
  );
}

