 "use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import CustomBtn from "../Custom/CustomBtn";

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmName, setConfirmName] = useState("");

    const isConfirmMatch = confirmName.trim() === menuTitle.trim();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const result = await axiosDelete<unknown>(`/menus/${menuId}`, locale);
            if (result.status) {
                toast.success(
                    locale === "ar"
                        ? "تم حذف القائمة بنجاح."
                        : "Menu has been deleted successfully."
                );
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
                aria-labelledby="delete-menu-title"
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-200/70 animate-[fadeIn_0.25s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <IoTrashOutline className="text-red-600 text-2xl" />
                        </div>
                        <h2
                            id="delete-menu-title"
                            className="text-xl font-bold text-gray-900"
                        >
                            {locale === "ar"
                                ? "تأكيد حذف القائمة"
                                : "Confirm menu deletion"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label={locale === "ar" ? "إغلاق" : "Close"}
                    >
                        <IoCloseOutline className="text-xl" />
                    </button>
                </div>

                <p className="text-gray-600 mb-4 text-sm">
                    {locale === "ar"
                        ? "لحذف هذه القائمة نهائيًا، اكتب اسم القائمة تمامًا كما يظهر بالأسفل، ثم اضغط تأكيد الحذف."
                        : "To permanently delete this menu, type its name exactly as shown below, then confirm deletion."}{" "}
                    <strong>«{menuTitle}»</strong>
                </p>

                <div className="mb-5">
                    <label
                        htmlFor="delete-menu-confirm-input"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {locale === "ar"
                            ? "اكتب اسم القائمة للتأكيد"
                            : "Type the menu name to confirm"}
                    </label>
                    <input
                        id="delete-menu-confirm-input"
                        type="text"
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        placeholder={menuTitle}
                        className="w-full px-4 py-3 rounded-xl border-2 border-red-100 bg-red-50/50 text-gray-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                        dir="auto"
                        autoComplete="off"
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-5 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                        {locale === "ar" ? "إلغاء" : "Cancel"}
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
                            {locale === "ar" ? "تأكيد الحذف" : "Confirm delete"}
                        </div>
                    </CustomBtn>
                </div>
            </div>
        </div>
    );
}

