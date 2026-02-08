"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { Category } from "@/types/Menu";
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import CustomBtn from "../Custom/CustomBtn";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const canConfirm = confirmName.trim() === localeName.trim();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await axiosDelete<unknown>(
        `/menus/${menuId}/categories/${category.id}`,
        locale
      );
      if (result.status) {
        toast.success(t("deleteSuccess"));
        onDeleted?.();
        onClose();
      } else {
        toast.error(t("deleteError"));
      }
    } catch {
      toast.error(t("deleteError"));
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
        aria-labelledby="delete-category-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700/50 animate-[fadeIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <IoTrashOutline className="text-red-600 dark:text-red-400 text-2xl" />
            </div>
            <h2 id="delete-category-title" className="text-xl font-bold text-gray-900 dark:text-white">
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
          {t("deleteConfirm", { name: localeName })}
        </p>

        <label htmlFor="delete-category-confirm-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("typeNameToConfirm")}{" "}
          <span className="font-bold text-gray-900 dark:text-white">«{localeName}»</span>
        </label>
        <input
          id="delete-category-confirm-input"
          type="text"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={localeName}
          disabled={isDeleting}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all mb-6"
          autoComplete="off"
        />

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
            disabled={isDeleting || !canConfirm}
            onClick={handleDelete}
            variant="danger"
            className="w-fit!"
          >
            <div className="flex items-center justify-center gap-2">
              <IoTrashOutline className="text-xl" />
              {isDeleting ? t("deleting") : t("confirmDelete")}
            </div>
          </CustomBtn>
        </div>
      </div>
    </div>
  );
}
