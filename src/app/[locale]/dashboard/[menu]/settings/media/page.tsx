"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiSave } from "react-icons/fi";
import {
  HiOutlineShare,
  HiOutlineMail,
  HiOutlineClock,
  HiOutlineWifi,
} from "react-icons/hi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import CustomInput from "@/components/Custom/CustomInput";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Switch,
} from "@/components/ui";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { axiosPatch } from "@/shared/axiosCall";
import { SET_ACTIVE_USER } from "@/store/authSlice/menuDataSlice";
import { toast } from "react-toastify";
import type { Menu } from "@/types/Menu";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { normalizeExternalUrl } from "@/lib/normalizeExternalUrl";

function timeStringToDate(s: string): Date | null {
  if (!s || !/^\d{2}:\d{2}$/.test(s)) return null;
  const [h, m] = s.split(":").map(Number);
  return new Date(2000, 0, 1, h, m);
}

function dateToTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
type DayKey = (typeof DAY_KEYS)[number];

type SocialKey = "facebook" | "instagram" | "twitter" | "whatsapp";

const SOCIAL_URL_PLACEHOLDERS: Record<Exclude<SocialKey, "whatsapp">, string> =
  {
    facebook: "https://www.facebook.com/...",
    instagram: "https://www.instagram.com/...",
    twitter: "https://x.com/...",
  };

interface SocialLinkRow {
  id: SocialKey;
  value: string;
}

const INITIAL_SOCIAL: SocialLinkRow[] = [
  { id: "facebook", value: "" },
  { id: "instagram", value: "" },
  { id: "twitter", value: "" },
  { id: "whatsapp", value: "" },
];

/** Work hours shape: { [day]: { open, close, closed } } */
export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export type WorkHours = Record<DayKey, DaySchedule>;

const INITIAL_WORK_HOURS: WorkHours = Object.fromEntries(
  DAY_KEYS.map((day) => [day, { open: "", close: "", closed: false }]),
) as WorkHours;

function normalizeWorkHours(raw: unknown): WorkHours {
  const source =
    raw && typeof raw === "object" ? (raw as Partial<WorkHours>) : {};
  return Object.fromEntries(
    DAY_KEYS.map((day) => {
      const entry = source[day];
      return [
        day,
        {
          open: typeof entry?.open === "string" ? entry.open : "",
          close: typeof entry?.close === "string" ? entry.close : "",
          closed: entry?.closed === true,
        },
      ];
    }),
  ) as WorkHours;
}

const SocialIcons: Record<SocialKey, React.ElementType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  twitter: FaTwitter,
  whatsapp: FaWhatsapp,
};

const socialIconColors: Record<SocialKey, string> = {
  facebook: "text-[#1877F2] bg-[#1877F2]/10",
  instagram: "text-pink-500 bg-pink-500/10",
  twitter: "text-[#1DA1F2] bg-[#1DA1F2]/10",
  whatsapp: "text-[#25D366] bg-[#25D366]/10",
};

