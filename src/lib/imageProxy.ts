import axios from "axios";
import crypto from "node:crypto";
import { lookup } from "node:dns/promises";
import fs from "node:fs/promises";
import { isIP } from "node:net";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";

const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const FETCH_TIMEOUT_MS = 10_000;
const MAX_DIMENSION = 4_096;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

export interface ImageProxyOptions {
  allowLocalImages: boolean;
  allowCoverFit: boolean;
  allowedRemoteHosts?: readonly string[];
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function parseDimension(value: string | null): number | null | undefined {
  if (value === null || value === "") return null;
  if (!/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed >= 1 && parsed <= MAX_DIMENSION ? parsed : undefined;
}

function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase().split("%")[0];
  const mappedIpv4 = normalized.match(
    /^::ffff:(\d+\.\d+\.\d+\.\d+)$/,
  )?.[1];
  if (mappedIpv4) return isPrivateAddress(mappedIpv4);
  if (isIP(normalized) === 4) {
    const [a, b] = normalized.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  if (isIP(normalized) === 6) {
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      /^fe[89ab]/.test(normalized)
    );
  }
  return true;
}

async function validateRemoteUrl(
  rawUrl: string,
  allowedRemoteHosts: readonly string[] = [],
): Promise<URL> {
  if (rawUrl.length > 2_048) throw new Error("invalid-url");
  const parsed = new URL(rawUrl);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("invalid-protocol");
  }
  if (parsed.username || parsed.password) throw new Error("invalid-credentials");

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (
    allowedRemoteHosts.length > 0 &&
    !allowedRemoteHosts.some((allowed) => hostname === allowed.toLowerCase())
  ) {
    throw new Error("host-not-allowed");
  }
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("private-host");
  }

  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateAddress(address))
  ) {
    throw new Error("private-address");
  }
  return parsed;
}

function getCachePath(
  source: string,
  width: number | null,
  height: number | null,
  fit: "inside" | "cover",
) {
  const hash = crypto
    .createHash("sha256")
    .update(`${source}|${width ?? "auto"}|${height ?? "auto"}|${fit}`)
    .digest("hex")
    .slice(0, 24);
  return path.join(CACHE_DIR, `img_${hash}.webp`);
}

const WEBP_RIFF = Buffer.from("RIFF");
const WEBP_WEBP = Buffer.from("WEBP");

export function isReusableCachedImage(buffer: Buffer | null | undefined): boolean {
  if (!buffer || buffer.length < 16) return false;
  return (
    buffer.subarray(0, 4).equals(WEBP_RIFF) &&
    buffer.subarray(8, 12).equals(WEBP_WEBP)
  );
}

function imageResponse(buffer: Buffer, fromCache: boolean): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(buffer.length),
      "Content-Disposition": 'inline; filename="optimized-image.webp"',
      "X-Content-Type-Options": "nosniff",
      "X-Image-Cache": fromCache ? "HIT" : "MISS",
    },
  });
}

async function readLocalImage(source: string): Promise<Buffer> {
  const publicRoot = path.resolve(process.cwd(), "public");
  const resolved = path.resolve(publicRoot, source.replace(/^[/\\]+/, ""));
  if (!resolved.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error("invalid-local-path");
  }
  const stat = await fs.stat(resolved);
  if (!stat.isFile() || stat.size > MAX_SOURCE_BYTES) {
    throw new Error("invalid-local-file");
  }
  return fs.readFile(resolved);
}

async function fetchRemoteImage(
  source: string,
  allowedRemoteHosts: readonly string[] | undefined,
): Promise<Buffer> {
  const remoteUrl = await validateRemoteUrl(source, allowedRemoteHosts);
  const response = await axios.get<ArrayBuffer>(remoteUrl.toString(), {
    responseType: "arraybuffer",
    timeout: FETCH_TIMEOUT_MS,
    maxRedirects: 0,
    maxContentLength: MAX_SOURCE_BYTES,
    maxBodyLength: MAX_SOURCE_BYTES,
    headers: { "User-Agent": "ENSmenu-Image-Proxy/1.0" },
  });
  const contentType = String(response.headers["content-type"] ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!contentType.startsWith("image/")) {
    throw new Error("invalid-content-type");
  }
  return Buffer.from(response.data);
}

export async function handleImageProxy(
  request: Request,
  options: ImageProxyOptions,
) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("url")?.trim() ?? "";
  const width = parseDimension(searchParams.get("width"));
  const height = parseDimension(searchParams.get("height"));
  const requestedFit = searchParams.get("fit");
  const fit =
    options.allowCoverFit && requestedFit === "cover" ? "cover" : "inside";
  const bypassCache = searchParams.get("nocache") === "true";

  if (!source) return jsonError("Image URL is required", 400);
  if (width === undefined || height === undefined) {
    return jsonError(`Image dimensions must be between 1 and ${MAX_DIMENSION}`, 400);
  }
  if (requestedFit && !["inside", "cover"].includes(requestedFit)) {
    return jsonError("Invalid resize fit", 400);
  }
  if (requestedFit === "cover" && !options.allowCoverFit) {
    return jsonError("Cover fit is not supported", 400);
  }

  const isLocal = source.startsWith("/") && !source.startsWith("//");
  if (isLocal && !options.allowLocalImages) {
    return jsonError("Local images are not supported", 400);
  }
  if (!isLocal && !/^https?:\/\//i.test(source)) {
    return jsonError("Only HTTP(S) image URLs are supported", 400);
  }

  const cachePath = getCachePath(source, width, height, fit);
  if (!bypassCache) {
    try {
      const cached = await fs.readFile(cachePath);
      if (isReusableCachedImage(cached)) {
        return imageResponse(cached, true);
      }
      await fs.unlink(cachePath).catch(() => undefined);
    } catch {
      // Cache miss or unreadable entry.
    }
  }

  try {
    const sourceBuffer = isLocal
      ? await readLocalImage(source)
      : await fetchRemoteImage(source, options.allowedRemoteHosts);
    const pipeline = sharp(sourceBuffer, {
      failOn: "error",
      limitInputPixels: MAX_DIMENSION * MAX_DIMENSION * 4,
    });
    if (width || height) {
      pipeline.resize(width ?? undefined, height ?? undefined, {
        fit,
        position: "centre",
        withoutEnlargement: fit === "inside",
        fastShrinkOnLoad: true,
      });
    }
    const processed = await pipeline
      .webp({ quality: 75, effort: 3, force: true })
      .toBuffer();

    if (!bypassCache && isReusableCachedImage(processed)) {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(cachePath, processed);
    }
    return imageResponse(processed, false);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch or process image" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
