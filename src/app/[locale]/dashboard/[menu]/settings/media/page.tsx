"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiSave } from "react-icons/fi";
import type { IconType } from "react-icons";
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
  Alert,
  Badge,
  Button,
  Card,
  CardDivider,
  Checkbox,
  Field,
  Input,
  PageShell,
  SectionHeader,
  Switch,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { axiosPut } from "@/shared/axiosCall";
import { SET_ACTIVE_MENU_CACHE } from "@/store/authSlice/menuDataSlice";
import { toast } from "react-toastify";
import type { Menu } from "@/types/Menu";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { menuDashboardPath } from "@/lib/menuDashboardPath";
import { useApiAction } from "@/hooks/useApiAction";
import {
  normalizeSocialLink,
  normalizeSocialLinks,
} from "@/lib/socialLinks";

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

const SOCIAL_URL_PLACEHOLDERS: Record<
  Exclude<SocialKey, "whatsapp">,
  string
> = {
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

const SocialIcons: Record<SocialKey, IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  twitter: FaTwitter,
  whatsapp: FaWhatsapp,
};

/**
 * Platform hues are kept because they identify a third-party service rather
 * than signalling state — the one exception to the product's single-accent
 * rule. The tinted tiles they used to sit in are gone: four coloured squares
 * down the inline start of a form read as four different kinds of field.
 */
const socialIconColors: Record<SocialKey, string> = {
  facebook: "text-[#1877F2]",
  instagram: "text-[#E1306C]",
  twitter: "text-[#1DA1F2]",
  whatsapp: "text-[#25D366]",
};

/** Ruled row grid: day, open, close, closed. */
const HOURS_ROW = "sm:grid-cols-[7rem_1fr_1fr_auto]";

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

