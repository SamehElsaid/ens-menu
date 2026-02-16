'use client';

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiSave } from "react-icons/fi";
import { HiOutlineShare, HiOutlineMail, HiOutlineClock } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";
import CustomBtn from "@/components/Custom/CustomBtn";
import CustomInput from "@/components/Custom/CustomInput";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { axiosPatch } from "@/shared/axiosCall";
import { SET_ACTIVE_USER } from "@/store/authSlice/menuDataSlice";
import { toast } from "react-toastify";
import type { Menu } from "@/types/Menu";

function timeStringToDate(s: string): Date | null {
    if (!s || !/^\d{2}:\d{2}$/.test(s)) return null;
    const [h, m] = s.split(":").map(Number);
    return new Date(2000, 0, 1, h, m);
}

function dateToTimeString(d: Date): string {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
type DayKey = (typeof DAY_KEYS)[number];

type SocialKey = "facebook" | "instagram" | "twitter" | "whatsapp";

interface SocialLinkRow {
    id: SocialKey;
    value: string;
}

const INITIAL_SOCIAL: SocialLinkRow[] = [
    { id: "facebook", value: "https://facebook.com/yourpage" },
    { id: "instagram", value: "https://instagram.com/yourprofile" },
    { id: "twitter", value: "https://twitter.com/your.handle" },
    { id: "whatsapp", value: "+96550251587" },
];

/** Work hours shape: { [day]: { open, close, closed } } */
export interface DaySchedule {
    open: string;
    close: string;
    closed: boolean;
}

export type WorkHours = Record<DayKey, DaySchedule>;

const INITIAL_WORK_HOURS: WorkHours = Object.fromEntries(
    DAY_KEYS.map((day) => [
        day,
        { open: "", close: "", closed: false },
    ])
) as WorkHours;

const SocialIcons: Record<SocialKey, React.ElementType> = {
    facebook: FaFacebookF,
    instagram: FaInstagram,
    twitter: FaTwitter,
    whatsapp: FaWhatsapp,
};

const socialIconColors: Record<SocialKey, string> = {
    facebook: "text-[#1877F2] bg-[#1877F2]/10",
    instagram: "text-pink-500 bg-pink-500/10",
    twitter: "text-emerald-600 bg-emerald-500/10",
    whatsapp: "text-[#25D366] bg-[#25D366]/10",
};

export default function MediaPage() {
    const locale = useLocale();
    const isRTL = locale === "ar";
    const t = useTranslations("settingsMediaPage");

    const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>(INITIAL_SOCIAL);
    const [contact, setContact] = useState({
        addressAr: "",
        addressEn: "",
        phone: "",
    });
    const [workHours, setWorkHours] = useState<WorkHours>(INITIAL_WORK_HOURS);
    const [isSaving, setIsSaving] = useState(false);

    const dispatch = useAppDispatch();
    const { menu } = useAppSelector((state) => state.menuData);

    useEffect(() => {
        if (menu) {
            const socialLinks = [
                { id: "facebook", value: menu.socialFacebook ?? "https://facebook.com/yourpage" },
                { id: "instagram", value: menu.socialInstagram ?? "https://instagram.com/yourprofile" },
                { id: "twitter", value: menu.socialTwitter ?? "https://twitter.com/your.handle" },
                { id: "whatsapp", value: menu.socialWhatsapp ?? "+96550251587" },
            ];
            setSocialLinks(socialLinks as SocialLinkRow[]);
            const menuContact = (menu as { addressAr?: string; addressEn?: string; phone?: string });
            setContact({
                addressAr: menuContact.addressAr ?? "",
                addressEn: menuContact.addressEn ?? "",
                phone: menuContact.phone ?? "",
            });
            setWorkHours(menu.workingHours as WorkHours ?? INITIAL_WORK_HOURS);
        }
    }, [menu]);

    const updateSocial = (id: SocialKey, value: string) => {
        setSocialLinks((prev) => prev.map((row) => (row.id === id ? { ...row, value } : row)));
    };

    const updateWorkHour = (day: DayKey, field: "open" | "close", value: string) => {
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
            toast.error(locale === "ar" ? "لم يتم تحديد قائمة." : "No menu selected.");
            return;
        }
        const socialByKey = Object.fromEntries(
            socialLinks.map((row) => [row.id, row.value])
        ) as Record<SocialKey, string>;
        const payload = {
            socialFacebook: socialByKey.facebook,
            socialInstagram: socialByKey.instagram,
            socialTwitter: socialByKey.twitter,
            socialWhatsapp: socialByKey.whatsapp,
            addressAr: contact.addressAr,
            addressEn: contact.addressEn,
            phone: contact.phone,
            workingHours: workHours,
        };
        setIsSaving(true);
        try {
            const result = await axiosPatch<typeof payload, Menu>(
                `/menus/${menu.id}`,
                locale,
                payload
            );
            if (result.status) {
                const updatedMenu = { ...menu, ...payload };
                dispatch(SET_ACTIVE_USER(updatedMenu as Menu));
                toast.success(
                    locale === "ar" ? "تم حفظ إعدادات الميديا بنجاح." : "Media settings saved successfully."
                );
            }
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="min-h-[calc(100vh-160px)]">
            <header className={isRTL ? "text-right space-y-1" : "text-left space-y-1 mb-8"}>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold">
                    <HiOutlineShare className="text-sm" />
                    <span>{t("badge")}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {t("title")}
                </h1>
            </header>

            <div className="space-y-6 ">
                {/* Social media links */}
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                            <HiOutlineShare className="text-lg text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("socialLinks.title")}</h2>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {socialLinks.map((row) => {
                            const Icon = SocialIcons[row.id];
                            const colorClass = socialIconColors[row.id];
                            const labelKey = `socialLinks.${row.id}` as const;
                            return (
                                <div
                                    key={row.id}
                                    className="flex items-center gap-3 flex-wrap"
                                >
                                    <div
                                        className={`h-10 w-10 min-w-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
                                    >
                                        <Icon className="text-lg" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 shrink-0">
                                        {t(labelKey)}
                                    </span>
                                    <div className="flex-1 min-w-[180px]">
                                        <CustomInput
                                            type={row.id === "whatsapp" ? "tel" : "text"}
                                            value={row.value}
                                            onChange={(e) => updateSocial(row.id, e as unknown as string)}
                                            placeholder={row.id === "whatsapp" ? "+965..." : `https://${row.id}.com/...`}
                                        />
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                    <div className="rounded-xl flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 p-3">
                        <span className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">ℹ</span>
                        <p className="text-xs text-blue-800 dark:text-blue-200">{t("socialLinks.note")}</p>
                    </div>
                </section>

                {/* Contact information */}
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <HiOutlineMail className="text-lg text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("contact.title")}</h2>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-1">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("contact.addressAr")}</label>
                            <CustomInput
                                type="text"
                                value={contact.addressAr}
                                onChange={(e) => setContact((c) => ({ ...c, addressAr: e.target.value }))}
                                placeholder={isRTL ? "العنوان بالعربية" : "Address in Arabic"}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("contact.addressEn")}</label>
                            <CustomInput
                                type="text"
                                value={contact.addressEn}
                                onChange={(e) => setContact((c) => ({ ...c, addressEn: e.target.value }))}
                                placeholder={isRTL ? "Address in English" : "العنوان بالإنجليزية"}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("contact.phone")}</label>
                            <CustomInput
                                type="tel"
                                value={contact.phone || undefined}
                                onChange={(val) =>
                                    setContact((c) => ({
                                        ...c,
                                        phone: (val as unknown as string | undefined) ?? "",
                                    }))
                                }
                                placeholder={t("contact.phonePlaceholder")}
                            />
                        </div>
                    </div>
                </section>

                {/* Business hours */}
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <HiOutlineClock className="text-lg text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("businessHours.title")}</h2>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {DAY_KEYS.map((day) => {
                            const row = workHours[day];
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
                                                        val instanceof Date ? dateToTimeString(val) : ""
                                                    )
                                                }
                                                placeholder="--:--"
                                                disabled={isClosed}
                                            />
                                        </div>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm shrink-0">{t("businessHours.to")}</span>
                                        <div className="flex-1 min-w-0">
                                            <CustomInput
                                                type="time"
                                                value={timeStringToDate(row.close)}
                                                onChange={(val) =>
                                                    updateWorkHour(
                                                        day,
                                                        "close",
                                                        val instanceof Date ? dateToTimeString(val) : ""
                                                    )
                                                }
                                                placeholder="--:--"
                                                disabled={isClosed}
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isClosed}
                                            onChange={(e) => setDayClosed(day, e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-primary focus:ring-primary/20"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{t("businessHours.closed")}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className="rounded-xl flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 p-3">
                        <span className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">ℹ</span>
                        <p className="text-xs text-blue-800 dark:text-blue-200">{t("businessHours.note")}</p>
                    </div>
                </section>

                {/* Footer actions */}
                <div className="flex flex-wrap justify-end gap-3 pt-2 pb-6">

                    <CustomBtn
                        onClick={handleSave}
                        loading={isSaving}
                        disabled={isSaving}
                        className="w-auto! min-w-[160px]"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <FiSave className="text-base" />
                            {t("buttons.save")}
                        </span>
                    </CustomBtn>
                </div>
            </div>
        </div>
    );
}
