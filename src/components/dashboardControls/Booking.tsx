"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import BookingSearchFilters, {
  BookingSearchFiltersState,
} from "@/components/Custom/BookingSearchFilters";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";

// Define the booking data type
export interface Booking {
  id: string;
  date: string; // Date when booking was created
  parentName?: string;
  specialistName?: string;
  type?: "online" | "offline" | "all";
  patientName: string;
  patientAge: number;
  reservationDate: string; // Date of the reservation
  reservationTime: string; // Time of the reservation
  location: string;
}

// Action cell renderer component
const ActionCellRenderer = (
  params: ICellRendererParams<Booking> & { t?: (key: string) => string }
) => {
  const handleViewHistory = () => {
    // Handle view patient history action
    console.log("View history for patient:", params.data?.patientName);
    // You can add navigation or modal opening logic here
  };

  const viewHistoryText = params.t
    ? params.t("bookings.viewHistory")
    : "View History";

  return (
    <button
      onClick={handleViewHistory}
      className="flex items-center justify-center  gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
      title={viewHistoryText}
    >
      <FaEye className="text-sm" />
    </button>
  );
};

// Accept/Refuse action cell renderer component
const AcceptRefuseCellRenderer = (
  params: ICellRendererParams<Booking> & {
    t?: (key: string) => string;
    onAccept?: (booking: Booking) => void;
    onRefuse?: (booking: Booking) => void;
  }
) => {
  const booking = params.data;
  if (!booking) return null;

  const handleAccept = () => {
    params.onAccept?.(booking);
  };

  const handleRefuse = () => {
    params.onRefuse?.(booking);
  };

  const acceptText = params.t ? params.t("bookings.accept") : "Accept";
  const refuseText = params.t ? params.t("bookings.refuse") : "Refuse";

  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <button
        onClick={handleAccept}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-all duration-200"
        title={acceptText}
        aria-label={acceptText}
      >
        <FaCheck className="text-sm" />
      </button>
      <button
        onClick={handleRefuse}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-200"
        title={refuseText}
        aria-label={refuseText}
      >
        <FaTimes className="text-sm" />
      </button>
    </div>
  );
};

