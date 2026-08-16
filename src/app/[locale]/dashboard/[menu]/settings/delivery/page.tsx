"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { FiSave } from "react-icons/fi";
import { MdOutlineDeliveryDining, MdOutlineDashboard } from "react-icons/md";
import {
  IoReceiptOutline,
  IoLocationOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoSearchOutline,
  IoSaveOutline,
} from "react-icons/io5";
import { FaWhatsapp, FaCrown } from "react-icons/fa";
import {
  axiosGet,
  axiosPost,
  axiosPut,
  axiosDelete,
} from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardDivider,
  CardFooter,
  CardHeader,
  ChoiceCard,
  EmptyState,
  Field,
  FieldError,
  Input,
  LoadingBlock,
  PageShell,
  SectionHeader,
  Spinner,
  Switch,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import DeleteEntityConfirmModal from "@/components/Dashboard/DeleteEntityConfirmModal";
import BranchLocationPicker, {
  getDefaultBranchFormCoords,
  isValidBranchCoordinate,
} from "@/components/Dashboard/delivery/BranchLocationPicker";
import type { DeliveryBranch } from "@/types/Delivery";
import ProUpgradeModal from "@/components/Dashboard/ProUpgradeModal";
import { useAppSelector } from "@/store/hooks";
import { menuDashboardPath } from "@/lib/menuDashboardPath";
import { useCurrentPlanCapabilities } from "@/hooks/useCurrentPlanCapabilities";

type DeliveryMode = "governorates" | "distance";

interface DeliverySettings {
  deliveryOn: boolean;
  deliveryWhatsAppOn: boolean;
  deliveryPhone: string;
  phoneNumber: string;
  deliveryMode?: DeliveryMode;
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

function branchNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function branchFieldString(value: unknown, fallback = ""): string {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : fallback;
}

interface BranchFormState {
  latitude: string;
  longitude: string;
  deliveryBasePrice: string;
  deliveryPricePerKm: string;
  maxDeliveryRadiusKm: string;
}

const EMPTY_GOV_FORM: GovFormState = {
  nameAr: "",
  nameEn: "",
  lat: "",
  lan: "",
  price: "",
};

const EMPTY_BRANCH_FORM: BranchFormState = {
  ...getDefaultBranchFormCoords(),
  deliveryBasePrice: "",
  deliveryPricePerKm: "",
  maxDeliveryRadiusKm: "10",
};

/** Section title with a neutral glyph — the icon names the region, it does not
 *  colour-code it. */
function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-fg-subtle" aria-hidden>
        {icon}
      </span>
      {children}
    </span>
  );
}

