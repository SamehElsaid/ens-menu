export const PERSISTENT_OPTION_ID_PATTERN =
  /^[A-Za-z][A-Za-z0-9_-]{7,127}$/;

export function isPersistentOptionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    PERSISTENT_OPTION_ID_PATTERN.test(value.trim())
  );
}

export function createPersistentOptionId(
  createUuid: () => string = () => crypto.randomUUID(),
): string {
  const token = createUuid()
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .slice(0, 120)
    .padEnd(4, "0");
  return `opt_${token}`;
}

function hashSeed(value: string, basis: number): string {
  let hash = basis;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
}

export function persistentOptionIdForLegacy(
  value: unknown,
  namespace: string,
): string {
  if (isPersistentOptionId(value)) return value.trim();
  const seed = `${namespace}:${String(value ?? "")}`;
  return `opt_${hashSeed(seed, 0x811c9dc5)}${hashSeed(seed, 0x9e3779b9)}`;
}
