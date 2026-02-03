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
