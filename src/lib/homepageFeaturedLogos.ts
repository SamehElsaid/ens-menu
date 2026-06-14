export type HomepageFeaturedLogo = {
  id: number;
  menuId: number;
  userId: number;
  logo: string;
  countryCode: string | null;
  sortOrder: number;
  createdAt: string;
};

function normalizeLogoUrl(logo: string): string {
  const trimmed = logo.trim();
  if (!trimmed) return trimmed;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/api\/?$/, "") ?? "";
  if (!base) return trimmed;
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

function parseLogosResponse(json: unknown): HomepageFeaturedLogo[] {
  if (!json || typeof json !== "object") return [];
  const payload = json as { success?: boolean; logos?: HomepageFeaturedLogo[] };
  if (!payload.success || !Array.isArray(payload.logos)) return [];

  return payload.logos.map((item) => ({
    ...item,
    logo: normalizeLogoUrl(item.logo),
  }));
}

export async function fetchHomepageFeaturedLogosClient(): Promise<
  HomepageFeaturedLogo[]
> {
  const apiBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!apiBase) return [];

  try {
    const res = await fetch(`${apiBase}/public/homepage-featured-logos`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    return parseLogosResponse(await res.json());
  } catch {
    return [];
  }
}
