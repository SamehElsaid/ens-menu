"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import CardDashBoard from "@/components/Card/CardDashBoard";
import CustomInput from "@/components/Custom/CustomInput";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import ApplicationFormModal, {
  ApplicationFormValues,
} from "@/components/Custom/ApplicationFormModal";
import DataTable from "@/components/Custom/DataTable";
import {
  FaPlus,
  FaPen,
  FaTrash,
  FaSearch,
  FaGraduationCap,
  FaEye,
} from "react-icons/fa";
import Link from "next/link";

type Application = {
  id: string;
  name: string;
  speciality: string;
};

type SpecialityOption = {
  label: string;
  value: string;
};

function ApplicationPage() {
  const t = useTranslations("");
  const locale = useLocale();

  const [applications, setApplications] = useState<Application[]>([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [specialityFilter, setSpecialityFilter] =
    useState<SpecialityOption | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] =
    useState<Application | null>(null);

  function openCreateForm() {
    setIsFormOpen(true);
    setEditingApplication(null);
  }

  function openEditForm(app: Application) {
    setEditingApplication(app);
    setIsFormOpen(true);
  }

  const specialityOptions: SpecialityOption[] = useMemo(
    () => [
      {
        label:
          t("homePage.featuredSection.categories.pediatricSurgery") ||
          "Pediatric surgery",
        value: "pediatricSurgery",
      },
      {
        label:
          t("homePage.featuredSection.categories.psychiatric") || "Psychiatric",
        value: "psychiatric",
      },
      {
        label:
          t("homePage.featuredSection.categories.nutrition") ||
          "Weight loss and nutrition",
        value: "nutrition",
      },
    ],
    [t]
  );

  const columnDefs: ColDef<Application>[] = useMemo(
    () => [
      {
        headerName: t("application.view") || "View",
        sortable: false,
        filter: false,
        width: 80,
        cellRenderer: (params: ICellRendererParams<Application>) => {
          const app = params.data as Application;

          return (
            <div className="flex items-center justify-center">
              <Link
                href={`/specialist/application/${app.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={t("application.view") || "View"}
              >
                <FaEye className="text-xs" />
              </Link>
            </div>
          );
        },
      },
      {
        headerName: t("personal.applicationName") || "Application Name",
        field: "name",
        flex: 1,
        minWidth: 200,
      },
      {
        headerName: t("auth.speciality") || "Speciality",
        field: "speciality",
        flex: 1,
        minWidth: 200,
      },

      {
        headerName: t("bookings.action") || "Action",
        sortable: false,
        filter: false,
        width: 200,
        cellRenderer: (params: ICellRendererParams<Application>) => {
          const app = params.data as Application;

          return (
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => openEditForm(app)}
                  className="group flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  aria-label={t("common.edit") || "Edit"}
                >
                  <FaPen className="text-[10px] opacity-80 group-hover:opacity-100" />
                  <span className="hidden sm:inline">
                    {t("common.edit") || "Edit"}
                  </span>
                </button>

                <div className="h-5 w-px bg-slate-200" />

                <button
                  type="button"
                  onClick={() => handleDeleteClick(app)}
                  className="group flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  aria-label={t("common.delete") || "Delete"}
                >
                  <FaTrash className="text-[10px] opacity-80 group-hover:opacity-100" />
                  <span className="hidden sm:inline">
                    {t("common.delete") || "Delete"}
                  </span>
                </button>
              </div>
            </div>
          );
        },
      },
    ],
    [t]
  );

  const filteredApplications = applications.filter((app) => {
    let ok = true;

    if (titleFilter.trim()) {
      const term = titleFilter.toLowerCase();
      ok =
        ok &&
        app.name
          .toLowerCase()
          .normalize("NFKD")
          .includes(term.normalize("NFKD"));
    }

    if (specialityFilter && specialityFilter.label) {
      ok = ok && app.speciality === specialityFilter.label;
    }

    return ok;
  });

  const handleFormSubmit = (values: ApplicationFormValues) => {
    if (editingApplication) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === editingApplication.id
            ? {
                ...editingApplication,
                name: values.name,
                speciality: values.speciality,
              }
            : app
        )
      );
    } else {
      const newApplication: Application = {
        id: Date.now().toString(),
        name: values.name,
        speciality: values.speciality,
      };
      setApplications((prev) => [...prev, newApplication]);
    }

    setIsFormOpen(false);
    setEditingApplication(null);
  };

  const handleDeleteClick = (app: Application) => {
    setApplicationToDelete(app);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (applicationToDelete) {
      setApplications((prev) =>
        prev.filter((a) => a.id !== applicationToDelete.id)
      );
      setApplicationToDelete(null);
    }
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setApplicationToDelete(null);
  };

  return (
    <>
      <CardDashBoard>
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-2">
          <h1 className="text-2xl font-bold">
            {t("personal.applications") || "Applications"}
          </h1>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
          >
            <FaPlus />
            {t("personal.addApplication") || "Add Application"}
          </button>
        </div>

        {applications.length > 0 && (
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <CustomInput
              type="text"
              id="searchApplicationTitle"
              label={
                t("personal.applicationNamePlaceholder") || "Application name"
              }
              placeholder={
                t("personal.searchApplications") ||
                "Search by name or speciality..."
              }
              icon={<FaSearch />}
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              size="small"
            />

            <CustomInput
              id="filterApplicationSpeciality"
              type="select"
              icon={<FaGraduationCap />}
              label={t("auth.speciality") || "Speciality"}
              placeholder={t("auth.selectSpeciality") || "Select speciality"}
              value={specialityFilter as unknown}
              onChange={(option: unknown) =>
                setSpecialityFilter(option as SpecialityOption | null)
              }
              options={specialityOptions}
              size="small"
            />
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 text-lg">
              {t("personal.noApplications") || "No applications added yet"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("personal.addFirstApplication") ||
                "Click 'Add Application' to create your first application"}
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 text-lg">
              {t("personal.noApplicationsFound") || "No applications found"}
            </p>
          </div>
        ) : (
          <DataTable<Application>
            rowData={filteredApplications}
            columnDefs={columnDefs}
            height="auto"
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowSelection="multiple"
            showRowNumbers={true}
            locale={locale}
          />
        )}

        <ApplicationFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingApplication(null);
          }}
          onSubmit={handleFormSubmit}
          initialValues={
            editingApplication
              ? {
                  name: editingApplication.name,
                  speciality: editingApplication.speciality,
                }
              : null
          }
          isEdit={Boolean(editingApplication)}
        />
      </CardDashBoard>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("personal.deleteApplication") || "Delete Application"}
        message={
          applicationToDelete
            ? t("personal.deleteApplicationConfirm", {
                name: applicationToDelete.name,
              }) ||
              `Are you sure you want to delete the application: ${applicationToDelete.name}?`
            : t("personal.deleteApplicationConfirmMessage") ||
              "Are you sure you want to delete this application?"
        }
        confirmText={t("form.confirm") || "Confirm"}
        cancelText={t("form.cancel") || "Cancel"}
      />
    </>
  );
}

export default ApplicationPage;
