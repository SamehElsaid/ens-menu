"use client";

import { useEffect, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations, useLocale } from "next-intl";
import { FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import CustomInput from "./CustomInput";
import LeafletMap from "./LeafletMap";
import type { Location } from "@/app/[locale]/specialist/personal/available-in/page";
import { UnmountClosed } from "react-collapse";

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: Omit<Location, "id">) => void;
}

type LocationFormData = {
  country: { label: string; value: string } | null;
  state: { label: string; value: string } | null;
  city: { label: string; value: string } | null;
  locationDetails: string;
  lat?: number;
  lng?: number;
  address?: string;
};

const createLocationSchema = (t: ReturnType<typeof useTranslations<"">>) => {
  return yup.object().shape({
    country: yup
      .object()
      .shape({
        label: yup
          .string()
          .required(t("auth.countryRequired") || "Country is required"),
        value: yup
          .string()
          .required(t("auth.countryRequired") || "Country is required"),
      })
      .required(t("auth.countryRequired") || "Country is required"),
    state: yup
      .object()
      .shape({
        label: yup
          .string()
          .required(t("auth.stateRequired") || "State is required"),
        value: yup
          .string()
          .required(t("auth.stateRequired") || "State is required"),
      })
      .required(t("auth.stateRequired") || "State is required"),
    city: yup
      .object()
      .shape({
        label: yup
          .string()
          .required(t("auth.cityRequired") || "City is required"),
        value: yup
          .string()
          .required(t("auth.cityRequired") || "City is required"),
      })
      .required(t("auth.cityRequired") || "City is required"),
    address: yup
      .string()
      .required(t("personal.locationDetailsRequired") || "Location Details is required"),
    locationDetails: yup.string(),
  });
};

