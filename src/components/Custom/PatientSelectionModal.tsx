"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaPlus, FaUser, FaUsers } from "react-icons/fa";

interface PatientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: "me" | "myChildren") => void;
}

export default function PatientSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: PatientSelectionModalProps) {
  const t = useTranslations("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm m-0">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg mx-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <FaPlus className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {t("patients.addPatient") || "Add Patient"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onSelect("me")}
            className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FaUser className="text-primary text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {t("patients.me") || "Me"}
              </h3>
              <p className="text-sm text-gray-500">
                {t("patients.meDescription") || "Add yourself as a patient"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelect("myChildren")}
            className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FaUsers className="text-primary text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {t("patients.myChildren") || "My Children"}
              </h3>
              <p className="text-sm text-gray-500">
                {t("patients.myChildrenDescription") || "Add your children as patients"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

