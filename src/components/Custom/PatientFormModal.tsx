"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaPlus } from "react-icons/fa";
import FormInformation from "@/components/dashboardControls/FormInformation";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientFormModal({
  isOpen,
  onClose,
}: PatientFormModalProps) {
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
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg mx-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <FaPlus className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {t("patients.createPatient") || "Create Patient"}
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

        <FormInformation type="parent" />
      </div>
    </div>
  );
}