export default function MediaPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("settingsMediaPage");

  const [socialLinks, setSocialLinks] =
    useState<SocialLinkRow[]>(INITIAL_SOCIAL);
  const [contact, setContact] = useState({
    addressAr: "",
    addressEn: "",
    phone: "",
  });
  const [wifi, setWifi] = useState({
    wifiEnabled: false,
    wifiName: "",
    wifiPassword: "",
  });
  const [workHours, setWorkHours] = useState<WorkHours>(INITIAL_WORK_HOURS);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();
  const { menu } = useAppSelector((state) => state.menuData);

  useEffect(() => {
    if (menu) {
      const socialLinks = [
        { id: "facebook", value: menu.socialFacebook ?? "" },
        { id: "instagram", value: menu.socialInstagram ?? "" },
        { id: "twitter", value: menu.socialTwitter ?? "" },
        { id: "whatsapp", value: menu.socialWhatsapp ?? "" },
      ];
      setSocialLinks(socialLinks as SocialLinkRow[]);
      const menuContact = menu as {
        addressAr?: string;
        addressEn?: string;
        phone?: string;
      };
      setContact({
        addressAr: menuContact.addressAr ?? "",
        addressEn: menuContact.addressEn ?? "",
        phone: menuContact.phone ?? "",
      });
      setWifi({
        wifiEnabled: menu.wifiEnabled === true,
        wifiName: menu.wifiName ?? "",
        wifiPassword: menu.wifiPassword ?? "",
      });
      setWorkHours(normalizeWorkHours(menu.workingHours));
    }
  }, [menu]);

  const updateSocial = (id: SocialKey, value: string) => {
    setSocialLinks((prev) =>
      prev.map((row) => (row.id === id ? { ...row, value } : row)),
    );
  };

  const updateWorkHour = (
    day: DayKey,
    field: "open" | "close",
    value: string,
  ) => {
    setWorkHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const setDayClosed = (day: DayKey, closed: boolean) => {
    setWorkHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], closed },
    }));
  };

  const handleSave = async () => {
    if (!menu?.id) {
      toast.error(t("noMenuSelected"));
      return;
    }
    const socialByKey = Object.fromEntries(
      socialLinks.map((row) => {
        const trimmed = row.value.trim();
        if (!trimmed) return [row.id, ""];
        if (row.id === "whatsapp") return [row.id, trimmed];
        return [row.id, normalizeExternalUrl(trimmed)];
      }),
    ) as Record<SocialKey, string>;
    const payload = {
      socialFacebook: socialByKey.facebook,
      socialInstagram: socialByKey.instagram,
      socialTwitter: socialByKey.twitter,
      socialWhatsapp: socialByKey.whatsapp,
      addressAr: contact.addressAr,
      addressEn: contact.addressEn,
      phone: contact.phone,
      wifiEnabled: wifi.wifiEnabled,
      wifiName: wifi.wifiName,
      wifiPassword: wifi.wifiPassword,
      workingHours: workHours,
    };
    setIsSaving(true);
    try {
      const result = await axiosPatch<typeof payload, Menu>(
        `/menus/${menu.id}`,
        locale,
        payload,
      );
      if (result.status) {
        const updatedMenu = { ...menu, ...payload };
        dispatch(SET_ACTIVE_USER(updatedMenu as Menu));
        toast.success(t("savedSuccess"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)]">
      <header
        id="onboarding-media-header"
        className={isRTL ? "text-right space-y-1" : "text-left space-y-1 mb-8"}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold">
          <HiOutlineShare className="text-sm" />
          <span>{t("badge")}</span>
        </div>
        <PageTitleWithHelp className="my-4 ">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h1>
        </PageTitleWithHelp>
      </header>

      <div className="space-y-6 ">
        {/* Social media links */}
        <section
          id="onboarding-media-social"
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <HiOutlineShare className="text-lg text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t("socialLinks.title")}
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {socialLinks.map((row) => {
              const Icon = SocialIcons[row.id];
              const colorClass = socialIconColors[row.id];
              const labelKey = `socialLinks.${row.id}` as const;
              return (
                <div key={row.id} className="flex items-center gap-3 flex-wrap">
                  <div
                    className={`h-10 w-10 min-w-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
                  >
                    <Icon className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <Field label={t(labelKey)}>
                      {row.id === "whatsapp" ? (
                        <CustomInput
                          type="tel"
                          value={row.value}
                          onChange={(val) =>
                            updateSocial(
                              row.id,
                              (val as unknown as string | undefined) ?? "",
                            )
                          }
                          placeholder="123-456-7890"
                        />
                      ) : (
                        <Input
                          type="text"
                          value={row.value}
                          onChange={(e) =>
                            updateSocial(row.id, e.target.value)
                          }
                          onBlur={() => {
                            const trimmed = row.value.trim();
                            if (!trimmed) return;
                            updateSocial(row.id, normalizeExternalUrl(trimmed));
                          }}
                          placeholder={SOCIAL_URL_PLACEHOLDERS[row.id]}
                        />
                      )}
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 p-3">
            <span className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              ℹ
            </span>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              {t("socialLinks.note")}
            </p>
          </div>
        </section>

        {/* Contact information */}
        <section
          id="onboarding-media-contact"
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <HiOutlineMail className="text-lg text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t("contact.title")}
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <Field label={t("contact.addressAr")}>
              <Input
                type="text"
                value={contact.addressAr}
                onChange={(e) =>
                  setContact((c) => ({ ...c, addressAr: e.target.value }))
                }
                placeholder={t("addressArPlaceholder")}
              />
            </Field>
            <Field label={t("contact.addressEn")}>
              <Input
                type="text"
                value={contact.addressEn}
                onChange={(e) =>
                  setContact((c) => ({ ...c, addressEn: e.target.value }))
                }
                placeholder={t("addressEnPlaceholder")}
              />
            </Field>
            <Field label={t("contact.phone")}>
              <CustomInput
                type="tel"
                value={contact.phone}
                onChange={(val) =>
                  setContact((c) => ({
                    ...c,
                    phone: (val as unknown as string | undefined) ?? "",
                  }))
                }
                placeholder={t("contact.phonePlaceholder")}
              />
            </Field>
          </div>
        </section>

        {/* Wi‑Fi (optional) */}
        <section
          id="onboarding-media-wifi"
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <HiOutlineWifi className="text-lg text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {t("wifi.title")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("wifi.description")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {wifi.wifiEnabled ? t("wifi.enabledOn") : t("wifi.enabledOff")}
              </span>
            <Switch
              checked={wifi.wifiEnabled}
              onChange={(e) =>
                setWifi((prev) => ({
                  ...prev,
                  wifiEnabled: e.target.checked,
                }))
              }
              aria-label={t("wifi.enabled")}
            />
            </div>
          </div>

          {wifi.wifiEnabled && (
            <div className="grid gap-4 sm:grid-cols-1">
              <Field label={t("wifi.name")}>
                <Input
                  type="text"
                  value={wifi.wifiName}
                  onChange={(e) =>
                    setWifi((prev) => ({
                      ...prev,
                      wifiName: e.target.value,
                    }))
                  }
                  placeholder={t("wifi.namePlaceholder")}
                />
              </Field>
              <Field label={t("wifi.password")}>
                <Input
                  type="text"
                  value={wifi.wifiPassword}
                  onChange={(e) =>
                    setWifi((prev) => ({
                      ...prev,
                      wifiPassword: e.target.value,
                    }))
                  }
                  placeholder={t("wifi.passwordPlaceholder")}
                />
              </Field>
            </div>
          )}
        </section>

        {/* Business hours */}
        <section
          id="onboarding-media-hours"
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <HiOutlineClock className="text-lg text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t("businessHours.title")}
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {DAY_KEYS.map((day) => {
              const row = workHours[day] ?? INITIAL_WORK_HOURS[day];
              const isClosed = row.closed;
              return (
                <div
                  key={day}
                  className={`flex flex-wrap items-center gap-2 sm:gap-3 ${isClosed ? "opacity-75" : ""}`}
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 shrink-0">
                    {t(`businessHours.days.${day}`)}
                  </span>
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <div className="flex-1 min-w-0">
                      <CustomInput
                        type="time"
                        value={timeStringToDate(row.open)}
                        onChange={(val) =>
                          updateWorkHour(
                            day,
                            "open",
                            val instanceof Date ? dateToTimeString(val) : "",
                          )
                        }
                        placeholder="--:--"
                        disabled={isClosed}
                      />
                    </div>
                    <span className="text-fg-muted text-sm shrink-0">
                      {t("businessHours.to")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <CustomInput
                        type="time"
                        value={timeStringToDate(row.close)}
                        onChange={(val) =>
                          updateWorkHour(
                            day,
                            "close",
                            val instanceof Date ? dateToTimeString(val) : "",
                          )
                        }
                        placeholder="--:--"
                        disabled={isClosed}
                      />
                    </div>
                  </div>
                  <Checkbox
                    checked={isClosed}
                    onChange={(e) => setDayClosed(day, e.target.checked)}
                    label={t("businessHours.closed")}
                  />
                </div>
              );
            })}
          </div>

          <div className="rounded-xl flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 p-3">
            <span className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              ℹ
            </span>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              {t("businessHours.note")}
            </p>
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex flex-wrap justify-end gap-3 pt-2 pb-6">
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving}
            size="lg"
            className="w-auto! min-w-[160px]"
            startIcon={<FiSave className="text-base" />}
          >
            {t("buttons.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