export default function Booking({
  type = "online",
  userType = "specialist",
}: {
  type?: "online" | "offline" | "all";
  userType?: "specialist" | "parent";
}) {
  const t = useTranslations("");
  const locale = useLocale();

  // Search filters state
  const [searchState, setSearchState] = useState<BookingSearchFiltersState>({
    date: null,
    reservationDate: null,
    location: null,
    parentName: { data: "", name: "parentName" },
    patientName: { data: "", name: "patientName" },
    specialistName: null,
  });

  const handleSearchChange = (updates: Partial<BookingSearchFiltersState>) => {
    setSearchState((prev) => ({ ...prev, ...updates }));
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"accept" | "refuse" | null>(
    null
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Handle accept booking - open modal
  const handleAccept = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setModalAction("accept");
    setIsModalOpen(true);
  }, []);

  // Handle refuse booking - open modal
  const handleRefuse = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setModalAction("refuse");
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalAction(null);
    setSelectedBooking(null);
  }, []);

  // Handle confirm action
  const handleConfirmAction = useCallback(() => {
    if (!selectedBooking) return;

    if (modalAction === "accept") {
      console.log("Accept booking:", selectedBooking.id);
      // Add your accept logic here (API call, etc.)
    } else if (modalAction === "refuse") {
      console.log("Refuse booking:", selectedBooking.id);
      // Add your refuse logic here (API call, etc.)
    }

    handleCloseModal();
  }, [selectedBooking, modalAction, handleCloseModal]);

  // Sample data - replace with actual API call
  const [allRowData] = useState<Booking[]>([
    {
      id: "1",
      date: "2024-01-15",
      parentName: "John Doe",
      patientName: "Jane Doe",
      patientAge: 8,
      reservationDate: "2024-01-20",
      reservationTime: "10:00 AM",
      location: "Main Clinic - Room 101",
      specialistName: "Dr. John Doe",
    },
    {
      id: "2",
      date: "2024-01-16",
      parentName: "Sarah Smith",
      patientName: "Mike Smith",
      patientAge: 12,
      reservationDate: "2024-01-22",
      reservationTime: "2:30 PM",
      location: "Branch Office - Room 205",
      specialistName: "Dr. John Doe",
    },
    {
      id: "3",
      date: "2024-01-17",
      parentName: "Ahmed Ali",
      patientName: "Fatima Ali",
      patientAge: 5,
      reservationDate: "2024-01-25",
      reservationTime: "11:15 AM",
      location: "Main Clinic - Room 102",
      specialistName: "Dr. John Doe",
    },
    {
      id: "4",
      date: "2024-01-18",
      parentName: "Maria Garcia",
      patientName: "Carlos Garcia",
      patientAge: 10,
      reservationDate: "2024-01-26",
      reservationTime: "9:00 AM",
      location: "Main Clinic - Room 103",
      specialistName: "Dr. John Doe",
    },
    {
      id: "5",
      date: "2024-01-18",
      parentName: "David Johnson",
      patientName: "Emily Johnson",
      patientAge: 7,
      reservationDate: "2024-01-27",
      reservationTime: "3:00 PM",
      location: "Branch Office - Room 206",
      specialistName: "Dr. John Doe",
    },
    {
      id: "6",
      date: "2024-01-19",
      parentName: "Lisa Brown",
      patientName: "James Brown",
      patientAge: 14,
      reservationDate: "2024-01-28",
      reservationTime: "10:30 AM",
      location: "Main Clinic - Room 104",
      specialistName: "Dr. John Doe",
    },
    {
      id: "7",
      date: "2024-01-19",
      parentName: "Mohammed Hassan",
      patientName: "Amina Hassan",
      patientAge: 6,
      reservationDate: "2024-01-29",
      reservationTime: "1:00 PM",
      location: "Main Clinic - Room 105",
      specialistName: "Dr. John Doe",
    },
    {
      id: "8",
      date: "2024-01-20",
      parentName: "Jennifer Wilson",
      patientName: "Olivia Wilson",
      patientAge: 9,
      reservationDate: "2024-01-30",
      reservationTime: "11:00 AM",
      location: "Branch Office - Room 207",
      specialistName: "Dr. John Doe",
    },
    {
      id: "9",
      date: "2024-01-20",
      parentName: "Robert Taylor",
      patientName: "Noah Taylor",
      patientAge: 11,
      reservationDate: "2024-02-01",
      reservationTime: "2:00 PM",
      location: "Main Clinic - Room 106",
      specialistName: "Dr. John Doe",
    },
    {
      id: "10",
      date: "2024-01-21",
      parentName: "Emma Martinez",
      patientName: "Sophia Martinez",
      patientAge: 4,
      reservationDate: "2024-02-02",
      reservationTime: "9:30 AM",
      location: "Main Clinic - Room 107",
      specialistName: "Dr. John Doe",
    },
    {
      id: "11",
      date: "2024-01-21",
      parentName: "Michael Anderson",
      patientName: "Lucas Anderson",
      patientAge: 13,
      reservationDate: "2024-02-03",
      reservationTime: "4:00 PM",
      location: "Branch Office - Room 208",
      specialistName: "Dr. John Doe",
    },
    {
      id: "12",
      date: "2024-01-22",
      parentName: "Patricia Thomas",
      patientName: "Isabella Thomas",
      patientAge: 8,
      reservationDate: "2024-02-04",
      reservationTime: "10:45 AM",
      location: "Main Clinic - Room 108",
      specialistName: "Dr. John Doe",
    },
    {
      id: "13",
      date: "2024-01-22",
      parentName: "Christopher Lee",
      patientName: "Mason Lee",
      patientAge: 6,
      reservationDate: "2024-02-05",
      reservationTime: "1:30 PM",
      location: "Main Clinic - Room 109",
      specialistName: "Dr. John Doe",
    },
    {
      id: "14",
      date: "2024-01-23",
      parentName: "Amanda White",
      patientName: "Ella White",
      patientAge: 10,
      reservationDate: "2024-02-06",
      reservationTime: "3:15 PM",
      location: "Branch Office - Room 209",
      specialistName: "Dr. John Doe",
    },
    {
      id: "15",
      date: "2024-01-23",
      parentName: "Daniel Harris",
      patientName: "Ethan Harris",
      patientAge: 12,
      reservationDate: "2024-02-07",
      reservationTime: "11:30 AM",
      location: "Main Clinic - Room 110",
      specialistName: "Dr. John Doe",
    },
    {
      id: "16",
      date: "2024-01-24",
      parentName: "Michelle Clark",
      patientName: "Ava Clark",
      patientAge: 5,
      reservationDate: "2024-02-08",
      reservationTime: "9:15 AM",
      location: "Main Clinic - Room 111",
      specialistName: "Dr. John Doe",
    },
    {
      id: "17",
      date: "2024-01-24",
      parentName: "Matthew Lewis",
      patientName: "Logan Lewis",
      patientAge: 9,
      reservationDate: "2024-02-09",
      reservationTime: "2:45 PM",
      location: "Branch Office - Room 210",
      specialistName: "Dr. John Doe",
    },
    {
      id: "18",
      date: "2024-01-25",
      parentName: "Laura Walker",
      patientName: "Mia Walker",
      patientAge: 7,
      reservationDate: "2024-02-10",
      reservationTime: "10:00 AM",
      location: "Main Clinic - Room 112",
      specialistName: "Dr. John Doe",
    },
    {
      id: "19",
      date: "2024-01-25",
      parentName: "Kevin Hall",
      patientName: "Alexander Hall",
      patientAge: 11,
      reservationDate: "2024-02-11",
      reservationTime: "4:30 PM",
      location: "Main Clinic - Room 113",
      specialistName: "Dr. John Doe",
    },
    {
      id: "20",
      date: "2024-01-26",
      parentName: "Nicole Allen",
      patientName: "Charlotte Allen",
      patientAge: 8,
      reservationDate: "2024-02-12",
      reservationTime: "12:00 PM",
      location: "Branch Office - Room 211",
      specialistName: "Dr. John Doe",
    },
    {
      id: "21",
      date: "2024-01-26",
      parentName: "Brian Young",
      patientName: "Benjamin Young",
      patientAge: 6,
      reservationDate: "2024-02-13",
      reservationTime: "1:45 PM",
      location: "Main Clinic - Room 114",
      specialistName: "Dr. John Doe",
    },
    {
      id: "22",
      date: "2024-01-27",
      parentName: "Stephanie King",
      patientName: "Harper King",
      patientAge: 10,
      reservationDate: "2024-02-14",
      reservationTime: "9:45 AM",
      location: "Main Clinic - Room 115",
    },
    {
      id: "23",
      date: "2024-01-27",
      parentName: "Jason Wright",
      patientName: "William Wright",
      patientAge: 13,
      reservationDate: "2024-02-15",
      reservationTime: "3:30 PM",
      location: "Branch Office - Room 212",
      specialistName: "Dr. John Doe",
    },
    {
      id: "24",
      date: "2024-01-28",
      parentName:
        "Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez Rebecca Lopez ",
      patientName: "Grace Lopez",
      patientAge: 7,
      reservationDate: "2024-02-16",
      reservationTime: "11:15 AM",
      specialistName: "Dr. John Doe",
      location: "Main Clinic - Room 116",
    },
    {
      id: "25",
      date: "2024-01-28",
      parentName: "Eric Hill",
      patientName: "Daniel Hill",
      specialistName: "Dr. John Doe",
      patientAge: 9,
      reservationDate: "2024-02-17",
      reservationTime: "2:15 PM",
      location: "Main Clinic - Room 117",
    },
  ]);

  // Extract unique locations for dropdown
  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(
      new Set(allRowData.map((booking) => booking.location))
    );
    return uniqueLocations.map((location) => ({
      label: location,
      value: location,
    }));
  }, [allRowData]);

  // Filter row data based on search criteria
  const rowData = useMemo(() => {
    return allRowData.filter((booking) => {
      // Filter by date
      if (searchState.date) {
        const bookingDate = new Date(booking.date);
        const searchDateOnly = new Date(searchState.date);
        searchDateOnly.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate.getTime() !== searchDateOnly.getTime()) {
          return false;
        }
      }

      // Filter by reservation date
      if (searchState.reservationDate) {
        const reservationDate = new Date(booking.reservationDate);
        const searchReservationDateOnly = new Date(searchState.reservationDate);
        searchReservationDateOnly.setHours(0, 0, 0, 0);
        reservationDate.setHours(0, 0, 0, 0);
        if (reservationDate.getTime() !== searchReservationDateOnly.getTime()) {
          return false;
        }
      }

      // Filter by location
      if (
        searchState.location &&
        searchState.location.value &&
        booking.location !== searchState.location.value
      ) {
        return false;
      }

      // Filter by parent name
      if (
        searchState.parentName.data.trim() &&
        booking.parentName &&
        !booking
          .parentName!.toLowerCase()
          .toLowerCase()
          .includes(searchState.parentName.data.toLowerCase())
      ) {
        return false;
      }

      // Filter by patient name
      if (
        searchState.patientName?.data.trim() &&
        !booking.patientName
          .toLowerCase()
          .includes(searchState.patientName?.data.toLowerCase() || "")
      ) {
        return false;
      }

      return true;
    });
  }, [allRowData, searchState]);

  // Column definitions
  const columnDefs: ColDef<Booking>[] = useMemo(() => {
    const baseColumns: ColDef<Booking>[] = [
      {
        headerName: t("bookings.actions") || "Actions",
        cellRenderer: (params: ICellRendererParams<Booking>) => (
          <AcceptRefuseCellRenderer
            {...params}
            t={t}
            onAccept={handleAccept}
            onRefuse={handleRefuse}
          />
        ),
        sortable: false,
        filter: false,
        width: 120,
      },
      {
        headerName: t("bookings.date"),
        field: "date",
        sortable: true,
        width: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return new Date(params.value).toLocaleDateString(
            locale === "ar" ? "ar-SA" : "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );
        },
      },
      {
        headerName: t("bookings.parentName"),
        field: "parentName",
        width: 150,
      },
      {
        headerName: t("bookings.patientName"),
        field: "patientName",
        width: 150,
      },
      {
        headerName: t("bookings.patientAge"),
        field: "patientAge",
        width: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return locale === "ar"
            ? `${params.value} ${params.value === 1 ? "سنة" : "سنوات"}`
            : `${params.value} ${params.value === 1 ? "year" : "years"}`;
        },
      },
      {
        headerName: t("bookings.reservationDate"),
        field: "reservationDate",
        width: 150,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return new Date(params.value).toLocaleDateString(
            locale === "ar" ? "ar-SA" : "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );
        },
      },
      {
        headerName: t("bookings.reservationTime"),
        field: "reservationTime",
        width: 150,
      },
      {
        headerName: t("bookings.location"),
        field: "location",
        flex: 1,
        minWidth: 200,
      },
      {
        headerName: t("bookings.viewHistory"),
        cellRenderer: (params: ICellRendererParams<Booking>) => (
          <ActionCellRenderer {...params} t={t} />
        ),
        width: 200,
      },
    ];

    const columns: ColDef<Booking>[] = [...baseColumns];

    if (type === "all") {
      columns.splice(2, 0, {
        headerName: t("bookings.type-booking"),
        field: "type",
        width: 150,
        cellRenderer: (params: ICellRendererParams<Booking>) => {
          return (
            <div className="flex items-center rounded-lg p-1 bg-primary/10 text-primary justify-center gap-2">
              <span className="text-sm font-medium">
                {t("bookings.online")}
              </span>
            </div>
          );
        },
      });
    }
    if (userType === "parent") {
      columns.splice(type === "all" ? 3 : 2, 0, {
        headerName: t("bookings.specialistName"),
        field: "specialistName",
        width: 150,
      });
    }
    return columns;
  }, [t, locale, handleAccept, handleRefuse, type, userType]);

  console.log(userType);
  return (
    <CardDashBoard>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t(`bookings.${type}`) || "Online Bookings"}
        </h1>
        <p className="text-gray-500 mt-1">
          Manage and view all your online reservations
        </p>
      </div>

      {/* Search Filters */}
      <BookingSearchFilters
        userType={userType}
        type={type}
        searchState={searchState}
        onSearchChange={handleSearchChange}
        locationOptions={locationOptions}
      />

      <DataTable<Booking>
        rowData={rowData}
        columnDefs={columnDefs}
        height="auto"
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        rowSelection="multiple"
        showRowNumbers={true}
        locale={locale}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={
          modalAction === "accept"
            ? t("bookings.acceptBooking") || "Accept Booking"
            : t("bookings.refuseBooking") || "Refuse Booking"
        }
        message={
          selectedBooking
            ? modalAction === "accept"
              ? t("bookings.acceptBookingMessage", {
                  patientName: selectedBooking.patientName,
                  parentName: selectedBooking.parentName || "",
                  reservationDate: new Date(
                    selectedBooking.reservationDate
                  ).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                  reservationTime: selectedBooking.reservationTime,
                }) ||
                `Are you sure you want to accept the booking for ${
                  selectedBooking.patientName
                } (${selectedBooking.parentName}) on ${new Date(
                  selectedBooking.reservationDate
                ).toLocaleDateString()} at ${selectedBooking.reservationTime}?`
              : t("bookings.refuseBookingMessage", {
                  patientName: selectedBooking.patientName,
                  parentName: selectedBooking.parentName || "",
                  reservationDate: new Date(
                    selectedBooking.reservationDate
                  ).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                  reservationTime: selectedBooking.reservationTime,
                }) ||
                `Are you sure you want to refuse the booking for ${
                  selectedBooking.patientName
                } (${selectedBooking.parentName}) on ${new Date(
                  selectedBooking.reservationDate
                ).toLocaleDateString()} at ${selectedBooking.reservationTime}?`
            : ""
        }
        confirmText={
          modalAction === "accept"
            ? t("bookings.accept") || "Accept"
            : t("bookings.refuse") || "Refuse"
        }
        cancelText={t("form.cancel") || "Cancel"}
      />
    </CardDashBoard>
  );
}
