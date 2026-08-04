import { axiosGet } from "@/shared/axiosCall";
import type { TemplateInfo } from "@/types/types";

type PublishedTemplateApiItem = {
  id: string;
  name: string;
  slug: string;
  colors?: string[];
  updatedAt?: string;
  publishedAt?: string | null;
};

/** Map published builder docs → design picker cards. */
export function publishedToTemplateInfo(
  item: PublishedTemplateApiItem,
): TemplateInfo {
  const colors =
    Array.isArray(item.colors) && item.colors.length >= 1
      ? item.colors
      : ["#7000B5", "#9B30FF"];

  return {
    id: item.id,
    name: item.name,
    nameAr: item.name,
    image: "",
    hidePreviewImage: true,
    description: "Custom full-control template from the template builder",
    descriptionAr: "قالب مخصص بتحكم كامل من منشئ القوالب",
    isNew: true,
    canEdit: false,
    slug: item.slug || "builder",
    colors,
    defaultColors: colors,
    isFree: false,
    isBuilder: true,
  };
}

export async function fetchPublishedDesignTemplates(
  locale: string,
): Promise<TemplateInfo[]> {
  const result = await axiosGet<{ templates?: PublishedTemplateApiItem[] }>(
    "/public/templates",
    locale,
    undefined,
    undefined,
    true,
  );
  if (!result.status || !Array.isArray(result.data?.templates)) {
    return [];
  }
  return result.data.templates.map(publishedToTemplateInfo);
}

export function isThemeAllowedForTemplate(
  template: Pick<TemplateInfo, "id" | "isBuilder">,
  allowedThemes: string[],
): boolean {
  if (template.isBuilder) {
    return allowedThemes.includes("builder");
  }
  return allowedThemes.includes(template.id);
}
