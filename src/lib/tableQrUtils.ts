import { publicMenuQrUrl } from "@/lib/publicMenuUrl";

export function tablePublicMenuUrl(
  slug: string | undefined | null,
  tableNumber: string,
): string {
  return publicMenuQrUrl(slug, { table: tableNumber });
}

export function safeTableFilenameSegment(tableNumber: string): string {
  return (
    String(tableNumber)
      .replace(/[\\/:*?"<>|]/g, "-")
      .trim()
      .slice(0, 80) || "table"
  );
}