export default function DeliverySettingsPage() {
  const locale = useLocale();
  const t = useTranslations("settingsDeliveryPage");
  const isRTL = locale === "ar";
  const menu = useAppSelector((s) => s.menuData.menu);
  const capabilities = useCurrentPlanCapabilities();
  const canUseDistanceDelivery = capabilities.advancedDeliveryMaps;
  const subscriptionHref = menuDashboardPath(menu, "subscription");
  const menuId = menu?.id;
  const menuNameAr = menu?.nameAr?.trim() ?? "";
  const menuNameEn = menu?.nameEn?.trim() ?? "";
  const deliveryApiBase = menuId ? `/menus/${menuId}/delivery` : null;
  const branchesApiBase = menuId ? `/menus/${menuId}/branches` : null;

  const [settings, setSettings] = useState<DeliverySettings>({
    deliveryOn: false,
    deliveryWhatsAppOn: true,
    deliveryPhone: "",
    phoneNumber: "",
    deliveryMode: "governorates",
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

  const [branchId, setBranchId] = useState<number | null>(null);
  const [branchForm, setBranchForm] =
    useState<BranchFormState>(EMPTY_BRANCH_FORM);
  const [isLoadingBranch, setIsLoadingBranch] = useState(true);
  const [branchFormTouched, setBranchFormTouched] = useState(false);
  const [isSavingDeliveryMode, setIsSavingDeliveryMode] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const deliveryDisabled = !settings.deliveryOn;
  const isDistanceMode = settings.deliveryMode === "distance";

  const loadSettings = async (silent = false) => {
    if (!deliveryApiBase) return;
    if (!silent) setIsLoadingSettings(true);
    const res = await axiosGet<DeliverySettings>(
      `${deliveryApiBase}/settings`,
      locale,
    );
    if (res.status && res.data) {
      setSettings({
        ...res.data,
        deliveryWhatsAppOn: res.data.deliveryWhatsAppOn ?? true,
        deliveryMode: res.data.deliveryMode ?? "governorates",
        phoneNumber:
          res.data.deliveryPhone?.trim() || res.data.phoneNumber?.trim() || "",
      });
    }
    if (!silent) setIsLoadingSettings(false);
  };

  useEffect(() => {
    if (!menuId) return;
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, menuId]);

  const fetchGovernorates = async (silent = false) => {
    if (!deliveryApiBase) return;
    if (!silent) setIsLoadingGovs(true);
    const res = await axiosGet<{ governorates: Governorate[] }>(
      `${deliveryApiBase}/governorates`,
      locale,
    );
    if (res.status && res.data) {
      const list = Array.isArray(res.data)
        ? res.data
        : ((res.data as { governorates?: Governorate[] }).governorates ?? []);
      setGovernorates(list);
    }
    if (!silent) setIsLoadingGovs(false);
  };

  useEffect(() => {
    if (!menuId) return;
    fetchGovernorates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, menuId]);

  const loadBranchSettings = async (silent = false) => {
    if (!branchesApiBase) return;
    if (!silent) setIsLoadingBranch(true);
    const res = await axiosGet<
      DeliveryBranch | DeliveryBranch[] | { branches: DeliveryBranch[] }
    >(
      branchesApiBase,
      locale,
    );
    if (res.status && res.data) {
      const list = Array.isArray(res.data)
        ? res.data
        : ((res.data as { branches?: DeliveryBranch[] }).branches ??
          ((res.data as DeliveryBranch).id != null
            ? [res.data as DeliveryBranch]
            : []));
      const branch = list[0];
      if (branch) {
        setBranchId(branch.id);
        const lat = branchNumber(branch.latitude, NaN);
        const lng = branchNumber(branch.longitude, NaN);
        const coords =
          isValidBranchCoordinate(lat) && isValidBranchCoordinate(lng)
            ? { latitude: String(lat), longitude: String(lng) }
            : getDefaultBranchFormCoords();
        setBranchForm({
          ...coords,
          deliveryBasePrice: branchFieldString(branch.deliveryBasePrice),
          deliveryPricePerKm: branchFieldString(branch.deliveryPricePerKm),
          maxDeliveryRadiusKm: branchFieldString(
            branch.maxDeliveryRadiusKm,
            "10",
          ),
        });
      } else {
        setBranchId(null);
        setBranchForm(EMPTY_BRANCH_FORM);
      }
    }
    if (!silent) setIsLoadingBranch(false);
  };

  useEffect(() => {
    if (!menuId || settings.deliveryMode !== "distance") return;
    loadBranchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, menuId, settings.deliveryMode]);

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
    if (!deliveryApiBase) return;
    setSettingsTouched(true);
    if (isDistanceMode && settings.deliveryOn) {
      setBranchFormTouched(true);
    }
    if (!isSettingsValid) return;
    if (isDistanceMode && settings.deliveryOn && !isBranchFormValid) return;

    setIsSavingSettings(true);
    try {
      const payload = {
        deliveryOn: settings.deliveryOn,
        deliveryWhatsAppOn: settings.deliveryWhatsAppOn,
        deliveryMode: settings.deliveryMode ?? "governorates",
        ...(settings.deliveryWhatsAppOn && settings.phoneNumber.trim()
          ? { deliveryPhone: settings.phoneNumber.trim() }
          : {}),
      };
      const res = await axiosPut<typeof payload, DeliverySettings>(
        `${deliveryApiBase}/settings`,
        locale,
        payload,
      );
      if (!res.status) return;

      if (isDistanceMode && settings.deliveryOn && branchesApiBase) {
        const branchPayload = {
          nameAr: menuNameAr,
          nameEn: menuNameEn,
          latitude: parseFloat(branchForm.latitude) || 0,
          longitude: parseFloat(branchForm.longitude) || 0,
          deliveryBasePrice: parseFloat(branchForm.deliveryBasePrice) || 0,
          deliveryPricePerKm: parseFloat(branchForm.deliveryPricePerKm) || 0,
          maxDeliveryRadiusKm: parseFloat(branchForm.maxDeliveryRadiusKm) || 0,
        };

        const branchRes =
          branchId !== null
            ? await axiosPut<typeof branchPayload, DeliveryBranch>(
                `${branchesApiBase}/${branchId}`,
                locale,
                branchPayload,
              )
            : await axiosPost<typeof branchPayload, DeliveryBranch>(
                branchesApiBase,
                locale,
                branchPayload,
              );

        if (!branchRes.status) return;

        await loadBranchSettings(true);
        setBranchFormTouched(false);
      }

      toast.success(t("savedSuccess"));
      await loadSettings(true);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeliveryModeChange = async (mode: DeliveryMode) => {
    if (mode === settings.deliveryMode) return;
    if (mode === "distance" && !canUseDistanceDelivery) {
      setUpgradeModalOpen(true);
      return;
    }
    if (!deliveryApiBase) return;

    setIsSavingDeliveryMode(true);
    try {
      const res = await axiosPut<
        { deliveryMode: DeliveryMode },
        DeliverySettings
      >(`${deliveryApiBase}/settings`, locale, { deliveryMode: mode });
      if (res.status) {
        setSettings((s) => ({ ...s, deliveryMode: mode }));
        toast.success(t("deliveryMode.savedSuccess"));
        if (mode === "distance") {
          await loadBranchSettings(true);
        }
      }
    } finally {
      setIsSavingDeliveryMode(false);
    }
  };

  const isSettingsValid =
    !settings.deliveryWhatsAppOn || (settings.phoneNumber?.trim() ?? "") !== "";

  const isGovFormValid =
    govForm.nameAr.trim() !== "" &&
    govForm.nameEn.trim() !== "" &&
    govForm.lat.trim() !== "" &&
    govForm.lan.trim() !== "" &&
    govForm.price.trim() !== "" &&
    parseFloat(govForm.price) > 0;

  const isBranchFormValid =
    menuNameAr !== "" &&
    menuNameEn !== "" &&
    branchForm.latitude.trim() !== "" &&
    branchForm.longitude.trim() !== "" &&
    branchForm.deliveryBasePrice.trim() !== "" &&
    parseFloat(branchForm.deliveryBasePrice) >= 0 &&
    branchForm.deliveryPricePerKm.trim() !== "" &&
    parseFloat(branchForm.deliveryPricePerKm) >= 0 &&
    branchForm.maxDeliveryRadiusKm.trim() !== "" &&
    parseFloat(branchForm.maxDeliveryRadiusKm) > 0;

  const isSaveDisabled =
    isSavingSettings ||
    (settingsTouched && !isSettingsValid) ||
    (isDistanceMode &&
      settings.deliveryOn &&
      branchFormTouched &&
      !isBranchFormValid);

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
    if (!deliveryApiBase) return;
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
        const res = await axiosPut<typeof payload, Governorate>(
          `${deliveryApiBase}/governorates/${editingId}`,
          locale,
          payload,
        );
        if (res.status) {
          await fetchGovernorates(true);
          toast.success(t("governorates.updateSuccess"));
          resetForm();
        }
      } else {
        const res = await axiosPost<typeof payload, Governorate>(
          `${deliveryApiBase}/governorates`,
          locale,
          payload,
        );
        if (res.status) {
          await fetchGovernorates(true);
          toast.success(t("governorates.addSuccess"));
          resetForm();
        }
      }
    } finally {
      setIsSavingGov(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!govToDelete || !deliveryApiBase) return;
    setDeletingId(govToDelete.id);
    try {
      const res = await axiosDelete(
        `${deliveryApiBase}/governorates/${govToDelete.id}`,
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

  if (isLoadingSettings) {
    return <LoadingBlock label={t("loading")} className="min-h-[40vh]" />;
  }

  const addZoneButton = (
    <Button
      type="button"
      size="sm"
      startIcon={<IoAddOutline className="size-4" />}
      onClick={handleAddGov}
    >
      {t("governorates.addBtn")}
    </Button>
  );

  return (
    <PageShell
      kind="detail"
      header={
        <PageTitleWithHelp
          eyebrow={t("badge")}
          title={t("title")}
          description={t("description")}
          breadcrumbs={[
            {
              label: t("breadcrumbs.settings"),
              href: menuDashboardPath(menu, "settings"),
            },
            { label: t("title") },
          ]}
          breadcrumbsLabel={t("breadcrumbs.label")}
          meta={
            <Badge tone={settings.deliveryOn ? "accent" : "neutral"} dot>
              {settings.deliveryOn
                ? t("deliveryStatus.badgeOn")
                : t("deliveryStatus.badgeOff")}
            </Badge>
          }
        />
      }
      /* Nine sections of zones, fees and branch rules: the save button belongs
         on the floor of the viewport, not a thousand pixels above the field
         being edited. */
      footerSticky
      footer={
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSaveSettings}
            loading={isSavingSettings}
            disabled={isSaveDisabled}
            startIcon={<FiSave className="size-3.5" />}
          >
            {t("buttons.save")}
          </Button>
        </div>
      }
    >
      <Card as="section" id="onboarding-delivery-toggle">
        <SectionHeader
          ruled
          eyebrow={t("sections.status")}
          title={
            <SectionTitle icon={<MdOutlineDeliveryDining className="size-4" />}>
              {t("deliveryStatus.title")}
            </SectionTitle>
          }
          description={t("deliveryStatus.subtitle")}
        />

        <div className="mt-3.5">
          <Switch
            align="between"
            label={t("deliveryStatus.label")}
            hint={
              settings.deliveryOn
                ? t("deliveryStatus.enabledHint")
                : t("deliveryStatus.disabledHint")
            }
            checked={settings.deliveryOn}
            onChange={(e) =>
              setSettings((s) => ({ ...s, deliveryOn: e.target.checked }))
            }
          />
        </div>
      </Card>

      {deliveryDisabled ? (
        <Alert tone="warning">{t("disabledHint")}</Alert>
      ) : null}

      <div
        className={cn(
          "flex min-w-0 flex-col gap-4 transition-opacity duration-(--dur-overlay) ease-(--ease-settle)",
          deliveryDisabled && "pointer-events-none opacity-40 select-none",
        )}
      >
        <Card as="section" id="onboarding-delivery-phones">
          <SectionHeader
            ruled
            eyebrow={t("sections.channel")}
            title={
              <SectionTitle icon={<IoReceiptOutline className="size-4" />}>
                {t("contactNumbers.title")}
              </SectionTitle>
            }
            description={t("contactNumbers.subtitle")}
          />

          <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <ChoiceCard
              name="delivery-contact-mode"
              value="dashboard"
              icon={<MdOutlineDashboard />}
              label={t("contactNumbers.dashboardOption")}
              description={t("contactNumbers.whatsappOrdersOffHint")}
              checked={!settings.deliveryWhatsAppOn}
              disabled={deliveryDisabled}
              onChange={() =>
                setSettings((s) => ({ ...s, deliveryWhatsAppOn: false }))
              }
            />
            <ChoiceCard
              name="delivery-contact-mode"
              value="whatsapp"
              icon={<FaWhatsapp />}
              label={t("contactNumbers.whatsappOption")}
              description={t("contactNumbers.whatsappOrdersOnHint")}
              checked={settings.deliveryWhatsAppOn}
              disabled={deliveryDisabled}
              onChange={() =>
                setSettings((s) => ({ ...s, deliveryWhatsAppOn: true }))
              }
            />
          </div>

          <CardDivider />

          <div className="sm:max-w-sm">
            <Field
              label={t("contactNumbers.whatsapp")}
              required={settings.deliveryWhatsAppOn}
              disabled={deliveryDisabled || !settings.deliveryWhatsAppOn}
              error={
                settingsTouched &&
                settings.deliveryWhatsAppOn &&
                !settings.phoneNumber?.trim()
                  ? t("contactNumbers.phoneRequired")
                  : undefined
              }
              hint={
                settings.deliveryWhatsAppOn
                  ? t("contactNumbers.whatsappHint")
                  : t("contactNumbers.whatsappDashboardOnlyHint")
              }
              className={settings.deliveryWhatsAppOn ? undefined : "opacity-60"}
            >
              <CustomInput
                type="tel"
                value={settings.phoneNumber || undefined}
                onChange={(val) =>
                  setSettings((s) => ({
                    ...s,
                    phoneNumber: (val as unknown as string | undefined) ?? "",
                  }))
                }
                placeholder={t("contactNumbers.phonePlaceholder")}
                disabled={deliveryDisabled || !settings.deliveryWhatsAppOn}
              />
            </Field>
          </div>
        </Card>

        <Card as="section" id="onboarding-delivery-mode">
          <SectionHeader
            ruled
            eyebrow={t("sections.zoneMethod")}
            title={
              <SectionTitle icon={<IoLocationOutline className="size-4" />}>
                {t("deliveryMode.title")}
              </SectionTitle>
            }
            description={t("deliveryMode.subtitle")}
          />

          <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <ChoiceCard
              name="delivery-zone-mode"
              value="governorates"
              icon={<IoLocationOutline />}
              label={
                <span className="flex flex-wrap items-center gap-1.5">
                  {t("deliveryMode.governoratesOption")}
                  <Badge tone="neutral">
                    {t("deliveryMode.governoratesIncluded")}
                  </Badge>
                </span>
              }
              description={t("deliveryMode.governoratesHint")}
              checked={!isDistanceMode}
              disabled={deliveryDisabled || isSavingDeliveryMode}
              onChange={() => void handleDeliveryModeChange("governorates")}
            />
            <ChoiceCard
              name="delivery-zone-mode"
              value="distance"
              icon={<FaCrown />}
              label={
                <span className="flex flex-wrap items-center gap-1.5">
                  {t("deliveryMode.distanceOption")}
                  <Badge tone="accent" icon={<FaCrown className="size-2.5" />}>
                    {t("proBadge")}
                  </Badge>
                </span>
              }
              description={t("deliveryMode.distanceHint")}
              checked={isDistanceMode}
              disabled={deliveryDisabled || isSavingDeliveryMode}
              onChange={() => void handleDeliveryModeChange("distance")}
            />
          </div>
        </Card>

        {!isDistanceMode ? (
          <Card as="section" id="onboarding-delivery-governorates">
            <SectionHeader
              ruled
              eyebrow={t("sections.zones")}
              title={
                <SectionTitle icon={<IoLocationOutline className="size-4" />}>
                  {t("governorates.title")}
                </SectionTitle>
              }
              description={t("governorates.subtitle")}
              actions={
                <>
                  {governorates.length > 0 ? (
                    <Badge tone="neutral" className="tabular-nums">
                      {governorates.length}
                    </Badge>
                  ) : null}
                  {!showForm ? addZoneButton : null}
                </>
              }
            />

            {showForm ? (
              <Card variant="ghost" className="mt-3.5">
                <CardHeader
                  title={
                    editingId !== null
                      ? t("governorates.editTitle")
                      : t("governorates.addTitle")
                  }
                />

                <div className="mt-3 flex flex-col gap-3">
                  <Field
                    label={t("governorates.searchLabel")}
                    required
                    htmlFor="gov-region-search"
                    error={
                      govFormTouched && !govForm.lat.trim()
                        ? t("governorates.regionRequired")
                        : undefined
                    }
                    hint={
                      !isSearching &&
                      searchQuery.trim() &&
                      searchResults.length === 0
                        ? t("governorates.noResults")
                        : undefined
                    }
                  >
                    <div className="relative">
                      <Input
                        id="gov-region-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onBlur={() =>
                          setTimeout(() => setSearchResults([]), 200)
                        }
                        placeholder={t("governorates.searchPlaceholder")}
                        startIcon={
                          isSearching ? (
                            <Spinner size="xs" />
                          ) : (
                            <IoSearchOutline className="size-4" />
                          )
                        }
                      />

                      {/* The one place this page is allowed a shadow: the
                          results list genuinely floats above the form. */}
                      {searchResults.length > 0 ? (
                        <ul className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-raised shadow-lg">
                          {searchResults.map((r) => (
                            <li
                              key={r.place_id}
                              className="border-b border-line last:border-0"
                            >
                              <button
                                type="button"
                                onMouseDown={() => handleSelectResult(r)}
                                className="block w-full truncate px-3 py-2 text-start text-[13px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                              >
                                {r.display_name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </Field>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field
                      label={t("governorates.nameAr")}
                      required
                      error={
                        govFormTouched && !govForm.nameAr.trim()
                          ? t("governorates.required")
                          : undefined
                      }
                    >
                      <Input
                        type="text"
                        value={govForm.nameAr}
                        onChange={(e) =>
                          setGovForm((f) => ({
                            ...f,
                            nameAr: e.target.value,
                          }))
                        }
                        placeholder={t("governorates.nameArPlaceholder")}
                      />
                    </Field>
                    <Field
                      label={t("governorates.nameEn")}
                      required
                      error={
                        govFormTouched && !govForm.nameEn.trim()
                          ? t("governorates.required")
                          : undefined
                      }
                    >
                      <Input
                        type="text"
                        value={govForm.nameEn}
                        onChange={(e) =>
                          setGovForm((f) => ({
                            ...f,
                            nameEn: e.target.value,
                          }))
                        }
                        placeholder={t("governorates.nameEnPlaceholder")}
                      />
                    </Field>
                    {/* lat & lan come from the region search, never typed. */}
                    <input type="hidden" value={govForm.lat} readOnly />
                    <input type="hidden" value={govForm.lan} readOnly />
                    <Field
                      label={t("governorates.price")}
                      required
                      error={
                        govFormTouched &&
                        (!govForm.price || parseFloat(govForm.price) <= 0)
                          ? t("governorates.priceInvalid")
                          : undefined
                      }
                    >
                      <Input
                        type="number"
                        className="tabular-nums"
                        value={govForm.price}
                        onChange={(e) =>
                          setGovForm((f) => ({
                            ...f,
                            price: e.target.value,
                          }))
                        }
                        placeholder={t("governorates.pricePlaceholder")}
                      />
                    </Field>
                  </div>
                </div>

                <CardFooter className="justify-end">
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    {t("governorates.cancel")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveGov}
                    loading={isSavingGov}
                    disabled={govFormTouched && !isGovFormValid}
                    startIcon={<IoSaveOutline className="size-3.5" />}
                  >
                    {t("governorates.saveGov")}
                  </Button>
                </CardFooter>
              </Card>
            ) : null}

            {isLoadingGovs ? (
              <LoadingBlock label={t("loading")} size="md" className="mt-2" />
            ) : governorates.length > 0 ? (
              <ul className="mt-3.5 divide-y divide-line overflow-hidden rounded-lg border border-line">
                {governorates.map((gov) => (
                  <li
                    key={gov.id}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-fg">
                        {isRTL ? gov.nameAr : gov.nameEn}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {isRTL ? gov.nameEn : gov.nameAr}
                      </p>
                    </div>
                    <span className="ui-figure shrink-0 text-sm text-fg">
                      {gov.price}
                    </span>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        iconOnly
                        onClick={() => handleEditGov(gov)}
                        aria-label={t("governorates.editTitle")}
                      >
                        <IoPencilOutline className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="dangerGhost"
                        size="sm"
                        iconOnly
                        loading={deletingId === gov.id}
                        onClick={() => setGovToDelete(gov)}
                        aria-label={t("governorates.deleteBtn")}
                      >
                        <IoTrashOutline className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : !showForm ? (
              <EmptyState
                size="sm"
                className="mt-3.5"
                icon={<IoLocationOutline />}
                title={t("governorates.empty")}
                description={t("governorates.emptyHint")}
                action={addZoneButton}
              />
            ) : null}
          </Card>
        ) : null}

        {isDistanceMode ? (
          <Card as="section" id="onboarding-delivery-branches">
            <SectionHeader
              ruled
              eyebrow={t("sections.location")}
              title={
                <SectionTitle icon={<IoLocationOutline className="size-4" />}>
                  {t("branches.title")}
                </SectionTitle>
              }
              description={t("branches.subtitle")}
            />

            {isLoadingBranch ? (
              <LoadingBlock label={t("loading")} size="md" />
            ) : (
              <div className="mt-3.5 flex flex-col gap-3.5">
                <BranchLocationPicker
                  latitude={branchForm.latitude}
                  longitude={branchForm.longitude}
                  onLocationChange={(lat, lng) =>
                    setBranchForm((f) => ({
                      ...f,
                      latitude: String(lat),
                      longitude: String(lng),
                    }))
                  }
                  searchLabel={t("branches.searchLabel")}
                  searchPlaceholder={t("branches.searchPlaceholder")}
                  mapHint={t("branches.mapHint")}
                />
                {branchFormTouched && !branchForm.latitude ? (
                  <FieldError>{t("branches.locationRequired")}</FieldError>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label={t("branches.basePrice")} required>
                    <Input
                      type="number"
                      className="tabular-nums"
                      value={branchForm.deliveryBasePrice}
                      onChange={(e) =>
                        setBranchForm((f) => ({
                          ...f,
                          deliveryBasePrice: e.target.value,
                        }))
                      }
                      placeholder={t("branches.basePricePlaceholder")}
                    />
                  </Field>
                  <Field label={t("branches.pricePerKm")} required>
                    <Input
                      type="number"
                      className="tabular-nums"
                      value={branchForm.deliveryPricePerKm}
                      onChange={(e) =>
                        setBranchForm((f) => ({
                          ...f,
                          deliveryPricePerKm: e.target.value,
                        }))
                      }
                      placeholder={t("branches.pricePerKmPlaceholder")}
                    />
                  </Field>
                  <Field label={t("branches.maxRadius")} required>
                    <Input
                      type="number"
                      className="tabular-nums"
                      value={branchForm.maxDeliveryRadiusKm}
                      onChange={(e) =>
                        setBranchForm((f) => ({
                          ...f,
                          maxDeliveryRadiusKm: e.target.value,
                        }))
                      }
                      placeholder={t("branches.maxRadiusPlaceholder")}
                    />
                  </Field>
                </div>
              </div>
            )}
          </Card>
        ) : null}
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
              <span className="font-bold text-fg">
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

      <ProUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        subscriptionHref={subscriptionHref}
        featureKey="deliveryDistance"
      />
    </PageShell>
  );
}
