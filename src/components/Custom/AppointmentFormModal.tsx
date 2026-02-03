/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Controller, Resolver, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import {
  FaTimes,
  FaCalendar,
  FaClock,
  FaTrash,
  FaMapMarkerAlt,
} from "react-icons/fa";
import CustomInput from "./CustomInput";
import { Appointment } from "@/app/[locale]/specialist/work-schedule/page";
import { convetDateToTimeString, timeStringToDate } from "@/shared/_shared";

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: Omit<Appointment, "id">) => void;
  appointment?: Appointment | null;
  selectedDate?: Date | null;
  onDelete?: () => void;
  locations?: Array<{ label: string; value: string }>;
}

type AppointmentFormData = {
  date: Date | null;
  startTime: string;
  duration: number;
  maxAppointments?: number;
  availableHours?: string[];
  appointmentType: "single" | "multiple" | "hours";
  location?: { label: string; value: string } | null;
};

const createAppointmentSchema = (t: ReturnType<typeof useTranslations<"">>) => {
  return yup.object().shape({
    date: yup
      .date()
      .required(t("workSchedule.dateRequired"))
      .min(
        new Date(new Date().setHours(0, 0, 0, 0)),
        t("workSchedule.dateFuture")
      ),
    startTime: yup.string().required(t("workSchedule.timeRequired")),
    duration: yup
      .number()
      .required(t("workSchedule.durationRequired"))
      .min(15, t("workSchedule.durationMin"))
      .max(480, t("workSchedule.durationMax")),
    maxAppointments: yup.number().when("appointmentType", {
      is: "multiple",
      then: (schema) =>
        schema
          .required(t("workSchedule.maxAppointmentsRequired"))
          .min(1, t("workSchedule.maxAppointmentsMin")),
      otherwise: (schema) => schema.nullable(),
    }),
    availableHours: yup.array().when("appointmentType", {
      is: "hours",
      then: (schema) =>
        schema
          .required(t("workSchedule.hoursRequired"))
          .min(1, t("workSchedule.hoursMin")),
      otherwise: (schema) => schema.nullable(),
    }),
    appointmentType: yup
      .string()
      .oneOf(["single", "multiple", "hours"])
      .required(),
    location: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .nullable()
      .required(t("workSchedule.locationRequired")),
  });
};

