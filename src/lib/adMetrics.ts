export function adRowMetrics(ad: {
  clickCount?: number;
  impressionCount?: number;
}): { clickCount: number; impressionCount: number; ctr: number } {
  const impressionCount = Number(ad.impressionCount ?? 0);
  const clickCount = Number(ad.clickCount ?? 0);
  const ctr =
    impressionCount > 0
      ? Math.round((clickCount / impressionCount) * 1000) / 10
      : 0;
  return { clickCount, impressionCount, ctr };
}
