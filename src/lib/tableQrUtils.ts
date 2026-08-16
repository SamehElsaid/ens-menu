import { publicMenuQrUrl } from "@/lib/publicMenuUrl";

export function tablePublicMenuUrl(
  slug: string | undefined | null,
  tableNumber: string,
  sessionSecret?: string,
): string {
  const url = publicMenuQrUrl(slug, { table: tableNumber });
  if (!url || !sessionSecret) return url;
  const parsed = new URL(url);
  parsed.searchParams.set("tableSession", sessionSecret);
  return parsed.toString();
}

export function safeTableFilenameSegment(tableNumber: string): string {
  return (
    String(tableNumber)
      .replace(/[\\/:*?"<>|]/g, "-")
      .trim()
      .slice(0, 80) || "table"
  );
}
