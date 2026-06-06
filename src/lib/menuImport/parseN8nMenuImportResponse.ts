/**
 * Extracts structured menu JSON from n8n webhook responses.
 * Handles plain JSON, nested output/text wrappers, and JSON embedded in text.
 */
export function extractJsonFromN8n(raw: string): unknown | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const direct = tryParseJson(trimmed);
  if (direct !== undefined) {
    const unwrapped = unwrapMenuPayload(direct);
    if (unwrapped !== null) return unwrapped;
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    const nested = tryParseJson(objectMatch[0]);
    if (nested !== undefined) {
      const unwrapped = unwrapMenuPayload(nested);
      if (unwrapped !== null) return unwrapped;
    }
  }

  return null;
}

function tryParseJson(value: string): unknown | undefined {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function unwrapMenuPayload(parsed: unknown): unknown | null {
  if (parsed === null || parsed === undefined) return null;

  if (hasMenuShape(parsed)) return parsed;

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const inner = unwrapMenuPayload(item);
      if (inner !== null) return inner;
    }
    return null;
  }

  if (typeof parsed !== "object") return null;

  const record = parsed as Record<string, unknown>;

  if (typeof record.text === "string") {
    const fromText = tryParseJson(record.text.trim());
    if (fromText !== undefined) {
      const inner = unwrapMenuPayload(fromText);
      if (inner !== null) return inner;
    }
  }

  if (typeof record.output === "string") {
    const fromOutput = tryParseJson(record.output.trim());
    if (fromOutput !== undefined) {
      const inner = unwrapMenuPayload(fromOutput);
      if (inner !== null) return inner;
    }
  }

  const output = record.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      if (!item || typeof item !== "object") continue;
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) continue;
      for (const block of content) {
        if (!block || typeof block !== "object") continue;
        const text = (block as { text?: unknown }).text;
        if (typeof text !== "string") continue;
        const fromBlock = tryParseJson(text.trim());
        if (fromBlock !== undefined) {
          const inner = unwrapMenuPayload(fromBlock);
          if (inner !== null) return inner;
        }
      }
    }
  }

  if (record.data && typeof record.data === "object") {
    const inner = unwrapMenuPayload(record.data);
    if (inner !== null) return inner;
  }

  if (record.menu && typeof record.menu === "object") {
    const inner = unwrapMenuPayload(record.menu);
    if (inner !== null) return inner;
  }

  return null;
}

function hasMenuShape(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    Array.isArray(record.categories) ||
    Array.isArray(record.sections) ||
    Array.isArray(record.items)
  );
}
