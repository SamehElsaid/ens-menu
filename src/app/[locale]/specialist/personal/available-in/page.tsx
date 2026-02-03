"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CardDashBoard from "@/components/Card/CardDashBoard";
import LocationFormModal from "@/components/Custom/LocationFormModal";
import { FaMapMarkerAlt, FaPlus, FaTrash } from "react-icons/fa";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";

export interface Location {
  id: string;
  country: string;
  state: string;
  city: string;
  locationDetails: string;
  lat?: number;
  lng?: number;
  address?: string;
}

export default function AvailableInPage() {
  const t = useTranslations("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null
  );

  const handleAddLocation = (location: Omit<Location, "id">) => {
    const newLocation: Location = {
      ...location,
      id: Date.now().toString(),
    };
    setLocations([...locations, newLocation]);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (location: Location) => {
    setLocationToDelete(location);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (locationToDelete) {
      setLocations(
        locations.filter((loc) => loc.id !== locationToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setLocationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setLocationToDelete(null);
  };

  return (
    <>
      <CardDashBoard>
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row  gap-2">
          <h1 className="text-2xl font-bold">
            {t("personal.availableIn") || "Available in"}
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
          >
            <FaPlus />
            {t("personal.addLocation") || "Add Location"}
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {t("personal.noLocations") || "No locations added yet"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("personal.addFirstLocation") ||
                "Click 'Add Location' to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMapMarkerAlt className="text-primary" />
                      <h3 className="font-semibold text-gray-900">
                        {location.city}, {location.state}, {location.country}
                      </h3>
                    </div>
                    {location.locationDetails && (
                      <p className="text-gray-600 text-sm mt-2">
                        {location.locationDetails}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteClick(location)}
                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title={t("personal.deleteLocation") || "Delete Location"}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardDashBoard>

      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLocation}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("personal.deleteLocation") || "Delete Location"}
        message={
          locationToDelete
            ? t("personal.deleteLocationConfirm", {
                location: `${locationToDelete.city}, ${locationToDelete.state}, ${locationToDelete.country}`,
              }) ||
              `Are you sure you want to delete the location: ${locationToDelete.city}, ${locationToDelete.state}, ${locationToDelete.country}?`
            : t("personal.deleteLocationConfirmMessage") ||
              "Are you sure you want to delete this location?"
        }
        confirmText={t("form.confirm") || "Confirm"}
        cancelText={t("form.cancel") || "Cancel"}
      />
    </>
  );
}

