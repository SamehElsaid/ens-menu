import { encryptDataApi } from "@/shared/encryption";

export const PAGE_LIMIT = 10;

export interface ArticleListItem {
  id: number;
  titleAr: string;
  titleEn: string;
}

export interface ArticleDetail extends ArticleListItem {
  descriptionAr: string;
  descriptionEn: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KbPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function buildApiKeyHeader(): string | null {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
  if (!secretKey) return null;
  const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `${secretKey}///${utcTimestamp}`;
  return encryptDataApi(apiKey, secretKey);
}

/** Server-side fetch of a single article by id — used to SSR both the metadata and the body. */
export async function fetchArticleDetail(
  id: number,
  locale: string,
): Promise<ArticleDetail | null> {
  try {
    const apiKeyEncrypt = buildApiKeyHeader();
    if (!apiKeyEncrypt) return null;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/searchInformation/${id}`,
      {
        headers: {
          "X-API-KEY": apiKeyEncrypt,
          "Accept-Language": locale,
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data as (Partial<ArticleDetail> & { id?: number }) | undefined;
    if (!data) return null;

    return {
      id: data.id ?? id,
      titleAr: data.titleAr ?? "",
      titleEn: data.titleEn ?? "",
      descriptionAr: data.descriptionAr ?? "",
      descriptionEn: data.descriptionEn ?? "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch {
    return null;
  }
}

/** Server-side fetch of the first page of the article list — used to SSR the KB sidebar/listing. */
export async function fetchArticleList(
  locale: string,
  page = 1,
  limit = 10,
): Promise<{ items: ArticleListItem[]; pagination: KbPagination } | null> {
  try {
    const apiKeyEncrypt = buildApiKeyHeader();
    if (!apiKeyEncrypt) return null;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/searchInformation?page=${page}&limit=${limit}`,
      {
        headers: {
          "X-API-KEY": apiKeyEncrypt,
          "Accept-Language": locale,
        },
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const items = Array.isArray(json?.data) ? (json.data as ArticleListItem[]) : [];
    const pagination: KbPagination = json?.pagination ?? {
      total: items.length,
      page,
      limit,
      totalPages: 1,
    };
    return { items, pagination };
  } catch {
    return null;
  }
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
