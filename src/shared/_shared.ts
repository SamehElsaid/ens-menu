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