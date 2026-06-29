import { encryptDataApi } from "@/shared/encryption";

export interface PageMetadata {
  pageName: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  keywordsAr: string;
  keywordsEn: string;
}

export async function fetchPageMetadata(
  pageName: string,
): Promise<PageMetadata | null> {
  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
    if (!secretKey) return null;

    const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
    const apiKey = `${secretKey}///${utcTimestamp}`;
    const apiKeyEncrypt = encryptDataApi(apiKey, secretKey);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/metaData/${pageName}`,
      {
        headers: {
          "X-API-KEY": apiKeyEncrypt,
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const payload = json?.data ?? json;
    return payload as PageMetadata;
  } catch {
    return null;
  }
}

export function resolveMetaField(
  meta: PageMetadata | null,
  locale: string,
  field: "title" | "description" | "keywords",
  fallback: string,
): string {
  if (!meta) return fallback;
  const fieldMap = {
    title: locale === "ar" ? meta.titleAr : meta.titleEn,
    description: locale === "ar" ? meta.descriptionAr : meta.descriptionEn,
    keywords: locale === "ar" ? meta.keywordsAr : meta.keywordsEn,
  };
  return fieldMap[field] || fallback;
}
