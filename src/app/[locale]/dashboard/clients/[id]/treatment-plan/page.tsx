"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CardDashBoard from "@/components/Card/CardDashBoard";
import Editor from "@/components/Editor";

interface TreatmentPlanPageProps {
  params: Promise<{ id: string }>;
}

export default function TreatmentPlanPage({
  params,
}: TreatmentPlanPageProps) {
  const t = useTranslations("");
  const [clientId, setClientId] = useState<string>("");
  const [treatmentPlanContent, setTreatmentPlanContent] = useState<string>("");
  const [loadingSave, setLoadingSave] = useState<boolean>(false);

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setClientId(resolvedParams.id);
    });
  }, [params]);

  const handleEditorChange = (content: string) => {
    setTreatmentPlanContent(content);
    // Here you can add API call to save the content
    // Example: saveTreatmentPlan(clientId, content);
  };

  return (
    <CardDashBoard>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("treatmentPlan.title") || "Treatment Plan"}
        </h1>
        <p className="text-gray-500">
          {t("treatmentPlan.description") ||
            "Create and manage the treatment plan for this client"}
        </p>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t("treatmentPlan.content") || "Treatment Plan Content"}
        </label>
        <Editor
          initialTemplateName={treatmentPlanContent}
          onChange={handleEditorChange}
          loadingSave={loadingSave}
          setLoadingSave={setLoadingSave}
        />
      </div>
    </CardDashBoard>
  );
}

