import type { ImportItem } from "@/types/menuImport";
import type { PexelsPhoto, PexelsSearchResponse } from "@/types/pexels";
import { _resizeImage } from "@/shared/_shared";
import { axiosPost } from "@/shared/axiosCall";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function getImportItemImageSearchQuery(
  item: ImportItem,
  uiLocale: string,
): string {
  return uiLocale === "ar"
    ? item.nameAr.trim() || item.nameEn.trim()
    : item.nameEn.trim() || item.nameAr.trim();
}

export function getPexelsSearchQuery(item: ImportItem): string {
  return item.nameEn.trim() || item.nameAr.trim();
}

export function buildPexelsSearchQueries(item: ImportItem): string[] {
  const seen = new Set<string>();
  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) seen.add(trimmed);
  };

  const nameEn = item.nameEn.trim();
  const nameAr = item.nameAr.trim();

  if (nameEn) {
    add(nameEn);
    add(`${nameEn} food`);
    add(`${nameEn} dish`);
    add(`${nameEn} restaurant`);
  }

  if (nameAr && nameAr !== nameEn) {
    add(nameAr);
  }

  return [...seen];
}

export function shouldAutoFetchImportItemImage(item: ImportItem): boolean {
  if (item.imageUrl) return false;
  if (
    item.variants.length === 0 &&
    item.duplicateMeta?.status === "exact_duplicate"
  ) {
    return false;
  }
  return Boolean(getPexelsSearchQuery(item));
}

export function getPexelsPhotoUrl(photo: PexelsPhoto): string {
  return (
    photo.src.large ||
    photo.src.large2x ||
    photo.src.medium ||
    photo.src.original
  );
}

export function getPexelsPhotoPreviewUrl(photo: PexelsPhoto): string {
  return photo.src.medium || photo.src.small || getPexelsPhotoUrl(photo);
}

export async function searchFirstPexelsPhoto(
  query: string,
): Promise<PexelsPhoto | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const params = new URLSearchParams({ query: trimmed, per_page: "1" });
  const response = await fetch(`/api/pexels/search?${params.toString()}`);
  if (!response.ok) return null;

  const data = (await response.json()) as PexelsSearchResponse;
  return data.photos?.[0] ?? null;
}

export async function fetchFirstPexelsImageUrl(
  item: ImportItem,
): Promise<string | null> {
  for (const query of buildPexelsSearchQueries(item)) {
    const photo = await searchFirstPexelsPhoto(query);
    if (photo) return getPexelsPhotoUrl(photo);
  }
  return null;
}

export async function uploadImportItemImageFile(
  file: File,
  locale: string,
): Promise<string | null> {
  const resized = await _resizeImage(file);
  if (resized.size > MAX_IMAGE_BYTES) return null;

  const formData = new FormData();
  formData.append("image", resized);
  const result = await axiosPost<FormData, { image: string }>(
    "/structure/image/",
    locale,
    formData,
    true,
  );

  return result.status && result.data?.image ? result.data.image : null;
}
