"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import CardDashBoard from "@/components/Card/CardDashBoard";
import QualificationFormModal from "@/components/Custom/QualificationFormModal";
import CustomInput from "@/components/Custom/CustomInput";
import { FaAward, FaPlus, FaTrash, FaFile, FaSearch } from "react-icons/fa";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";

export type QualificationType = "academic" | "courses";
export type QualificationStatus = "pending" | "active";

export interface Qualification {
  id: string;
  title: string;
  files: File[];
  type: QualificationType;
  status: QualificationStatus;
}

export default function QualificationsPage() {
  const t = useTranslations("");
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [qualificationToDelete, setQualificationToDelete] =
    useState<Qualification | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | QualificationType>("all");

  const handleAddQualification = (qualification: Omit<Qualification, "id">) => {
    const newQualification: Qualification = {
      ...qualification,
      id: Date.now().toString(),
    };
    setQualifications([...qualifications, newQualification]);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (qualification: Qualification) => {
    setQualificationToDelete(qualification);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (qualificationToDelete) {
      setQualifications(
        qualifications.filter((q) => q.id !== qualificationToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setQualificationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setQualificationToDelete(null);
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  // Filter qualifications by title and type
  const filteredQualifications = useMemo(() => {
    let results = qualifications;

    if (searchTerm.trim()) {
      results = results.filter((qualification) =>
        qualification.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      results = results.filter((qualification) => qualification.type === filterType);
    }

    return results;
  }, [qualifications, searchTerm, filterType]);

  return (
    <>
      <CardDashBoard>
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row  gap-2">
          <h1 className="text-2xl font-bold">
            {t("personal.qualifications") || "Qualifications"}
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
          >
            <FaPlus />
            {t("personal.addQualification") || "Add Qualification"}
          </button>
        </div>

        {qualifications.length > 0 && (
          <div className="mb-6 space-y-3">
            <CustomInput
              type="text"
              id="searchQualifications"
              placeholder={
                t("personal.searchQualifications") || "Search by title..."
              }
              icon={<FaSearch />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />

            <div className="flex flex-wrap gap-2">
              {(["all", "academic", "courses"] as const).map((typeKey) => (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => setFilterType(typeKey)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filterType === typeKey
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {typeKey === "all"
                    ? t("personal.qualificationFilterAll") || "All"
                    : typeKey === "academic"
                    ? t("personal.qualificationTypeAcademic") ||
                      "Academic qualification"
                    : t("personal.qualificationTypeCourses") ||
                      "Courses & certificates"}
                </button>
              ))}
            </div>
          </div>
        )}

        {qualifications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FaAward className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {t("personal.noQualifications") || "No qualifications added yet"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("personal.addFirstQualification") ||
                "Click 'Add Qualification' to get started"}
            </p>
          </div>
        ) : filteredQualifications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {t("personal.noQualificationsFound") || "No qualifications found"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("personal.tryDifferentSearch") ||
                "Try a different search term"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQualifications.map((qualification) => (
              <div
                key={qualification.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <FaAward className="text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {qualification.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {qualification.type === "academic"
                          ? t("personal.qualificationTypeAcademic") ||
                            "Academic qualification"
                          : t("personal.qualificationTypeCourses") ||
                            "Courses & certificates"}
                      </p>
                    </div>
                  </div>
                  {qualification.type === "academic" && (
                    <span
                      className={`ml-4 px-3 py-1 text-xs rounded-full font-semibold ${
                        qualification.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {qualification.status === "pending"
                        ? t("personal.qualificationStatusPending") || "Pending"
                        : t("personal.qualificationStatusActive") || "Active"}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteClick(qualification)}
                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title={t("personal.deleteQualification") || "Delete Qualification"}
                  >
                    <FaTrash />
                  </button>
                </div>

                {qualification.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {t("personal.files") || "Files"}:
                    </p>
                    <div className="space-y-2">
                      {qualification.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-primary/5 rounded-md"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FaFile className="text-primary shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {file.name.length > 30
                                ? file.name.substring(0, 30) + "..."
                                : file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewFile(file)}
                            className="ml-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                          >
                            {t("form.viewFile") || "View"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardDashBoard>

      <QualificationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddQualification}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("personal.deleteQualification") || "Delete Qualification"}
        message={
          qualificationToDelete
            ? t("personal.deleteQualificationConfirm", {
                title: qualificationToDelete.title,
              }) ||
              `Are you sure you want to delete the qualification: ${qualificationToDelete.title}?`
            : t("personal.deleteQualificationConfirmMessage") ||
              "Are you sure you want to delete this qualification?"
        }
        confirmText={t("form.confirm") || "Confirm"}
        cancelText={t("form.cancel") || "Cancel"}
      />
    </>
  );
}

