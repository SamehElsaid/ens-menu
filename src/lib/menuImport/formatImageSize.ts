export function formatImageSizeBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatImageSizeLog(bytes: number): {
  bytes: number;
  kb: string;
  mb: string;
} {
  return {
    bytes,
    kb: `${(bytes / 1024).toFixed(1)} KB`,
    mb: `${(bytes / (1024 * 1024)).toFixed(2)} MB`,
  };
}
