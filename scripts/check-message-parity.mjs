/**
 * Message parity check.
 *
 * The console now renders every page title, breadcrumb and toolbar label from
 * `messages/*.json`, so a key that exists in one locale and not the other is a
 * blank region in the UI rather than a cosmetic issue.
 */
import { readFileSync } from "node:fs";

const load = (locale) =>
  JSON.parse(
    readFileSync(
      new URL(`../messages/${locale}.json`, import.meta.url),
      "utf8",
    ),
  );

const flatten = (value, prefix = "", out = new Set()) => {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flatten(child, path, out);
    } else {
      out.add(path);
    }
  }
  return out;
};

const en = flatten(load("en"));
const ar = flatten(load("ar"));

const missingInAr = [...en].filter((key) => !ar.has(key));
const missingInEn = [...ar].filter((key) => !en.has(key));

const report = (label, keys) => {
  if (!keys.length) return;
  console.log(`\n${label} (${keys.length}):`);
  for (const key of keys) console.log(`  ${key}`);
};

report("Missing in ar.json", missingInAr);
report("Missing in en.json", missingInEn);

console.log(
  `\nen: ${en.size} keys, ar: ${ar.size} keys, ${missingInAr.length + missingInEn.length} mismatched`,
);

process.exitCode = missingInAr.length + missingInEn.length > 0 ? 1 : 0;
