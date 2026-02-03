"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { FaTrash } from "react-icons/fa";
import type { Appointment } from "@/app/[locale]/specialist/work-schedule/page";

interface TimeSlotsViewProps {
  appointments: Appointment[];
  selectedDate?: Date;
  onAppointmentClick?: (appointment: Appointment) => void;
  onAppointmentDelete?: (appointment: Appointment) => void;
  columnsPerRow?: number;
  maxSlotsPerColumn?: number;
}

export default function TimeSlotsView({
  appointments,
  selectedDate,
  onAppointmentClick,
  onAppointmentDelete,
}: TimeSlotsViewProps) {
  const t = useTranslations("");
  const locale = useLocale();

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};

    appointments.forEach((apt) => {
      const dateKey = apt.start.toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });

    // Sort appointments by start time for each date
    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => a.start.getTime() - b.start.getTime());
    });

    return grouped;
  }, [appointments]);

  // Get appointments for selected date or all dates
  const displayData = useMemo(() => {
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split("T")[0];
      const apts = appointmentsByDate[dateKey] || [];
      return [{ date: selectedDate, appointments: apts }];
    }

    // Group by date
    return Object.keys(appointmentsByDate)
      .sort()
      .map((dateKey) => ({
        date: new Date(dateKey),
        appointments: appointmentsByDate[dateKey],
      }));
  }, [appointmentsByDate, selectedDate]);

  if (displayData.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-gray-500 text-lg">
          {t("workSchedule.noAppointments")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayData.map(({ date, appointments: dateAppointments }) => {
        console.log("dateAppointments", dateAppointments, displayData);

        const columns = dateAppointments;
        const location = dateAppointments?.[0]?.location || "";
        const dateStr = date.toLocaleDateString(
          locale === "ar" ? "ar-SA" : "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

        return (
          <div
            key={date.toISOString()}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 ">
                {dateStr}
              </h3>
              {onAppointmentDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentDelete(dateAppointments[0]);
                  }}
                  className="group-hover:opacity-100 transition-opacity p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title={t("workSchedule.delete")}
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
            <p className="text-center text-gray-500 text-sm mb-4">{location}</p>
            <div className="flex justify-center gap-2">
              {columns.map((columnAppointments, colIndex) => {
                return (
                  <div
                    key={colIndex}
                    className="border border-gray-200 rounded-lg overflow-hidden w-[200px]"
                  >
                    {/* Column Header */}
                    <div className="bg-primary text-white px-2 py-2 font-medium text-sm text-center">
                      {t("workSchedule.availableTimes")}
                    </div>

                    {/* Appointments */}

                    <div className="bg-white flex flex-col">
                      {columnAppointments.extendedProps?.availableHours
                        ?.sort((a, b) => a.localeCompare(b))
                        .map((appointment: string, index: number) => (
                          <div
                            key={index}
                            className="group relative border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <button
                              onClick={() => onAppointmentClick?.(columnAppointments)}
                              className="w-full px-2 py-2 text-right flex items-center justify-between"
                            >
                              <span className="text-gray-900 font-medium w-fit text-center mx-auto">
                                {appointment}
                              </span>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