export default function LocationFormModal({
  isOpen,
  onClose,
  onSubmit,
}: LocationFormModalProps) {
  const t = useTranslations("");
  const locale = useLocale();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    country?: string;
    state?: string;
    city?: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    setValue,
    watch,
  } = useForm<LocationFormData>({
    defaultValues: {
      country: null,
      state: null,
      city: null,
      locationDetails: "",
      lat: undefined,
      lng: undefined,
      address: "",
    },
    resolver: yupResolver(
      createLocationSchema(t)
    ) as unknown as Resolver<LocationFormData>,
    mode: "onChange",
  });

  const watchedCountry = watch("country");
  const watchedState = watch("state");
  const watchedCity = watch("city");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      reset();
      setSelectedLocation(null);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, reset]);

  // Update form when location is selected from map
  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address: string;
    country?: string;
    state?: string;
    city?: string;
  }) => {
    setSelectedLocation(location);
    setValue("lat", location.lat);
    setValue("lng", location.lng);
    setValue("address", location.address);
    
    trigger("address");

    // Auto-fill country, state, city if available
    if (location.country) {
      const countryOption = countryOptions.find(
        (opt) =>
          opt.label.toLowerCase().includes(location.country!.toLowerCase()) ||
          location.country!.toLowerCase().includes(opt.label.toLowerCase())
      );
      if (countryOption) {
        setValue("country", countryOption);
      }
    }

    if (location.state) {
      const stateOption = stateOptions.find(
        (opt) =>
          opt.label.toLowerCase().includes(location.state!.toLowerCase()) ||
          location.state!.toLowerCase().includes(opt.label.toLowerCase())
      );
      if (stateOption) {
        setValue("state", stateOption);
      }
    }

    if (location.city) {
      const cityOption = cityOptions.find(
        (opt) =>
          opt.label.toLowerCase().includes(location.city!.toLowerCase()) ||
          location.city!.toLowerCase().includes(opt.label.toLowerCase())
      );
      if (cityOption) {
        setValue("city", cityOption);
      }
    }
  };

  if (!isOpen) return null;

  const onFormSubmit = (data: LocationFormData) => {
    // Get labels for display
    const countryLabel =
      countryOptions.find((opt) => opt.value === data.country?.value)?.label ||
      data.country?.label ||
      selectedLocation?.country ||
      "";
    const stateLabel =
      stateOptions.find((opt) => opt.value === data.state?.value)?.label ||
      data.state?.label ||
      selectedLocation?.state ||
      "";
    const cityLabel =
      cityOptions.find((opt) => opt.value === data.city?.value)?.label ||
      data.city?.label ||
      selectedLocation?.city ||
      "";

    onSubmit({
      country: countryLabel,
      state: stateLabel,
      city: cityLabel,
      locationDetails: data.locationDetails,
      lat: data.lat || selectedLocation?.lat,
      lng: data.lng || selectedLocation?.lng,
      address: data.address || selectedLocation?.address,
    });
    reset();
    setSelectedLocation(null);
  };

  // These can be replaced with API calls
  const countryOptions = [
    { label: "Egypt", value: "egypt" },
    { label: "United States", value: "usa" },
    { label: "United Kingdom", value: "uk" },
    { label: "Canada", value: "canada" },
  ];

  const stateOptions = [
    { label: "Cairo", value: "cairo" },
    { label: "Alexandria", value: "alexandria" },
    { label: "Giza", value: "giza" },
  ];

  const cityOptions = [
    { label: "Downtown", value: "downtown" },
    { label: "Zamalek", value: "zamalek" },
    { label: "Maadi", value: "maadi" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm m-0">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FaMapMarkerAlt className="text-primary text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t("personal.addLocation") || "Add Location"}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                control={control}
                name="country"
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    type="select"
                    id="country"
                    label={t("auth.country") || "Country"}
                    placeholder={t("auth.selectCountry") || "Select Country"}
                    icon={<FaMapMarkerAlt />}
                    error={errors.country?.message}
                    value={
                      value
                        ? countryOptions.find(
                            (opt) => opt.value === value?.value
                          ) || null
                        : null
                    }
                    onChange={onChange}
                    options={countryOptions}
                    isSearchable={true}
                  />
                )}
              />

              <Controller
                control={control}
                name="state"
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    type="select"
                    id="state"
                    label={t("auth.state") || "State"}
                    placeholder={t("auth.selectState") || "Select State"}
                    icon={<FaMapMarkerAlt />}
                    error={errors.state?.message}
                    value={
                      value
                        ? stateOptions.find(
                            (opt) => opt.value === value?.value
                          ) || null
                        : null
                    }
                    onChange={onChange}
                    options={stateOptions}
                    isSearchable={true}
                  />
                )}
              />

              <Controller
                control={control}
                name="city"
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    type="select"
                    id="city"
                    label={t("auth.city") || "City"}
                    placeholder={t("auth.selectCity") || "Select City"}
                    icon={<FaMapMarkerAlt />}
                    error={errors.city?.message}
                    value={
                      value
                        ? cityOptions.find(
                            (opt) => opt.value === value?.value
                          ) || null
                        : null
                    }
                    onChange={onChange}
                    options={cityOptions}
                    isSearchable={true}
                  />
                )}
              />
            </div>

            {/* Leaflet Map */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("personal.selectLocationOnMap") || "Select Location on Map"}
              </label>
              <LeafletMap
                onLocationSelect={handleLocationSelect}
                initialPosition={
                  selectedLocation
                    ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                    : undefined
                }
                initialAddress={selectedLocation?.address}
              />
              <UnmountClosed isOpened={Boolean(errors.address)}>
                {" "}
                <p className="text-xs text-red-500 mt-1">
                  {errors.address?.message}
                </p>{" "}
              </UnmountClosed>
            </div>

            <Controller
              control={control}
              name="locationDetails"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="textarea"
                  id="locationDetails"
                  label={t("personal.locationDetails") || "Location Details"}
                  placeholder={
                    t("personal.locationDetailsPlaceholder") ||
                    "Enter additional location details (e.g., street address, building name, etc.)"
                  }
                  icon={<FaMapMarkerAlt />}
                  error={errors.locationDetails?.message}
                  value={value}
                  onChange={onChange}
                  rows={4}
                />
              )}
            />

            <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              >
                {t("form.cancel") || "Cancel"}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
              >
                {t("form.submit") || "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
