import {
  MENU_IMPORT_COMPRESSED_TARGET_BYTES,
  MENU_IMPORT_COMPRESS_THRESHOLD_BYTES,
} from "./constants";

function getOutputMimeType(fileType: string): string {
  if (fileType === "image/webp") return "image/webp";
  return "image/jpeg";
}

function getOutputExtension(mimeType: string): string {
  return mimeType === "image/webp" ? "webp" : "jpg";
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

/**
 * Compresses an image client-side when above thresholdBytes until maxBytes.
 * Returns the original file unchanged when already within the threshold.
 */
export async function resizeImageToMaxSize(
  file: File,
  maxBytes: number = MENU_IMPORT_COMPRESSED_TARGET_BYTES,
  thresholdBytes: number = MENU_IMPORT_COMPRESS_THRESHOLD_BYTES,
): Promise<File> {
  if (file.size <= thresholdBytes) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas not supported");
  }

  const mimeType = getOutputMimeType(file.type);
  let width = bitmap.width;
  let height = bitmap.height;
  let quality = 0.92;
  let blob: Blob | null = null;

  const draw = () => {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bitmap, 0, 0, width, height);
  };

  draw();
  blob = await canvasToBlob(canvas, mimeType, quality);

  while (blob && blob.size > maxBytes) {
    if (quality > 0.45) {
      quality = Math.max(0.45, quality - 0.08);
    } else if (width > 320 || height > 320) {
      width = Math.max(320, Math.round(width * 0.85));
      height = Math.max(320, Math.round(height * 0.85));
      quality = 0.82;
      draw();
    } else {
      break;
    }
    blob = await canvasToBlob(canvas, mimeType, quality);
  }

  bitmap.close();

  if (!blob || blob.size > maxBytes) {
    throw new Error("Could not compress image below size limit");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "menu-image";
  const extension = getOutputExtension(mimeType);

  return new File([blob], `${baseName}.${extension}`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}
