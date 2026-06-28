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
  types: string[] = ["image/png", "image/webp", "image/jpeg", "image/jpg"],
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
  maxBytes: number = 2 * 1024 * 1024,
  thresholdBytes: number = 2 * 1024 * 1024,
): Promise<File> => {
  if (typeof window === "undefined") return file;

  // Skip tiny files — they're already good
  if (file.size < 200 * 1024) return file;

  try {
    const imageCompression = (await import("browser-image-compression"))
      .default;

    const maxSizeMB = maxBytes / (1024 * 1024);

    const compressed = await imageCompression(file, {
      maxSizeMB,
      // Resize to max 1920px — a 1920px JPEG at q=0.88 is typically 300KB–1.2MB,
      // so dimension reduction happens before any quality reduction
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.88,
      alwaysKeepResolution: false,
      preserveExif: false,
      fileType: file.type === "image/webp" ? "image/webp" : "image/jpeg",
    });

    return new File([compressed], file.name, {
      type: compressed.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("[_resizeImage] Error during compression:", error);
    return file;
  }
};
