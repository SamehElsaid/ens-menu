"use client";

import { useTranslations } from "next-intl";
import CustomInput from "./CustomInput";
import {
  FaBook,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaUserMd,
} from "react-icons/fa";

export interface BookingSearchFiltersState {
  date: Date | null;
  reservationDate: Date | null;
  location: { label: string; value: string } | null;
  parentName: { data: string; name: string };
  patientName?: { data: string; name: string } | null;
  specialistName?: { data: string; name: string } | null;
  type?: { label: string; value: "online" | "offline" | "all" } | null;
}

export interface BookingSearchFiltersProps {
  searchState: BookingSearchFiltersState;
  onSearchChange: (updates: Partial<BookingSearchFiltersState>) => void;
  locationOptions: { label: string; value: string }[];
  userType: "specialist" | "parent";
  type: "online" | "offline" | "all";
}

export default function BookingSearchFilters({
  searchState,
  onSearchChange,
  locationOptions,
  userType,
  type,
}: BookingSearchFiltersProps) {
  const t = useTranslations("");

  return (
    <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t("bookings.search") || "Search"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Search */}
        {type === "all" && (
          <CustomInput
            type="select"
            id="search-type"
            size="small"
            label={t("bookings.searchByType")}
            placeholder={t("bookings.type-booking")}
            icon={<FaBook />}
            value={
              searchState.type || { label: t("bookings.all"), value: "all" }
            }
            options={[
              { label: t("bookings.all"), value: "all" },
              { label: t("bookings.online"), value: "online" },
              { label: t("bookings.offline"), value: "offline" },
            ]}
            onChange={(select) => {
              if (!select) {
                onSearchChange({ type: { label: t("bookings.all"), value: "all" } });
                return;
              }
              const selectValue = select as unknown as {
                label: string;
                value: "online" | "offline" | "all";
              };
              onSearchChange({
                type: {
                  label: selectValue.label,
                  value: selectValue.value,
                },
              });
            }}
          />
        )}
        <CustomInput
          type="date"
          id="search-date"
          size="small"
          label={t("bookings.searchByDate")}
          placeholder={t("bookings.date")}
          icon={<FaCalendarAlt />}
          value={searchState.date}
          onChange={(e) => {
            const date = (e.target as unknown as Date) || null;
            onSearchChange({ date });
          }}
        />

        {/* Reservation Date Search */}
        <CustomInput
          type="date"
          id="search-reservation-date"
          size="small"
          label={t("bookings.searchByReservationDate")}
          placeholder={t("bookings.reservationDate")}
          icon={<FaCalendarAlt />}
          value={searchState.reservationDate}
          onChange={(e) => {
            const date = (e.target as unknown as Date) || null;
            onSearchChange({ reservationDate: date });
          }}
        />

        {/* Location Dropdown */}
        <CustomInput
          type="select"
          id="search-location"
          size="small"
          label={t("bookings.searchByLocation")}
          placeholder={t("bookings.selectLocation")}
          icon={<FaMapMarkerAlt />}
          options={[
            { label: t("bookings.allLocations"), value: "" },
            ...locationOptions,
          ]}
          value={searchState.location}
          onChange={(e) => {
            const value = e.target as unknown as {
              label: string;
              value: string;
            } | null;
            if (value && value.value && value.value !== "") {
              onSearchChange({ location: value });
            } else {
              onSearchChange({ location: null });
            }
          }}
          reset={() => onSearchChange({ location: null })}
        />

        {/* Parent Name Search */}
        {userType === "specialist" ? (
          <CustomInput
            type="text"
            id="search-parent-name"
            size="small"
            label={t("bookings.searchByParentName")}
            placeholder={t("bookings.parentName")}
            icon={<FaUser />}
            value={searchState.parentName.data}
            onChange={(e) => {
              onSearchChange({
                parentName: {
                  data: e.target.value,
                  name: searchState.parentName.name,
                },
              });
            }}
          />
        ) : (
          <CustomInput
            type="text"
            id="search-specialist-name"
            size="small"
            label={t("bookings.searchBySpecialistName")}
            placeholder={t("bookings.specialistName")}
            icon={<FaUserMd />}
            value={searchState.specialistName?.data || ""}
            onChange={(e) => {
              onSearchChange({
                specialistName: {
                  data: e.target.value,
                  name: searchState.specialistName?.name || "",
                },
              });
            }}
          />
        )}

        {/* Patient Name Search */}
        <CustomInput
          type="text"
          id="search-patient-name"
          size="small"
          label={t("bookings.searchByPatientName")}
          placeholder={t("bookings.patientName")}
          icon={<FaUserMd />}
          value={searchState.patientName?.data || ""}
          onChange={(e) => {
            onSearchChange({
              patientName: {
                data: e.target.value,
                name: searchState.patientName?.name || "",
              },
            });
          }}
        />
      </div>
      <div className="flex justify-end gap-2 mt-3!">
        <button className="bg-red-500! text-white px-4 py-2 rounded-md">
          {t("bookings.reset")}
        </button>
        <button className="bg-secondary text-white px-4 py-2 rounded-md">
          {t("bookings.search")}
        </button>
      </div>
    </div>
  );
}
