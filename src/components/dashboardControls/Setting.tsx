"use client";

import { useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CardDashBoard from "@/components/Card/CardDashBoard";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import {
  FaCalendarCheck,
  FaCalendarTimes,
  FaClock,
  FaComments,
} from "react-icons/fa";
import { useTranslations } from "next-intl";

type SettingsFormData = {
  allowBookingOnline: boolean;
  allowBookingOffline: boolean;
  allowConsultation: boolean;
  isAvailableNow: boolean;
};

const createSettingsSchema = () => {
  return yup.object().shape({
    allowBookingOnline: yup.boolean(),
    allowBookingOffline: yup.boolean(),
    allowConsultation: yup.boolean(),
    isAvailableNow: yup.boolean(),
  });
};

export default function Setting({
  type,
}: {
  type?: "specialist" | "parent";
}) {
  const t = useTranslations("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    field: keyof SettingsFormData;
    newValue: boolean;
    oldValue: boolean;
  } | null>(null);
  const [pendingOnChange, setPendingOnChange] = useState<
    ((value: boolean) => void) | null
  >(null);
  const initialValues: SettingsFormData = {
    allowBookingOnline: true,
    allowBookingOffline: true,
    allowConsultation: true,
    isAvailableNow: true,
  };

  const { control, handleSubmit } = useForm<SettingsFormData>({
    defaultValues: initialValues,
    resolver: yupResolver(
      createSettingsSchema()
    ) as unknown as Resolver<SettingsFormData>,
    mode: "onChange",
  });

  const handleCheckboxChange = (
    field: keyof SettingsFormData,
    newValue: boolean,
    currentValue: boolean,
    onChange: (value: boolean) => void
  ) => {
    // If value is the same, no need to show modal
    if (newValue === currentValue) {
      onChange(newValue);
      return;
    }

    // Store the pending change
    setPendingChange({
      field,
      newValue,
      oldValue: currentValue,
    });
    setPendingOnChange(() => onChange);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (pendingChange && pendingOnChange) {
      // Apply the change
      pendingOnChange(pendingChange.newValue);
      console.log(
        `Confirmed change: ${pendingChange.field} = ${pendingChange.newValue}`
      );
      // Handle API call here if needed
      setIsModalOpen(false);
      setPendingChange(null);
      setPendingOnChange(null);
    }
  };

  const handleCancel = () => {
    if (pendingChange && pendingOnChange) {
      // Revert to old value
      pendingOnChange(pendingChange.oldValue);
    }
    setIsModalOpen(false);
    setPendingChange(null);
    setPendingOnChange(null);
  };

  const onSubmit = (data: SettingsFormData) => {
    console.log("Form submitted:", data);
    // Handle final form submission here if needed
  };

  return (
    <>
      <CardDashBoard>
        <h1 className="text-2xl font-bold mb-6">
          {t("personal.settings") || "Settings"}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Controller
              control={control}
              name="allowBookingOnline"
              render={({ field: { value, onChange } }) => (
                <label className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "allowBookingOnline",
                          e.target.checked,
                          value,
                          onChange
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        value
                          ? "bg-primary border-primary"
                          : "bg-white border-gray-300 group-hover:border-primary/60"
                      }`}
                    >
                      {value && (
                        <svg
                          className="min-w-3 w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <FaCalendarCheck className="text-primary text-xl" />
                    <div>
                      <span className="font-medium text-gray-900">
                        {t("personal.allowBookingOnline")}
                      </span>
                      <p className="text-sm text-gray-500">
                        {t("personal.allowBookingOnlineDescription") ||
                          "Enable online booking for your services"}
                      </p>
                    </div>
                  </div>
                </label>
              )}
            />

            <Controller
              control={control}
              name="allowBookingOffline"
              render={({ field: { value, onChange } }) => (
                <label className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "allowBookingOffline",
                          e.target.checked,
                          value,
                          onChange
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        value
                          ? "bg-primary border-primary"
                          : "bg-white border-gray-300 group-hover:border-primary/60"
                      }`}
                    >
                      {value && (
                        <svg
                          className="min-w-3 w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <FaCalendarTimes className="text-primary text-xl" />
                    <div>
                      <span className="font-medium text-gray-900">
                        {t("personal.allowBookingOffline")}
                      </span>
                      <p className="text-sm text-gray-500">
                        {t("personal.allowBookingOfflineDescription") ||
                          "Enable offline booking for your services"}
                      </p>
                    </div>
                  </div>
                </label>
              )}
            />

            <Controller
              control={control}
              name="allowConsultation"
              render={({ field: { value, onChange } }) => (
                <label className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "allowConsultation",
                          e.target.checked,
                          value,
                          onChange
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        value
                          ? "bg-primary border-primary"
                          : "bg-white border-gray-300 group-hover:border-primary/60"
                      }`}
                    >
                      {value && (
                        <svg
                          className="min-w-3 w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <FaComments className="text-primary text-xl" />
                    <div>
                      <span className="font-medium text-gray-900">
                        {t("personal.allowConsultation")}
                      </span>
                      <p className="text-sm text-gray-500">
                        {t("personal.allowConsultationDescription") ||
                          "Enable consultation services for clients"}
                      </p>
                    </div>
                  </div>
                </label>
              )}
            />

            <Controller
              control={control}
              name="isAvailableNow"
              render={({ field: { value, onChange } }) => (
                <label className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "isAvailableNow",
                          e.target.checked,
                          value,
                          onChange
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        value
                          ? "bg-primary border-primary"
                          : "bg-white border-gray-300 group-hover:border-primary/60"
                      }`}
                    >
                      {value && (
                        <svg
                          className="min-w-3 w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <FaClock className="text-primary text-xl" />
                    <div>
                      <span className="font-medium text-gray-900">
                        {t("personal.isAvailableNow")}
                      </span>
                      <p className="text-sm text-gray-500">
                        {t("personal.isAvailableNowDescription") ||
                          "Let clients know you can accept immediate bookings"}
                      </p>
                    </div>
                  </div>
                </label>
              )}
            />
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
            >
              {t("form.submit") || "Save Settings"}
            </button>
          </div>
        </form>
      </CardDashBoard>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={t("form.confirmChanges") || "Confirm Changes"}
        message={
          pendingChange
            ? (() => {
                const fieldNames: Record<keyof SettingsFormData, string> = {
                  allowBookingOnline: t("personal.allowBookingOnline"),
                  allowBookingOffline: t("personal.allowBookingOffline"),
                  allowConsultation: t("personal.allowConsultation"),
                  isAvailableNow: t("personal.isAvailableNow"),
                };
                const action = pendingChange.newValue
                  ? t("personal.enable")
                  : t("personal.disable");
                const messageTemplate =
                  t("form.confirmChangeMessage", {
                    action: action,
                    fieldName: fieldNames[pendingChange.field],
                  }) ||
                  "Are you sure you want to {action} {fieldName}?";
                return messageTemplate;
              })()
            : t("form.confirmChangesMessage") ||
              "Are you sure you want to save these changes?"
        }
        confirmText={t("form.confirm") || "Confirm"}
        cancelText={t("form.cancel") || "Cancel"}
      />
    </>
  );
}
