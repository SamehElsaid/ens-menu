"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import CardDashBoard from "@/components/Card/CardDashBoard";
import WorkedAtFormModal from "@/components/Custom/WorkedAtFormModal";
import CustomInput from "@/components/Custom/CustomInput";
import { FaBriefcase, FaPlus, FaTrash, FaCalendar, FaBuilding, FaSearch } from "react-icons/fa";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";

export interface WorkedAt {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  center: string;
}

export default function WorkedAtPage() {
  const t = useTranslations("");
  const [workedAtList, setWorkedAtList] = useState<WorkedAt[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workedAtToDelete, setWorkedAtToDelete] = useState<WorkedAt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddWorkedAt = (workedAt: Omit<WorkedAt, "id">) => {
    const newWorkedAt: WorkedAt = {
      ...workedAt,
      id: Date.now().toString(),
    };
    setWorkedAtList([...workedAtList, newWorkedAt]);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (workedAt: WorkedAt) => {
    setWorkedAtToDelete(workedAt);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (workedAtToDelete) {
      setWorkedAtList(
        workedAtList.filter((w) => w.id !== workedAtToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setWorkedAtToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setWorkedAtToDelete(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter worked at by title or center
  const filteredWorkedAt = useMemo(() => {
    if (!searchTerm.trim()) {
      return workedAtList;
    }
    const searchLower = searchTerm.toLowerCase();
    return workedAtList.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.center.toLowerCase().includes(searchLower)
    );
  }, [workedAtList, searchTerm]);

  return (
    <>
      <CardDashBoard>
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row  gap-2">
          <h1 className="text-2xl font-bold">
            {t("personal.workedAt") || "Worked At"}
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
          >
            <FaPlus />
            {t("personal.addWorkedAt") || "Add Work Experience"}
          </button>
        </div>

        {workedAtList.length > 0 && (
          <div className="mb-6">
            <CustomInput
              type="text"
              id="searchWorkedAt"
              placeholder={
                t("personal.searchWorkedAt") || "Search by title or center..."
              }
              icon={<FaSearch />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </div>
        )}

        {workedAtList.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FaBriefcase className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {t("personal.noWorkedAt") || "No work experience added yet"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("personal.addFirstWorkedAt") ||
                "Click 'Add Work Experience' to get started"}
            </p>
          </div>
        ) : filteredWorkedAt.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {t("personal.noWorkedAtFound") || "No work experience found"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("personal.tryDifferentSearch") ||
                "Try a different search term"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkedAt.map((workedAt) => (
              <div
                key={workedAt.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FaBriefcase className="text-primary" />
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {workedAt.title}
                      </h3>
                      {workedAt.isCurrent && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {t("personal.current") || "Current"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <FaBuilding className="text-gray-400 text-sm" />
                      <p className="text-sm text-gray-700">{workedAt.center}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-400 text-sm" />
                      <p className="text-sm text-gray-600">
                        {formatDate(workedAt.startDate)} -{" "}
                        {workedAt.isCurrent
                          ? t("personal.present") || "Present"
                          : workedAt.endDate
                          ? formatDate(workedAt.endDate)
                          : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(workedAt)}
                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title={t("personal.deleteWorkedAt") || "Delete Work Experience"}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardDashBoard>

      <WorkedAtFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddWorkedAt}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("personal.deleteWorkedAt") || "Delete Work Experience"}
        message={
          workedAtToDelete
            ? t("personal.deleteWorkedAtConfirm", {
                title: workedAtToDelete.title,
              }) ||
              `Are you sure you want to delete: ${workedAtToDelete.title}?`
            : t("personal.deleteWorkedAtConfirmMessage") ||
              "Are you sure you want to delete this work experience?"
        }
        confirmText={t("form.confirm") || "Confirm"}
        cancelText={t("form.cancel") || "Cancel"}
      />
    </>
  );
}

