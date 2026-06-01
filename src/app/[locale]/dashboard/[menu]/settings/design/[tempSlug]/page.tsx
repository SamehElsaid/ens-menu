"use client";

import { useParams } from "next/navigation";
import TemplateDesignCustomizePanel from "@/components/Settings/TemplateDesignCustomizePanel";

export default function TemplateDesignCustomizePage() {
  const params = useParams<{ tempSlug: string }>();
  const tempSlug = (params?.tempSlug as string) || "default";

  return <TemplateDesignCustomizePanel tempSlug={tempSlug} />;
}
