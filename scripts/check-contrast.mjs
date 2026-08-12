/**
 * Contrast audit for the console token pairs — CONSOLE-REDESIGN.md §11.
 *
 * Reads the real values out of `globals.css` so the check cannot drift from the
 * stylesheet, then asserts every text-on-surface pair the console actually
 * renders. Text pairs are held to 4.5:1, large text and UI boundaries to 3:1.
 */
import { readFileSync } from "node:fs";

const css = readFileSync(
  new URL("../src/app/[locale]/globals.css", import.meta.url),
  "utf8",
);

/** `:root { … }` is light; the `.dark` block that follows overrides it. */
function readScope(selector) {
  /* Anchored to the start of a line so a mention of `.dark` in a comment or a
     nested `@variant` rule cannot be mistaken for the theme block. */
  const start = css.search(
    new RegExp(
      `^${selector.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\s*\\{`,
      "m",
    ),
  );
  if (start === -1) throw new Error(`missing block: ${selector}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = css.slice(open + 1, end);
  const vars = new Map();
  for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars.set(match[1], match[2].trim());
  }
  return vars;
}

const light = readScope(":root");
const dark = new Map([...light, ...readScope(".dark")]);

function resolve(scope, token, seen = 0) {
  if (seen > 12) throw new Error(`cycle resolving ${token}`);
  const raw = scope.get(token);
  if (!raw) throw new Error(`unknown token ${token}`);
  const ref = raw.match(/^var\((--[\w-]+)\)$/);
  if (ref) return resolve(scope, ref[1], seen + 1);
  return raw;
}

function parse(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], alpha: 1 };
  }
  const rgba = value.match(
    /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+))?\s*\)$/,
  );
  if (rgba) {
    return {
      rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])],
      alpha: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }
  return null;
}

const channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = ([r, g, b]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** Alpha tints (dark-mode `--brand-soft` and friends) composite onto the page. */
const over = (fg, bg) =>
  fg.rgb.map((c, i) => Math.round(c * fg.alpha + bg.rgb[i] * (1 - fg.alpha)));

function ratio(scope, fgToken, bgToken, groundToken) {
  const fg = parse(resolve(scope, fgToken));
  const bgRaw = parse(resolve(scope, bgToken));
  const ground = parse(resolve(scope, groundToken));
  if (!fg || !bgRaw || !ground) {
    throw new Error(`unparseable pair ${fgToken} / ${bgToken}`);
  }
  const bg = { rgb: over(bgRaw, ground), alpha: 1 };
  const a = luminance(over(fg, bg));
  const b = luminance(bg.rgb);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground, background, minimum, label] — background composites on `--app-bg`. */
const pairs = [
  ["--fg", "--surface", 4.5, "body text on card"],
  ["--fg", "--app-bg", 4.5, "body text on page"],
  ["--fg-muted", "--surface", 4.5, "secondary text on card"],
  ["--fg-muted", "--surface-2", 4.5, "secondary text on sunken"],
  ["--fg-subtle", "--surface", 4.5, "labels on card"],
  ["--fg-subtle", "--app-bg", 4.5, "labels on page"],
  ["--fg-on-brand", "--brand", 4.5, "primary button label"],
  ["--fg-on-accent", "--accent", 4.5, "accent button label"],
  ["--brand-soft-fg", "--brand-soft", 4.5, "active nav item"],
  ["--success-fg", "--success-soft", 4.5, "success badge"],
  ["--warning-fg", "--warning-soft", 4.5, "warning badge"],
  ["--danger-fg", "--danger-soft", 4.5, "danger badge"],
  ["--info-fg", "--info-soft", 4.5, "info badge"],
  ["--danger", "--surface", 4.5, "destructive link"],
  ["--ring", "--surface", 3, "focus ring on card"],
  ["--ring", "--app-bg", 3, "focus ring on page"],
  ["--line-control", "--surface", 3, "field border on card"],
  ["--line-control", "--surface-2", 3, "field border on sunken"],
  ["--line-control", "--app-bg", 3, "field border on page"],
  ["--brand", "--surface", 3, "brand fill boundary"],
  ["--danger", "--surface", 3, "invalid field border"],
];

let failures = 0;
for (const [scopeName, scope] of [
  ["light", light],
  ["dark", dark],
]) {
  console.log(`\n${scopeName}`);
  for (const [fg, bg, min, label] of pairs) {
    const value = ratio(scope, fg, bg, "--app-bg");
    const pass = value >= min;
    if (!pass) failures += 1;
    console.log(
      `  ${pass ? "PASS" : "FAIL"}  ${value.toFixed(2)}:1  (min ${min})  ${label}  [${fg} on ${bg}]`,
    );
  }
}

console.log(`\n${failures} failing pair${failures === 1 ? "" : "s"}`);
process.exitCode = failures > 0 ? 1 : 0;
