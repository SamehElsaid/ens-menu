/** Recognize the legacy user-not-found payload used by existing error handling. */
export function isUserNotFoundApiBody(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const o = data as { error?: string; errorEn?: string; errorAr?: string };
  const parts = [o.error, o.errorEn, o.errorAr].filter(
    (x): x is string => typeof x === "string",
  );
  return parts.some(
    (p) => p.includes("User not found") || p.includes("المستخدم غير موجود"),
  );
}
