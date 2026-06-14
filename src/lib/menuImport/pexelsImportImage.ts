import type { ImportCategory, ImportItem } from "@/types/menuImport";
import type { PexelsPhoto } from "@/types/pexels";
import { _resizeImage } from "@/shared/_shared";
import { axiosPost } from "@/shared/axiosCall";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function getPexelsSearchQuery(item: ImportItem): string {
  return item.nameAr.trim();
}

export function getCategoryPexelsSearchQuery(
  category: Pick<ImportCategory, "nameAr" | "nameEn">,
): string {
  return category.nameAr.trim() || category.nameEn.trim();
}

export function getPexelsPhotoUrl(photo: PexelsPhoto): string {
  return (
    photo.src.medium ||
    photo.src.large ||
    photo.src.large2x ||
    photo.src.original
  );
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
