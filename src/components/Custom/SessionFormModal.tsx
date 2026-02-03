"use client";

import { useEffect, useState } from "react";
import { Controller, Resolver, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import {
  FaCalendar,
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa";
import CustomInput from "./CustomInput";
import { convetDateToTimeString, timeStringToDate } from "@/shared/_shared";

export type SessionFormValues = {
  sessions: {
    sectionName: string;
    date: string;
    time: string;
  }[];
};

type SessionFormData = {
  sessions: {
    sectionName: string;
    date: Date | null;
    time: string;
  }[];
};

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SessionFormValues) => void;
  initialValues?: SessionFormValues | null;
}

const createSessionSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    sessions: yup
      .array()
      .of(
        yup.object().shape({
          sectionName: yup
            .string()
            .required(
              t("sessions.sectionNameRequired") || "Section name is required"
            )
            .min(
              2,
              t("sessions.sectionNameMinLength") ||
                "Section name must be at least 2 characters"
            ),
          date: yup.date().nullable().required(t("workSchedule.dateRequired")),
          time: yup
            .string()
            .required(t("sessions.timeRequired") || "Time is required"),
        })
      )
      .min(1, t("sessions.sectionNameRequired") || "At least one session"),
  });

export default function SessionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: SessionFormModalProps) {
  const t = useTranslations("");
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [defaultTime, setDefaultTime] = useState<string>(() =>
    convetDateToTimeString(new Date())
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<SessionFormData>({
    defaultValues: {
      sessions: [],
    },
    resolver: yupResolver(
      createSessionSchema(t)
    ) as unknown as Resolver<SessionFormData>,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  console.log(fields);

  const handleAddDate = (date: Date | null) => {
    if (!date) return;

    const currentSessions = getValues("sessions") || [];
    const newDateKey = date.toISOString().split("T")[0];

    const exists = currentSessions.some((session) => {
      if (!session?.date) return false;
      const existing =
        session.date instanceof Date
          ? session.date
          : new Date(session.date as unknown as string);
      return existing.toISOString().split("T")[0] === newDateKey;
    });

    console.log(exists);
    if (exists) {
      setPendingDate(date);
      return;
    }

    const defaultTimeString = defaultTime || convetDateToTimeString(new Date());

    append({
      sectionName:
        (t("sessions.sectionName") || "Section") +
        ` ${currentSessions.length + 1}`,
      date,
      time: defaultTimeString,
    });

    setPendingDate(null);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialValues && initialValues.sessions?.length) {
        // Convert date string to Date object for each session
        const mappedSessions = initialValues.sessions.map((session) => ({
          sectionName: session.sectionName || "",
          date: session.date ? new Date(session.date) : null,
          time: session.time || "",
        }));

        reset({
          sessions: mappedSessions,
        });
      } else {
        reset({
          sessions: [],
        });
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialValues, reset]);

  if (!isOpen) return null;

  const onFormSubmit = (data: SessionFormData) => {
    const sessions = (data.sessions || []).map((session) => {
      const dateString = session.date
        ? typeof session.date === "string"
          ? session.date
          : new Date(session.date).toISOString().split("T")[0]
        : "";

      return {
        sectionName: session.sectionName.trim(),
        date: dateString,
        time: session.time,
      };
    });

    onSubmit({ sessions });
    reset();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm m-0">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <FaCalendarAlt className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {initialValues
                ? t("sessions.editSession") || "Edit Session"
                : t("sessions.addSession") || "Add Sessions"}
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

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Date & default time selector to add multiple session cards */}
          {!initialValues && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CustomInput
                  type="date"
                  id="bulk-date"
                  label={t("workSchedule.date")}
                  placeholder={t("workSchedule.selectDate")}
                  icon={<FaCalendar />}
                  disabledPreviousDates={true}
                  value={pendingDate}
                  onChange={(e) => {
                    const date = e as unknown as Date | null;
                    handleAddDate(date);
                  }}
                />

                <CustomInput
                  type="time"
                  id="default-time"
                  label={t("sessions.time") || "Default time"}
                  placeholder={t("sessions.selectTime")}
                  icon={<FaClock />}
                  value={timeStringToDate(defaultTime)}
                  onChange={(e) => {
                    const date = e as unknown as Date;
                    const time = convetDateToTimeString(date);
                    setDefaultTime(time);
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 px-1">
                {t("sessions.sectionNamePlaceholder") ||
                  "Select a date to add a new session card. New cards will use the default time above."}
              </p>
            </div>
          )}

          <div className="space-y-4 max-h-[360px]  pe-1">
            {fields.length === 0 && (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                <FaPlus className="text-gray-500 text-2xl" />
                <p className="text-sm">
                  {t("sessions.noSessions") || "No sessions added yet"}
                </p>
              </div>
            )}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 p-4 shadow-sm bg-gray-50 relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {t("sessions.sectionName") || "Section"} #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    <FaTrashAlt className="text-xs" />
                  </button>
                </div>

                <div className="space-y-3">
                  <Controller
                    control={control}
                    name={`sessions.${index}.sectionName`}
                    render={({ field: { value, onChange } }) => (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          {t("sessions.sectionName") || "Section Name"}
                        </label>
                        <CustomInput
                          id={`sectionName-${index}`}
                          type="text"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          placeholder={
                            t("sessions.sectionNamePlaceholder") ||
                            "Enter section name"
                          }
                          error={
                            (errors.sessions?.[index]?.sectionName
                              ?.message as string) || ""
                          }
                        />
                      </div>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Controller
                      control={control}
                      name={`sessions.${index}.date`}
                      render={({ field: { value, onChange } }) => (
                        <CustomInput
                          type="date"
                          id={`date-${index}`}
                          label={t("workSchedule.date")}
                          placeholder={t("workSchedule.selectDate")}
                          icon={<FaCalendar />}
                          error={
                            (errors.sessions?.[index]?.date
                              ?.message as string) || ""
                          }
                          disabledPreviousDates={true}
                          value={
                            value instanceof Date
                              ? value
                              : value
                              ? new Date(value as unknown as string)
                              : null
                          }
                          onChange={(e) => {
                            const date = e as unknown as Date | null;
                            if (!date) {
                              onChange(date);
                              return;
                            }

                            const sessions = getValues("sessions") || [];
                            const newKey = date.toISOString().split("T")[0];

                            const hasDuplicate = sessions.some((session, i) => {
                              if (i === index || !session?.date) return false;
                              const existing =
                                session.date instanceof Date
                                  ? session.date
                                  : new Date(session.date as unknown as string);
                              return (
                                existing.toISOString().split("T")[0] === newKey
                              );
                            });

                            if (hasDuplicate) {
                              return;
                            }

                            onChange(date);
                          }}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name={`sessions.${index}.time`}
                      render={({ field: { value, onChange } }) => (
                        <CustomInput
                          type="time"
                          id={`time-${index}`}
                          label={t("sessions.time")}
                          placeholder={t("sessions.selectTime")}
                          icon={<FaClock />}
                          error={
                            (errors.sessions?.[index]?.time
                              ?.message as string) || ""
                          }
                          value={timeStringToDate(value)}
                          onChange={(e) => {
                            const date = convetDateToTimeString(
                              e as unknown as Date
                            );
                            onChange(date);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            >
              {t("form.cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
            >
              {t("form.submit") || "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