export default function MediaPage() {
  const locale = useLocale();
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
  const { runApiAction } = useApiAction();

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
    const socialByKey = normalizeSocialLinks(socialLinks);
    if (!socialByKey) {
      toast.error(t("socialLinks.invalid"));
      return;
    }
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
      await runApiAction(
        () =>
          axiosPut<typeof payload, Menu>(
            `/menus/${menu.id}`,
            locale,
            payload,
          ),
        {
          successToast: t("savedSuccess"),
          errorToast: ({ error }) => error,
          onSuccess: () => {
            const updatedMenu = { ...menu, ...payload };
            dispatch(SET_ACTIVE_MENU_CACHE(updatedMenu as Menu));
          },
        },
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell
      kind="detail"
      header={
        <PageTitleWithHelp
          id="onboarding-media-header"
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
        />
      }
      /* Four sections ending in a seven-row week table: the save button has to
         stay reachable from the last field, not scroll away at the top. */
      footerSticky
      footer={
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            loading={isSaving}
            startIcon={<FiSave className="size-3.5" />}
          >
            {t("buttons.save")}
          </Button>
        </div>
      }
    >
      <Card as="section" id="onboarding-media-social">
        <SectionHeader
          ruled
          eyebrow={t("sections.social")}
          title={
            <SectionTitle icon={<HiOutlineShare className="size-4" />}>
              {t("socialLinks.title")}
            </SectionTitle>
          }
        />

        <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {socialLinks.map((row) => {
            const Icon = SocialIcons[row.id];
            const labelKey = `socialLinks.${row.id}` as const;
            return (
              <Field key={row.id} label={t(labelKey)}>
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
                    onChange={(e) => updateSocial(row.id, e.target.value)}
                    onBlur={() => {
                      const trimmed = row.value.trim();
                      if (!trimmed) return;
                      const normalized = normalizeSocialLink(row.id, trimmed);
                      if (normalized === null) {
                        toast.error(t("socialLinks.invalid"));
                        return;
                      }
                      updateSocial(row.id, normalized);
                    }}
                    placeholder={SOCIAL_URL_PLACEHOLDERS[row.id]}
                    startIcon={
                      <Icon
                        className={cn("size-3.5", socialIconColors[row.id])}
                      />
                    }
                  />
                )}
              </Field>
            );
          })}
        </div>

        <CardDivider />

        <Alert tone="info">{t("socialLinks.note")}</Alert>
      </Card>

      <Card as="section" id="onboarding-media-contact">
        <SectionHeader
          ruled
          eyebrow={t("sections.contact")}
          title={
            <SectionTitle icon={<HiOutlineMail className="size-4" />}>
              {t("contact.title")}
            </SectionTitle>
          }
        />

        <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </Card>

      <Card as="section" id="onboarding-media-wifi">
        <SectionHeader
          ruled
          eyebrow={t("sections.wifi")}
          title={
            <SectionTitle icon={<HiOutlineWifi className="size-4" />}>
              {t("wifi.title")}
            </SectionTitle>
          }
          actions={
            <Badge tone={wifi.wifiEnabled ? "accent" : "neutral"} dot>
              {wifi.wifiEnabled ? t("wifi.enabledOn") : t("wifi.enabledOff")}
            </Badge>
          }
        />

        <div className="mt-3.5">
          <Switch
            align="between"
            label={t("wifi.enabled")}
            hint={t("wifi.description")}
            checked={wifi.wifiEnabled}
            onChange={(e) =>
              setWifi((prev) => ({
                ...prev,
                wifiEnabled: e.target.checked,
              }))
            }
          />
        </div>

        {wifi.wifiEnabled ? (
          <>
            <CardDivider />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </>
        ) : null}
      </Card>

      <Card as="section" id="onboarding-media-hours">
        <SectionHeader
          ruled
          eyebrow={t("sections.hours")}
          title={
            <SectionTitle icon={<HiOutlineClock className="size-4" />}>
              {t("businessHours.title")}
            </SectionTitle>
          }
        />

        {/* The week is a ruled list with mono column headers from `sm`, so the
            per-field labels only need to be visible while the row is stacked. */}
        <div className="mt-3.5 overflow-hidden rounded-lg border border-line">
          <div
            className={cn(
              "hidden bg-surface-2 px-3 py-2 sm:grid sm:items-center sm:gap-3",
              HOURS_ROW,
            )}
          >
            <p className="ui-label">{t("businessHours.day")}</p>
            <p className="ui-label">{t("businessHours.open")}</p>
            <p className="ui-label">{t("businessHours.close")}</p>
            <span />
          </div>

          <ul className="divide-y divide-line">
            {DAY_KEYS.map((day) => {
              const row = workHours[day] ?? INITIAL_WORK_HOURS[day];
              const isClosed = row.closed;
              const openId = `work-hours-${day}-open`;
              const closeId = `work-hours-${day}-close`;
              return (
                <li
                  key={day}
                  className={cn(
                    "grid grid-cols-1 gap-2.5 px-3 py-3 sm:items-center sm:gap-3 sm:py-2.5",
                    HOURS_ROW,
                    isClosed && "bg-surface-2/50",
                  )}
                >
                  <span className="text-[13px] font-medium text-fg">
                    {t(`businessHours.days.${day}`)}
                  </span>

                  <Field
                    label={t("businessHours.open")}
                    labelClassName="sm:sr-only"
                    htmlFor={openId}
                  >
                    <CustomInput
                      id={openId}
                      type="time"
                      size="small"
                      className="tabular-nums"
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
                  </Field>

                  <Field
                    label={t("businessHours.close")}
                    labelClassName="sm:sr-only"
                    htmlFor={closeId}
                  >
                    <CustomInput
                      id={closeId}
                      type="time"
                      size="small"
                      className="tabular-nums"
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
                  </Field>

                  <Checkbox
                    checked={isClosed}
                    onChange={(e) => setDayClosed(day, e.target.checked)}
                    label={t("businessHours.closed")}
                    wrapperClassName="sm:ps-1"
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <CardDivider />

        <Alert tone="info">{t("businessHours.note")}</Alert>
      </Card>
    </PageShell>
  );
}
