"use client";

import { useEffect } from "react";

const RTL_CHAR_REGEX = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

function resolveDir(value: string): "ltr" | "rtl" | "auto" {
  if (!value) return "auto";
  return RTL_CHAR_REGEX.test(value) ? "rtl" : "ltr";
}

export default function AutoDirInputs() {
  useEffect(() => {
    const onInput = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") return;
      (el as HTMLInputElement | HTMLTextAreaElement).dir = resolveDir(
        (el as HTMLInputElement | HTMLTextAreaElement).value
      );
    };

    document.addEventListener("input", onInput, true);
    return () => document.removeEventListener("input", onInput, true);
  }, []);

  return null;
}
