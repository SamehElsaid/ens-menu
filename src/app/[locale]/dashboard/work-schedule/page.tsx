/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  EventChangeArg,
} from "@fullcalendar/core";
import { DateClickArg } from "@fullcalendar/interaction";
import arLocale from "@fullcalendar/core/locales/ar";
import CardDashBoard from "@/components/Card/CardDashBoard";
import AppointmentFormModal from "@/components/Custom/AppointmentFormModal";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import CustomInput from "@/components/Custom/CustomInput";
import { FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import TimeSlotsView from "@/components/Custom/TimeSlotsView";

export interface Appointment {
  id: string;
  title?: string;
  start: Date;
  end: Date;
  duration: number;
  color?: string;
  location?: string;
  extendedProps?: {
    maxAppointments?: number;
    availableHours?: string[];
  };
}

export default function WorkSchedulePage() {
  const t = useTranslations("");
  const locale = useLocale();
  const calendarRef = useRef<FullCalendar>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "timeSlots">(
    "calendar"
  );
  const [locations, setLocations] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<
    string | null
  >(null);

  // Load locations (you can replace this with API call)
  useEffect(() => {
    // For now, we'll use sample locations or fetch from localStorage/API
    // In a real app, you would fetch from API or get from available-in page
    const sampleLocations: Array<{ label: string; value: string }> = [
      { label: "القاهرة، القاهرة، مصر", value: "cairo-egypt" },
      { label: "الإسكندرية، الإسكندرية، مصر", value: "alexandria-egypt" },
      { label: "الجيزة، الجيزة، مصر", value: "giza-egypt" },
    ];

    // Try to get from localStorage (if available-in page stores them)
    try {
      const storedLocations = localStorage.getItem("specialist-locations");
      if (storedLocations) {
        const parsed = JSON.parse(storedLocations);
        const formatted = parsed.map(
          (loc: {
            city: string;
            state: string;
            country: string;
            id: string;
          }) => ({
            label: `${loc.city}, ${loc.state}, ${loc.country}`,
            value: loc.id,
          })
        );
        setLocations(formatted);
      } else {
        setLocations(sampleLocations);
      }
    } catch {
      setLocations(sampleLocations);
    }
  }, []);

  // Handle date selection (dragging on calendar)
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    // Reset time to start of day
    const selectedDateOnly = new Date(selectInfo.start);
    selectedDateOnly.setHours(0, 0, 0, 0);
    setSelectedDate(selectedDateOnly);
    setSelectedAppointment(null);
    setIsModalOpen(true);
    // Unselect the date to prevent selection highlight
    selectInfo.view.calendar.unselect();
  }, []);

  // Handle date click (clicking on a specific date)
  const handleDateClick = useCallback((clickInfo: DateClickArg) => {
    // Reset time to start of day
    const selectedDateOnly = new Date(clickInfo.date);
    selectedDateOnly.setHours(0, 0, 0, 0);
    setSelectedDate(selectedDateOnly);
    setSelectedAppointment(null);
    setIsModalOpen(true);
  }, []);

  // Handle event click (clicking on existing appointment)
  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const appointment = appointments.find(
        (apt) => apt.id === clickInfo.event.id
      );
      if (appointment) {
        setSelectedAppointment(appointment);
        setSelectedDate(null);
        setIsModalOpen(true);
      }
    },
    [appointments]
  );

  // Handle event change (drag and drop)
  const handleEventChange = useCallback((changeInfo: EventChangeArg) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === changeInfo.event.id
          ? {
              ...apt,
              start: changeInfo.event.start || apt.start,
              end: changeInfo.event.end || apt.end,
            }
          : apt
      )
    );
  }, []);

  // Add new appointment
  const handleAddAppointment = (appointmentData: Omit<Appointment, "id">) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
    };
    setAppointments([...appointments, newAppointment]);
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setSelectedDate(null);
  };

  // Update existing appointment
  const handleUpdateAppointment = (
    appointmentData: Omit<Appointment, "id">
  ) => {
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...appointmentData, id: apt.id }
            : apt
        )
      );
      setIsModalOpen(false);
      setSelectedAppointment(null);
      setSelectedDate(null);
    }
  };

  // Delete appointment
  const handleDeleteClick = () => {
    if (selectedAppointment) {
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.filter((apt) => apt.id !== selectedAppointment.id)
      );
      setIsDeleteModalOpen(false);
      setIsModalOpen(false);
      setSelectedAppointment(null);
      setSelectedDate(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  // Filter appointments by location
  const filteredAppointments = selectedLocationFilter
    ? appointments.filter((apt) => apt.location === selectedLocationFilter)
    : appointments;

  // Convert appointments to FullCalendar events
  const events = filteredAppointments.map((apt) => ({
    id: apt.id,
    title: apt.title || t("workSchedule.availableTimes")  ,
    start: apt.start,
    end: apt.end,
    backgroundColor: apt.color || "var(--primary)  !important",
    borderColor: apt.color || "var(--primary)  !important",
    extendedProps: apt.extendedProps,
  }));

  return (
    <>
      <CardDashBoard>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 flex-col md:flex-row  gap-2">
            <div className="min-w-[50%] text-center md:text-start">
              <h1 className="text-2xl font-bold text-gray-900">
                {t("workSchedule.title")}
              </h1>
              <p className="text-gray-500 mt-1">
                {t("workSchedule.description")}
              </p>
            </div>
            <div className="flex items-center gap-3  flex-col lg:flex-row md:items-end">
         

              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setSelectedAppointment(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center  gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
              >
                <FaPlus />
                {t("workSchedule.addAppointment")}
              </button>
            </div>
          </div>
        </div>
        {locations.length > 0 && (
          <div className="max-w-[300px] mb-4">
            <CustomInput
              type="select"
              id="locationFilter"
              size="small"
              placeholder={t("workSchedule.filterByLocation")}
              icon={<FaMapMarkerAlt />}
              value={
                selectedLocationFilter
                  ? locations.find(
                      (loc) => loc.label === selectedLocationFilter
                    ) || null
                  : { label: t("workSchedule.allLocations"), value: "" }
              }
              onChange={(selected) => {
                const location = selected as unknown as {
                  label: string;
                  value: string;
                } | null;
                if (!location || location.value === "") {
                  setSelectedLocationFilter(null);
                } else {
                  setSelectedLocationFilter(location.label);
                }
              }}
              options={[
                { label: t("workSchedule.allLocations"), value: "" },
                ...locations,
              ]}
              isSearchable={true}
            />
          </div>
        )}

        <div className="w-fit mx-auto mb-5">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 text-nowrap py-2 rounded-md font-medium transition-all duration-200 ${
                    viewMode === "calendar"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("workSchedule.calendarView")}
                </button>
                <button
                  onClick={() => setViewMode("timeSlots")}
                  className={`px-4 text-nowrap py-2 rounded-md font-medium transition-all duration-200 ${
                    viewMode === "timeSlots"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("workSchedule.timeSlotsView")}
                </button>
              </div>
        </div>
        {viewMode === "calendar" ? (
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={"dayGridMonth"}
              locale={locale === "ar" ? arLocale : "en"}
              direction={locale === "ar" ? "rtl" : ("ltr" as "ltr" | "rtl")}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventChange={handleEventChange}
              editable={true}
              droppable={true}
              height="auto"
              eventDisplay="block"
              selectConstraint="businessHours"
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
                startTime: "08:00",
                endTime: "20:00",
              }}
            />
          </div>
        ) : (
          <TimeSlotsView
            appointments={filteredAppointments}
            selectedDate={selectedDate || undefined}
            onAppointmentClick={(appointment) => {
              setSelectedAppointment(appointment);
              setSelectedDate(null);
              setIsModalOpen(true);
            }}
            onAppointmentDelete={(appointment) => {
              setSelectedAppointment(appointment);
              setIsDeleteModalOpen(true);
            }}
            columnsPerRow={3}
            maxSlotsPerColumn={6}
          />
        )}
      </CardDashBoard>

      <AppointmentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
          setSelectedDate(null);
        }}
        onSubmit={
          selectedAppointment ? handleUpdateAppointment : handleAddAppointment
        }
        appointment={selectedAppointment}
        selectedDate={selectedDate}
        onDelete={handleDeleteClick}
        locations={locations}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("workSchedule.deleteAppointment")}
        message={
          selectedAppointment
            ? t("workSchedule.deleteAppointmentConfirm", {
                title:
                  selectedAppointment.title || t("workSchedule.appointment"),
              })
            : t("workSchedule.deleteAppointmentMessage")
        }
        confirmText={t("form.confirm")}
        cancelText={t("form.cancel")}
      />
    </>
  );
}
