export function importRefDomId(refId: string): string {
  return `import-ref-${refId}`;
}

export function focusFirstMissingField(container: HTMLElement): void {
  const missing = container.querySelector<HTMLElement>(
    "input.border-amber-400, textarea.border-amber-400",
  );
  if (missing) {
    missing.focus({ preventScroll: true });
    return;
  }
  container.querySelector<HTMLElement>("input, textarea")?.focus({
    preventScroll: true,
  });
}
