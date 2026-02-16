"use client";

import PersonalProfile from "@/components/Dashboard/PersonalProfile";
import { useTranslations } from "next-intl";

export default function AdminPersonalPage() {
    const t = useTranslations("personalProfile");

    return (
        <PersonalProfile
            backLink="/admin"
            backLinkText={t("backToProfile")}
        />
    );
}
