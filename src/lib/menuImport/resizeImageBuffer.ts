import sharp from "sharp";

function resolveOutputFormat(mimeType: string): {
  format: "jpeg" | "webp";
  mimeType: string;
  extension: string;
} {
  if (mimeType === "image/webp") {
    return { format: "webp", mimeType: "image/webp", extension: "webp" };
  }
  return { format: "jpeg", mimeType: "image/jpeg", extension: "jpg" };
}

async function encodeImage(
  input: Buffer,
  format: "jpeg" | "webp",
  width: number,
  height: number,
  quality: number,
): Promise<Buffer> {
  let pipeline = sharp(input, { failOn: "none" }).resize(width, height, {
    fit: "inside",
    withoutEnlargement: true,
    fastShrinkOnLoad: true,
  });

  if (format === "webp") {
    pipeline = pipeline.webp({ quality, effort: 4 });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  return pipeline.toBuffer();
}

/**
 * Server-side compression for menu-import uploads.
 * Returns the original buffer when already within maxBytes.
 */
export async function resizeImageBufferToMaxSize(
  input: Buffer,
  mimeType: string,
  maxBytes: number,
): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
  if (input.length <= maxBytes) {
    const output = resolveOutputFormat(mimeType);
    return { buffer: input, ...output };
  }

  const output = resolveOutputFormat(mimeType);
  const metadata = await sharp(input, { failOn: "none" }).metadata();
  let width = metadata.width ?? 2048;
  let height = metadata.height ?? 2048;
  let quality = 85;
  let encoded = await encodeImage(
    input,
    output.format,
    width,
    height,
    quality,
  );

  while (encoded.length > maxBytes) {
    if (quality > 45) {
      quality = Math.max(45, quality - 8);
    } else if (width > 320 || height > 320) {
      width = Math.max(320, Math.round(width * 0.85));
      height = Math.max(320, Math.round(height * 0.85));
      quality = 82;
    } else {
      break;
    }
    encoded = await encodeImage(
      input,
      output.format,
      width,
      height,
      quality,
    );
  }

  if (encoded.length > maxBytes) {
    throw new Error("Could not compress image below size limit");
  }

  return { buffer: encoded, mimeType: output.mimeType, extension: output.extension };
}
