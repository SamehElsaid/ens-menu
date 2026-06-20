"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { FiSave } from "react-icons/fi";
import {
  MdOutlineDeliveryDining,
} from "react-icons/md";
import {
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoSearchOutline,
  IoSaveOutline,
} from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { axiosGet, axiosPost, axiosPatch, axiosDelete } from "@/shared/axiosCall";
import CustomBtn from "@/components/Custom/CustomBtn";
import CustomInput from "@/components/Custom/CustomInput";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import DeleteEntityConfirmModal from "@/components/Dashboard/DeleteEntityConfirmModal";

interface DeliverySettings {
  deliveryOn: boolean;
  deliveryWhatsAppOn: boolean;
  deliveryPhone: string;
  phoneNumber: string;
}

interface Governorate {
  id: number;
  nameAr: string;
  nameEn: string;
  price: number;
  lat: number;
  lan: number;
  createdAt?: string;
  updatedAt?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  namedetails?: Record<string, string | undefined>;
}

interface GovFormState {
  nameAr: string;
  nameEn: string;
  lat: string;
  lan: string;
  price: string;
}

const EMPTY_GOV_FORM: GovFormState = {
  nameAr: "",
  nameEn: "",
  lat: "",
  lan: "",
  price: "",
};

export default function DeliverySettingsPage() {
  const locale = useLocale();
  const t = useTranslations("settingsDeliveryPage");
  const isRTL = locale === "ar";

  const [settings, setSettings] = useState<DeliverySettings>({
    deliveryOn: false,
    deliveryWhatsAppOn: true,
    deliveryPhone: "",
    phoneNumber: "",
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsTouched, setSettingsTouched] = useState(false);

  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [isLoadingGovs, setIsLoadingGovs] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [govForm, setGovForm] = useState<GovFormState>(EMPTY_GOV_FORM);
  const [isSavingGov, setIsSavingGov] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [govToDelete, setGovToDelete] = useState<Governorate | null>(null);
  const [govFormTouched, setGovFormTouched] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSettings = async (silent = false) => {
    if (!silent) setIsLoadingSettings(true);
    const res = await axiosGet<DeliverySettings>(
      "/user/delivery/settings",
      locale,
    );
    if (res.status && res.data) {
      setSettings({
        ...res.data,
        deliveryWhatsAppOn: res.data.deliveryWhatsAppOn ?? true,
        phoneNumber:
          res.data.deliveryPhone?.trim() ||
          res.data.phoneNumber?.trim() ||
          "",
      });
    }
    if (!silent) setIsLoadingSettings(false);
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const fetchGovernorates = async (silent = false) => {
    if (!silent) setIsLoadingGovs(true);
    const res = await axiosGet<{ governorates: Governorate[] }>(
      "/user/delivery/governorates",
      locale,
    );
    if (res.status && res.data) {
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data as { governorates?: Governorate[] }).governorates ?? [];
      setGovernorates(list);
    }
    if (!silent) setIsLoadingGovs(false);
  };

  useEffect(() => {
    fetchGovernorates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&namedetails=1`,
          {
            headers: {
              "Accept-Language": "ar,en",
              "User-Agent": "ENSmenu-delivery-settings/1.0",
            },
          },
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 600);
  };

  const handleSelectResult = (result: NominatimResult) => {
    const nameAr =
      result.namedetails?.["name:ar"] ??
      result.namedetails?.["name"] ??
      result.display_name.split(",")[0];
    const nameEn =
      result.namedetails?.["name:en"] ??
      result.namedetails?.["name"] ??
      result.display_name.split(",")[0];
    setGovForm((f) => ({
      ...f,
      nameAr,
      nameEn,
      lat: result.lat,
      lan: result.lon,
    }));
    setSearchQuery(isRTL ? nameAr : nameEn);
    setSearchResults([]);
  };

  const handleSaveSettings = async () => {
    setSettingsTouched(true);
    if (!isSettingsValid) return;
    setIsSavingSettings(true);
    try {
      const payload = {
        deliveryOn: settings.deliveryOn,
        deliveryWhatsAppOn: settings.deliveryWhatsAppOn,
        ...(settings.deliveryWhatsAppOn && settings.phoneNumber.trim()
          ? { deliveryPhone: settings.phoneNumber.trim() }
          : {}),
      };
      const res = await axiosPatch<typeof payload, DeliverySettings>(
        "/user/delivery/settings",
        locale,
        payload,
      );
      if (res.status) {
        toast.success(t("savedSuccess"));
        await loadSettings(true);
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  const isSettingsValid =
    !settings.deliveryWhatsAppOn ||
    (settings.phoneNumber?.trim() ?? "") !== "";

  const isGovFormValid =
    govForm.nameAr.trim() !== "" &&
    govForm.nameEn.trim() !== "" &&
    govForm.lat.trim() !== "" &&
    govForm.lan.trim() !== "" &&
    govForm.price.trim() !== "" &&
    parseFloat(govForm.price) > 0;

  const resetForm = () => {
    setGovForm(EMPTY_GOV_FORM);
    setSearchQuery("");
    setSearchResults([]);
    setEditingId(null);
    setShowForm(false);
    setGovFormTouched(false);
  };

  const handleAddGov = () => {
    setEditingId(null);
    setGovForm(EMPTY_GOV_FORM);
    setSearchQuery("");
    setGovFormTouched(false);
    setShowForm(true);
  };

  const handleEditGov = (gov: Governorate) => {
    setEditingId(gov.id);
    setGovForm({
      nameAr: gov.nameAr,
      nameEn: gov.nameEn,
      lat: String(gov.lat),
      lan: String(gov.lan),
      price: String(gov.price),
    });
    setSearchQuery(isRTL ? gov.nameAr : gov.nameEn);
    setGovFormTouched(false);
    setShowForm(true);
  };

  const handleSaveGov = async () => {
    setGovFormTouched(true);
    if (!isGovFormValid) return;
    setIsSavingGov(true);
    try {
      const payload = {
        nameAr: govForm.nameAr,
        nameEn: govForm.nameEn,
        price: parseFloat(govForm.price) || 0,
        lat: parseFloat(govForm.lat) || 0,
        lan: parseFloat(govForm.lan) || 0,
      };

      if (editingId !== null) {
        const res = await axiosPatch<typeof payload, Governorate>(
          `/user/delivery/governorates/${editingId}`,
          locale,
          payload,
        );
        if (res.status) {
          await fetchGovernorates(true);
          toast.success(isRTL ? "تم تحديث المحافظة" : "Governorate updated");
          resetForm();
        }
      } else {
        const res = await axiosPost<typeof payload, Governorate>(
          "/user/delivery/governorates",
          locale,
          payload,
        );
        if (res.status) {
          await fetchGovernorates(true);
          toast.success(isRTL ? "تمت إضافة المحافظة" : "Governorate added");
          resetForm();
        }
      }
    } finally {
      setIsSavingGov(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!govToDelete) return;
    setDeletingId(govToDelete.id);
    try {
      const res = await axiosDelete(
        `/user/delivery/governorates/${govToDelete.id}`,
        locale,
      );
      if (res.status) {
        await fetchGovernorates(true);
        toast.success(t("governorates.deleteSuccess"));
        setGovToDelete(null);
      } else {
        toast.error(t("governorates.deleteError"));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const deliveryDisabled = !settings.deliveryOn;

  if (isLoadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isRTL ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-160px)]">
      <header
        className={`${isRTL ? "text-right" : "text-left"} space-y-1 mb-8`}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold">
          <MdOutlineDeliveryDining className="text-sm" />
          <span>{t("badge")}</span>
        </div>
        <PageTitleWithHelp className="my-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h1>
        </PageTitleWithHelp>
      </header>

      <div className="space-y-6">
        {/* ── Section 1: Delivery Toggle ── */}
        <section
          id="onboarding-delivery-toggle"
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <MdOutlineDeliveryDining className="text-lg text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {t("deliveryStatus.title")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("deliveryStatus.subtitle")}
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={settings.deliveryOn}
              onClick={() =>
                setSettings((s) => ({ ...s, deliveryOn: !s.deliveryOn }))
              }
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 ${
                settings.deliveryOn
                  ? "bg-primary"
                  : "bg-slate-200 dark:bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  settings.deliveryOn
                    ? isRTL
                      ? "-translate-x-5"
                      : "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                settings.deliveryOn
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  settings.deliveryOn ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {settings.deliveryOn
                ? t("deliveryStatus.enabledHint")
                : t("deliveryStatus.disabledHint")}
            </span>
          </div>
        </section>

        {/* Disabled hint */}
        {deliveryDisabled && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <span className="text-amber-500 text-base">⚠</span>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t("disabledHint")}
            </p>
          </div>
        )}

        {/* ── Sections 2 & 3: disabled when delivery is off ── */}
        <div
          className={`space-y-6 transition-opacity duration-200 ${
            deliveryDisabled
              ? "opacity-40 pointer-events-none select-none"
              : ""
          }`}
        >
          {/* ── Section 2: Contact Numbers ── */}
          <section
            id="onboarding-delivery-phones"
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <IoPhonePortraitOutline className="text-lg text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {t("contactNumbers.title")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("contactNumbers.subtitle")}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0">
                    <FaWhatsapp className="text-base text-[#25D366]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {t("contactNumbers.whatsappOrdersTitle")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {settings.deliveryWhatsAppOn
                        ? t("contactNumbers.whatsappOrdersOnHint")
                        : t("contactNumbers.whatsappOrdersOffHint")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.deliveryWhatsAppOn}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      deliveryWhatsAppOn: !s.deliveryWhatsAppOn,
                    }))
                  }
                  disabled={deliveryDisabled}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    settings.deliveryWhatsAppOn
                      ? "bg-[#25D366]"
                      : "bg-slate-200 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                      settings.deliveryWhatsAppOn
                        ? isRTL
                          ? "-translate-x-5"
                          : "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div
                className={`space-y-1.5 transition-opacity ${
                  settings.deliveryWhatsAppOn ? "" : "opacity-50"
                }`}
              >
                <label className="flex items-center gap-1.5 text-sm font-medium text-[#25D366]">
                  <FaWhatsapp className="text-base" />
                  {t("contactNumbers.whatsapp")}
                  {settings.deliveryWhatsAppOn ? (
                    <span className="text-red-500">*</span>
                  ) : null}
                </label>
                <CustomInput
                  type="tel"
                  value={settings.phoneNumber || undefined}
                  onChange={(val) =>
                    setSettings((s) => ({
                      ...s,
                      phoneNumber:
                        (val as unknown as string | undefined) ?? "",
                    }))
                  }
                  placeholder={t("contactNumbers.phonePlaceholder")}
                  disabled={deliveryDisabled || !settings.deliveryWhatsAppOn}
                />
                {settingsTouched &&
                settings.deliveryWhatsAppOn &&
                !settings.phoneNumber?.trim() ? (
                  <p className="text-xs text-red-500 mt-1">
                    {isRTL ? "رقم الواتساب مطلوب" : "WhatsApp number is required"}
                  </p>
                ) : settings.deliveryWhatsAppOn ? (
                  <p className="flex items-center gap-1 text-xs text-[#25D366]/80 dark:text-[#25D366]/70 mt-1">
                    <FaWhatsapp className="shrink-0" />
                    {t("contactNumbers.whatsappHint")}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("contactNumbers.whatsappDashboardOnlyHint")}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ── Section 3: Governorates ── */}
          <section
            id="onboarding-delivery-governorates"
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <IoLocationOutline className="text-lg text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {t("governorates.title")}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t("governorates.subtitle")}
                  </p>
                </div>
              </div>
              {!showForm && (
                <button
                  type="button"
                  onClick={handleAddGov}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
                >
                  <IoAddOutline className="text-base" />
                  {t("governorates.addBtn")}
                </button>
              )}
            </div>

            {/* ── Add / Edit Form ── */}
            {showForm && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 dark:border-primary/30 p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {editingId !== null
                    ? t("governorates.editTitle")
                    : t("governorates.addTitle")}
                </h3>

                {/* Google / Nominatim search */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("governorates.searchLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onBlur={() =>
                        setTimeout(() => setSearchResults([]), 200)
                      }
                      placeholder={t("governorates.searchPlaceholder")}
                      className="w-full py-3.5 ps-10 pe-4 outline-none rounded-2xl border border-accent-purple/20 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:placeholder:text-slate-400 dark:focus:border-accent-purple text-sm"
                    />
                    <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {isSearching ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <IoSearchOutline className="text-lg" />
                      )}
                    </div>

                    {/* Results dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden">
                        {searchResults.map((r) => (
                          <button
                            key={r.place_id}
                            type="button"
                            onMouseDown={() => handleSelectResult(r)}
                            className="w-full text-start px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0 truncate"
                          >
                            {r.display_name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No results */}
                    {!isSearching &&
                      searchQuery.trim() &&
                      searchResults.length === 0 && (
                        <p className="absolute top-full mt-1 start-0 text-xs text-slate-400 dark:text-slate-500 px-1">
                          {t("governorates.noResults")}
                        </p>
                      )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("governorates.nameAr")} <span className="text-red-500">*</span>
                    </label>
                    <CustomInput
                      type="text"
                      value={govForm.nameAr}
                      onChange={(e) =>
                        setGovForm((f) => ({
                          ...f,
                          nameAr: (
                            e as React.ChangeEvent<HTMLInputElement>
                          ).target.value,
                        }))
                      }
                      placeholder={t("governorates.nameArPlaceholder")}
                      error={govFormTouched && !govForm.nameAr.trim() ? (isRTL ? "مطلوب" : "Required") : undefined}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("governorates.nameEn")} <span className="text-red-500">*</span>
                    </label>
                    <CustomInput
                      type="text"
                      value={govForm.nameEn}
                      onChange={(e) =>
                        setGovForm((f) => ({
                          ...f,
                          nameEn: (
                            e as React.ChangeEvent<HTMLInputElement>
                          ).target.value,
                        }))
                      }
                      placeholder={t("governorates.nameEnPlaceholder")}
                      error={govFormTouched && !govForm.nameEn.trim() ? (isRTL ? "مطلوب" : "Required") : undefined}
                    />
                  </div>
                  {/* lat & lan: hidden visually, tracked in state and sent to API */}
                  <input type="hidden" value={govForm.lat} readOnly />
                  <input type="hidden" value={govForm.lan} readOnly />
                  {govFormTouched && !govForm.lat && (
                    <p className="sm:col-span-2 text-xs text-red-500 -mt-1">
                      {isRTL
                        ? "يرجى اختيار موقع من نتائج البحث أولاً"
                        : "Please select a location from the search results first"}
                    </p>
                  )}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("governorates.price")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <CustomInput
                      type="number"
                      value={govForm.price}
                      onChange={(e) =>
                        setGovForm((f) => ({
                          ...f,
                          price: (
                            e as React.ChangeEvent<HTMLInputElement>
                          ).target.value,
                        }))
                      }
                      placeholder={t("governorates.pricePlaceholder")}
                      error={
                        govFormTouched && (!govForm.price || parseFloat(govForm.price) <= 0)
                          ? (isRTL ? "أدخل سعر أكبر من صفر" : "Enter a price greater than 0")
                          : undefined
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t("governorates.cancel")}
                  </button>
                  <CustomBtn
                    onClick={handleSaveGov}
                    loading={isSavingGov}
                    disabled={isSavingGov || (govFormTouched && !isGovFormValid)}
                    className="w-auto! min-w-[130px]"
                  >
                    <span className="flex items-center gap-2">
                      <IoSaveOutline className="text-base" />
                      {t("governorates.saveGov")}
                    </span>
                  </CustomBtn>
                </div>
              </div>
            )}

            {/* ── Governorates list ── */}
            {isLoadingGovs ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : governorates.length === 0 && !showForm ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400 dark:text-slate-500">
                <IoLocationOutline className="text-4xl" />
                <p className="text-sm font-medium">{t("governorates.empty")}</p>
                <p className="text-xs text-center">
                  {t("governorates.emptyHint")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {governorates.map((gov) => (
                  <div
                    key={gov.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                        <IoLocationOutline className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {isRTL ? gov.nameAr : gov.nameEn}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {isRTL ? gov.nameEn : gov.nameAr}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-primary tabular-nums">
                        {gov.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEditGov(gov)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        aria-label={t("governorates.editTitle")}
                      >
                        <IoPencilOutline className="text-base" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGovToDelete(gov)}
                        disabled={deletingId === gov.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        aria-label={t("governorates.deleteBtn")}
                      >
                        {deletingId === gov.id ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <IoTrashOutline className="text-base" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Save settings footer ── */}
        <div className="flex flex-wrap justify-end gap-3 pt-2 pb-6">
          <CustomBtn
            onClick={handleSaveSettings}
            loading={isSavingSettings}
            disabled={isSavingSettings || (settingsTouched && !isSettingsValid)}
            className="w-auto! min-w-[160px]"
          >
            <span className="flex items-center justify-center gap-2">
              <FiSave className="text-base" />
              {t("buttons.save")}
            </span>
          </CustomBtn>
        </div>
      </div>

      {govToDelete && (
        <DeleteEntityConfirmModal
          titleId="delete-gov-title"
          inputId="delete-gov-confirm-input"
          title={t("governorates.deleteConfirmTitle")}
          message={t("governorates.deleteConfirm")}
          typeConfirmLabel={
            <>
              {t("governorates.typeNameToConfirm")}{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                «{isRTL ? govToDelete.nameAr : govToDelete.nameEn}»
              </span>
            </>
          }
          confirmPlaceholder={isRTL ? govToDelete.nameAr : govToDelete.nameEn}
          cancelLabel={t("governorates.cancel")}
          confirmDeleteLabel={t("governorates.confirmDelete")}
          deletingLabel={t("governorates.deleting")}
          closeAriaLabel={t("governorates.cancel")}
          onClose={() => setGovToDelete(null)}
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