export default function AppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  selectedDate,
  onDelete,
  locations = [],
}: AppointmentFormModalProps) {
  const t = useTranslations("");
  const [availableHoursList, setAvailableHoursList] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentFormData>({
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      duration: 30,
      maxAppointments: undefined,
      availableHours: [],
      appointmentType: "hours",
      location: null,
    },
    resolver: yupResolver(
      createAppointmentSchema(t)
    ) as unknown as Resolver<AppointmentFormData>,
    mode: "onChange",
  });

  const watchedAppointmentType = useWatch({
    control,
    name: "appointmentType",
  });

  const watchedStartTime = useWatch({
    control,
    name: "startTime",
  });
  const watchedDuration = useWatch({
    control,
    name: "duration",
  });

 
 
  // Generate time slots based on duration
  useEffect(() => {
    if (watchedStartTime && watchedDuration) {
      const slots: string[] = [];
      const [startHour, startMinute] = watchedStartTime.split(":").map(Number);
      let currentHour = startHour;
      let currentMinute = startMinute;

      // Generate slots until 20:00 (8 PM)
      while (currentHour < 23 || (currentHour === 23 && currentMinute === 0)) {
        const timeString = `${String(currentHour).padStart(2, "0")}:${String(
          currentMinute
        ).padStart(2, "0")}`;
        slots.push(timeString);

        // Add duration
        currentMinute += watchedDuration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }

      setAvailableHoursList(slots);
    }
  }, [watchedStartTime, watchedDuration]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (appointment) {
        // Edit mode
        const appointmentDate = new Date(appointment.start);
        reset({
          date: appointmentDate,
          startTime: appointmentDate.toTimeString().slice(0, 5),
          duration: appointment.duration,
          maxAppointments: appointment.extendedProps?.maxAppointments,
          availableHours: appointment.extendedProps?.availableHours || [],
          appointmentType: appointment.extendedProps?.maxAppointments
            ? "multiple"
            : appointment.extendedProps?.availableHours
            ? "hours"
            : "single",
          location: appointment.location
            ? locations.find((loc) => loc.label === appointment.location) ||
              null
            : null,
        });
      } else {
        // Add mode - use selectedDate if provided, otherwise use today
        const dateToUse = selectedDate ? new Date(selectedDate) : new Date();
        // Ensure date is at start of day
        dateToUse.setHours(0, 0, 0, 0);

        reset({
          date: dateToUse,
          startTime: "09:00",
          duration: 30,
          maxAppointments: undefined,
          availableHours: [],
          appointmentType: "hours",
          location: null,
        });
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, appointment, selectedDate, reset, locations]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const onFormSubmit = (data: AppointmentFormData) => {
    const appointmentDate = new Date(data.date!);
    const [hours, minutes] = data.startTime.split(":").map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(appointmentDate);
    endDate.setMinutes(endDate.getMinutes() + data.duration);

    const extendedProps: Appointment["extendedProps"] = {};
    if (data.appointmentType === "multiple" && data.maxAppointments) {
      extendedProps.maxAppointments = data.maxAppointments;
    }
    if (data.appointmentType === "hours" && data.availableHours) {
      extendedProps.availableHours = data.availableHours;
    }

    onSubmit({
      start: appointmentDate,
      end: endDate,
      duration: data.duration,
      color: "#3b82f6",
      location: data.location?.label || undefined,
      extendedProps:
        Object.keys(extendedProps).length > 0 ? extendedProps : undefined,
    });
    reset();
  };

  // Duration options (in minutes)
  const durationOptions = [
    { label: "15 دقيقة", value: 15 },
    { label: "30 دقيقة", value: 30 },
    { label: "45 دقيقة", value: 45 },
    { label: "1 ساعة", value: 60 },
    { label: "1.5 ساعة", value: 90 },
    { label: "2 ساعات", value: 120 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm m-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FaCalendar className="text-primary text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {appointment
                  ? t("workSchedule.editAppointment")
                  : t("workSchedule.addAppointment")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <Controller
              control={control}
              name="location"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="select"
                  id="location"
                  label={t("workSchedule.location")}
                  placeholder={t("workSchedule.selectLocation")}
                  icon={<FaMapMarkerAlt />}
                  error={errors.location?.message}
                  value={
                    value
                      ? locations.find((loc) => loc.value === value?.value) ||
                        null
                      : null
                  }
                  onChange={onChange}
                  options={locations}
                  isSearchable={true}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => (
                  <>
                    <CustomInput
                      type="date"
                      id="date"
                      label={t("workSchedule.date")}
                      placeholder={t("workSchedule.selectDate")}
                      icon={<FaCalendar />}
                      error={errors.date?.message}
                      value={value}
                      onChange={(e) => {
                        const date = e as unknown as Date | null;
                        onChange(date);
                      }}
                    />
                  </>
                )}
              />
              <Controller
                control={control}
                name="startTime"
                render={({ field: { value, onChange } }) => (
                  <>
                    {console.log(value)}
                    <CustomInput
                      type="time"
                      id="startTime"
                      label={t("workSchedule.startTime")}
                      placeholder={t("workSchedule.selectTime")}
                      icon={<FaClock />}
                      error={errors.startTime?.message}
                      value={timeStringToDate(value)}
                      onChange={(e) => {
                        const date = convetDateToTimeString(
                          e as unknown as Date
                        );
                        onChange(date);
                      }}
                    />
                  </>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="duration"
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    type="select"
                    id="duration"
                    label={t("workSchedule.duration")}
                    placeholder={t("workSchedule.selectDuration")}
                    icon={<FaClock />}
                    error={errors.duration?.message}
                    value={
                      value
                        ? durationOptions.find((opt) => opt.value === value) ||
                          null
                        : null
                    }
                    onChange={(selected) => {
                      onChange(
                        (
                          selected as unknown as {
                            label: string;
                            value: number;
                          }
                        )?.value || 30
                      );
                    }}
                    options={durationOptions}
                  />
                )}
              />
            </div>

            {watchedAppointmentType === "multiple" && (
              <Controller
                control={control}
                name="maxAppointments"
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    type="text"
                    id="maxAppointments"
                    label={t("workSchedule.maxAppointments")}
                    placeholder={t("workSchedule.maxAppointmentsPlaceholder")}
                    icon={<FaCalendar />}
                    error={errors.maxAppointments?.message}
                    value={value?.toString() || ""}
                    onChange={(e) => {
                      const num = parseInt(e.target.value) || undefined;
                      onChange(num);
                    }}
                  />
                )}
              />
            )}

            {watchedAppointmentType === "hours" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("workSchedule.selectAvailableHours")}
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {availableHoursList.map((hour) => (
                    <Controller
                      key={hour}
                      control={control}
                      name="availableHours"
                      render={({ field: { value = [], onChange } }) => (
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={value.includes(hour)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onChange([...value, hour]);
                              } else {
                                onChange(value.filter((h) => h !== hour));
                              }
                            }}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                          <span className="text-sm">{hour}</span>
                        </label>
                      )}
                    />
                  ))}
                  {availableHoursList.length === 0 && (
                    <span className="text-sm text-gray-500">
                      {t("workSchedule.noAvailableHours")}
                    </span>
                  )}
                </div>
                {errors.availableHours && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.availableHours.message}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
              {appointment && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-red-500 text-white hover:bg-red-600"
                >
                  <FaTrash />
                  {t("workSchedule.delete")}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              >
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
              >
                {t("form.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
