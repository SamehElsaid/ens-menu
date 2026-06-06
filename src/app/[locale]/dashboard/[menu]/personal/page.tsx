"use client";

import { useAppSelector } from "@/store/hooks";
import PersonalProfile from "@/components/Dashboard/PersonalProfile";
import { menuDashboardPath } from "@/lib/menuDashboardPath";
import { useTranslations } from "next-intl";

export default function PersonalProfilePage() {
    const menu = useAppSelector((state) => state.menuData.menu);
    const t = useTranslations("personalProfile");

    return (
        <PersonalProfile
            backLink={menuDashboardPath(menu, "settings")}
            backLinkText={t("backToProfile")}
        />
    );
}
