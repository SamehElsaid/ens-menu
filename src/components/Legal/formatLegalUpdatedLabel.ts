export function formatLegalUpdatedLabel(locale: string, prefix: string) {
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return `${prefix} ${date}`;
}
