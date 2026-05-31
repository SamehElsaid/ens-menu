/**
 * Normalizes n8n webhook body to plain AI text.
 *
 * Current n8n (misconfigured) returns JSON array:
 *   [{ "type": "output_text", "text": "..." }]
 *
 * Target n8n config returns plain text:
 *   {{ $json.output?.[0]?.content?.[0]?.text }}
 */
export function extractTextFromN8n(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    return trimmed;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && typeof item === "object" && "text" in item) {
          const text = (item as { text?: unknown }).text;
          if (typeof text === "string" && text.trim()) return text.trim();
        }
      }
    }

    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;

      const output = record.output;
      if (Array.isArray(output)) {
        for (const item of output) {
          if (!item || typeof item !== "object") continue;
          const content = (item as { content?: unknown }).content;
          if (!Array.isArray(content)) continue;
          for (const block of content) {
            if (block && typeof block === "object" && "text" in block) {
              const text = (block as { text?: unknown }).text;
              if (typeof text === "string" && text.trim()) return text.trim();
            }
          }
        }
      }

      if (typeof record.text === "string" && record.text.trim()) {
        return record.text.trim();
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}
