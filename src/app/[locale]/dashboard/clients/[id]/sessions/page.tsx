"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import SessionFormModal, {
  SessionFormValues,
} from "@/components/Custom/SessionFormModal";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import { FaEye, FaPlus, FaEdit, FaTrashAlt, FaCheck, FaClock, FaTimes } from "react-icons/fa";
import Link from "next/link";

// Define the session data type
export interface Session {
  id: string;
  sectionName: string;
  date: string;
  time: string;
  status?: "attended" | "pending" | "canceled"; // Session status
}

interface SessionsPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionsPage({ params }: SessionsPageProps) {
  const locale = useLocale();
  const t = useTranslations("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  console.log(clientId);

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setClientId(resolvedParams.id);
    });
  }, [params]);

  // Sample data - replace with actual API call
  const [rowData, setRowData] = useState<Session[]>([
    {
      id: "1",
      sectionName: "Initial Assessment",
      date: "2024-01-15",
      time: "10:00",
      status: "attended",
    },
    {
      id: "2",
      sectionName: "Therapy Session 1",
      date: "2024-01-20",
      time: "14:30",
      status: "attended",
    },
    {
      id: "3",
      sectionName: "Follow-up Session",
      date: "2024-01-25",
      time: "11:00",
      status: "pending",
    },
    {
      id: "4",
      sectionName: "Progress Review",
      date: "2024-02-01",
      time: "15:00",
      status: "attended",
    },
  ]);

  const handleAddSession = (values: SessionFormValues) => {
    const now = Date.now();
    const newSessions: Session[] = (values.sessions || []).map(
      (session, index) => ({
        id: `${now}-${index}`,
        sectionName: session.sectionName,
        date: session.date,
        time: session.time,
        status: "pending",
      })
    );

    if (!newSessions.length) {
      setIsModalOpen(false);
      return;
    }

    setRowData((prev) => [...prev, ...newSessions]);
    setIsModalOpen(false);
  };

  const handleUpdateSession = (values: SessionFormValues) => {
    if (editingSession) {
      const updated = values.sessions?.[0];
      if (!updated) {
        setIsEditModalOpen(false);
        setEditingSession(null);
        return;
      }

      setRowData((prev) =>
        prev.map((session) =>
          session.id === editingSession.id
            ? {
                ...session,
                sectionName: updated.sectionName,
                date: updated.date,
                time: updated.time,
              }
            : session
        )
      );
      setIsEditModalOpen(false);
      setEditingSession(null);
    }
  };

  // Handle status change
  const handleStatusChange = useCallback(
    (sessionId: string, newStatus: "attended" | "pending" | "canceled") => {
      setRowData((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, status: newStatus } : session
        )
      );
    },
    []
  );

  // Handle edit
  const handleEdit = useCallback((sessionId: string) => {
    const session = rowData.find((s) => s.id === sessionId);
    if (session) {
      setEditingSession(session);
      setIsEditModalOpen(true);
    }
  }, [rowData]);

  // Handle delete - open confirmation modal
  const handleDelete = useCallback((sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeleteModalOpen(true);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (sessionToDelete) {
      setRowData((prev) =>
        prev.filter((session) => session.id !== sessionToDelete)
      );
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  }, [sessionToDelete]);

  // Column definitions
  const columnDefs: ColDef<Session>[] = useMemo(
    () => [
      {
        headerName: "View",
        sortable: false,
        filter: false,
        width: 80,
        cellRenderer: (params: ICellRendererParams<Session>) => {
          const client = params.data as Session;

          return (
            <div className="flex items-center justify-center">
              <Link
                href={`/specialist/clients/${clientId}/sessions/${client.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={"View"}
              >
                <FaEye className="text-xs" />
              </Link>
            </div>
          );
        },
      },
      {
        headerName: "Section Name",
        field: "sectionName",
        sortable: true,
        flex: 1,
        minWidth: 200,
      },
      {
        headerName: "Date",
        field: "date",
        sortable: true,
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
        headerName: "Time",
        field: "time",
        sortable: true,
        width: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          // Format time (e.g., "10:00" -> "10:00 AM")
          const [hours, minutes] = params.value.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minutes} ${ampm}`;
        },
      },
      {
        headerName: t("sessions.status") || "Status",
        field: "status",
        sortable: true,
        width: 340,
        cellRenderer: (params: ICellRendererParams<Session>) => {
          const session = params.data as Session;
          if (!session) return null;

          const currentStatus = session.status || "pending";

          return (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => handleStatusChange(session.id, "attended")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                    currentStatus === "attended"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label={t("sessions.statusAttended") || "Attended"}
                  title={t("sessions.statusAttended") || "Attended"}
                >
                  <FaCheck className={`text-sm ${currentStatus === "attended" ? "text-green-600" : "text-gray-500"}`} />
                  <span>{t("sessions.statusAttended") || "تم الحضور"}</span>
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <button
                  onClick={() => handleStatusChange(session.id, "pending")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                    currentStatus === "pending"
                      ? "bg-yellow-50 text-yellow-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label={t("sessions.statusPending") || "Pending"}
                  title={t("sessions.statusPending") || "Pending"}
                >
                  <FaClock className={`text-sm ${currentStatus === "pending" ? "text-yellow-600" : "text-gray-500"}`} />
                  <span>{t("sessions.statusPending") || "قيد الانتظار"}</span>
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <button
                  onClick={() => handleStatusChange(session.id, "canceled")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                    currentStatus === "canceled"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label={t("sessions.statusCanceled") || "Canceled"}
                  title={t("sessions.statusCanceled") || "Canceled"}
                >
                  <FaTimes className={`text-sm ${currentStatus === "canceled" ? "text-red-600" : "text-gray-500"}`} />
                  <span>{t("sessions.statusCanceled") || "ملغاة"}</span>
                </button>
              </div>
            </div>
          );
        },
      },
      {
        headerName: t("sessions.actions") || "Actions",
        sortable: false,
        filter: false,
        width: 200,
        cellRenderer: (params: ICellRendererParams<Session>) => {
          const session = params.data as Session;
          if (!session) return null;

          return (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => handleEdit(session.id)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-gray-50 transition-colors"
                  aria-label={t("sessions.edit") || "Edit"}
                  title={t("sessions.edit") || "Edit"}
                >
                  <FaEdit className="text-gray-600 text-sm" />
                  <span>{t("sessions.edit") || "Edit"}</span>
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-gray-50 transition-colors"
                  aria-label={t("sessions.delete") || "Delete"}
                  title={t("sessions.delete") || "Delete"}
                >
                  <FaTrashAlt className="text-sm" />
                  <span>{t("sessions.delete") || "Delete"}</span>
                </button>
              </div>
            </div>
          );
        },
      },
    ],
    [locale, clientId, t, handleStatusChange, handleEdit, handleDelete]
  );

  return (
    <div className="relative ">
      <CardDashBoard className="relative overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
            <p className="text-gray-500 mt-1">
              Manage and view all client sessions
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
          >
            <FaPlus className="text-sm" />
            <span>Add Session</span>
          </button>
        </div>

        <DataTable<Session>
          rowData={rowData}
          columnDefs={columnDefs}
          height="auto"
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          rowSelection={false}
          showRowNumbers={true}
          locale={locale}
        />
      </CardDashBoard>

      <SessionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSession}
      />

      <SessionFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSession(null);
        }}
        onSubmit={handleUpdateSession}
        initialValues={
          editingSession
            ? {
                sessions: [
                  {
                    sectionName: editingSession.sectionName,
                    date: editingSession.date,
                    time: editingSession.time,
                  },
                ],
              }
            : null
        }
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSessionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t("sessions.delete") || "Delete Session"}
        message={
          sessionToDelete
            ? t("sessions.confirmDelete") ||
              "Are you sure you want to delete this session?"
            : t("sessions.confirmDelete") ||
              "Are you sure you want to delete this session?"
        }
        confirmText={t("form.confirm") || "Confirm"}
        cancelText={t("form.cancel") || "Cancel"}
      />
    </div>
  );
}
