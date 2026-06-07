export const _getDir = (location: string) => {
  if (location !== "ar") {
    return "ltr";
  } else {
    return "rtl";
  }
};

export const _checkFileSize = (file: File, size: number = 10) => {
  if (file.size > size * 1024 * 1024) {
    return false;
  }
  return true;
};

export const _checkFileType = (
  file: File,
  types: string[] = ["image/png", "image/webp", "image/jpeg", "image/jpg"]
) => {
  if (!types.includes(file.type)) {
    return false;
  }
  return true;
};

export const timeStringToDate = (time: string) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};


export const convetDateToTimeString = (date: Date) => {
  return date.toTimeString().slice(0, 5);
};

export const _resizeImage = async (
  file: File,
  maxBytes: number = 1.5 * 1024 * 1024,
  thresholdBytes: number = 2 * 1024 * 1024
): Promise<File> => {
  if (file.size <= thresholdBytes) return file;

  // Check if we are in browser environment and have canvas support
  if (typeof window === "undefined" || !window.createImageBitmap || !window.HTMLCanvasElement) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      bitmap.close();
      return file;
    }

    const getOutputMimeType = (fileType: string): string => {
      if (fileType === "image/webp") return "image/webp";
      return "image/jpeg";
    };

    const getOutputExtension = (mimeType: string): string => {
      return mimeType === "image/webp" ? "webp" : "jpg";
    };

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
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

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
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
      });
    }

    bitmap.close();

    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const extension = getOutputExtension(mimeType);

    return new File([blob], `${baseName}.${extension}`, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("[_resizeImage] Error during compression:", error);
    return file;
  }
};