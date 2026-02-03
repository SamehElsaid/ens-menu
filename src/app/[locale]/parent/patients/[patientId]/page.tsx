"use client";

import { useTranslations } from "next-intl";
import FormInformation from "@/components/dashboardControls/FormInformation";
import CardDashBoard from "@/components/Card/CardDashBoard";

interface PatientDetailPageProps {
  params: Promise<{ patientId: string }>;
}

export default function PatientDetailPage({}: PatientDetailPageProps) {
  const t = useTranslations("");

  return (
    <div className="p-6">
      <CardDashBoard>
        <h1 className="text-2xl font-bold mb-6">
          {t("patients.patientInformation") || "Patient Information"}
        </h1>
        <FormInformation type="parent" />
      </CardDashBoard>
    </div>
  );
}

