import sharp from "sharp";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import http from "http";
import https from "https";
import { NextResponse } from "next/server";

// 1. إعدادات المسارات والحدود
const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const AXIOS_TIMEOUT = 10000; // 10 ثواني كحد أقصى لجلب الصورة

// إعداد عميل HTTP لاتصالات سريعة ومتكررة
const axiosInstance = axios.create({
  timeout: AXIOS_TIMEOUT,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 100 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 100 }),
});

// 2. دالة توليد معلومات الكاش (Hash)
function getCacheInfo(
  url: string | null,
  width: number | null,
  height: number | null,
) {
  const urlStr = String(url || "");
  const urlHash = crypto
    .createHash("md5")
    .update(urlStr)
    .digest("hex")
    .substring(0, 12);
  const sizeKey =
    width || height ? `${width || "auto"}x${height || "auto"}` : "original";
  const filename = `img_${urlHash}_${sizeKey}.webp`;
  const filePath = path.join(CACHE_DIR, filename);
  return { filename, filePath };
}

// 3. دالة إرجاع Response للصورة مع الـ Headers الصحيحة
function imageResponse(
  buffer: Buffer,
  contentType: string,
  fromCache: boolean,
): NextResponse {
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Length", String(buffer.length));
  headers.set("X-Image-Cache", fromCache ? "HIT" : "MISS");
  headers.set("Content-Disposition", 'inline; filename="optimized-image.webp"');
  return new NextResponse(new Uint8Array(buffer), { status: 200, headers });
}

// 4. المعالج الرئيسي (App Router - GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const width = searchParams.get("width");
  const height = searchParams.get("height");
  const nocache = searchParams.get("nocache");

  // التحقق من وجود الرابط
  if (!url) {
    return NextResponse.json(
      { error: "يرجى تقديم رابط الصورة" },
      { status: 400 },
    );
  }

  const imageUrl = String(url).trim();
  const imageWidth = width ? parseInt(width, 10) : null;
  const imageHeight = height ? parseInt(height, 10) : null;

  // تخطي المعالجة للصيغ غير المدعومة (مثل .ico) — Sharp لا يدعمها
  const unsupportedExtensions = [".ico", ".bmp", ".tiff", ".tif"];
  const urlLower = imageUrl.toLowerCase();
  const isUnsupported = unsupportedExtensions.some((ext) =>
    urlLower.includes(ext),
  );
  if (isUnsupported) {
    return NextResponse.redirect(imageUrl, 302);
  }

  // الحصول على معلومات الملف في الكاش
  const { filePath } = getCacheInfo(imageUrl, imageWidth, imageHeight);

  // --- المرحلة الأولى: محاولة القراءة من الكاش (المسار الأسرع) ---
  if (nocache !== "true") {
    try {
      const cachedBuffer = await fs.readFile(filePath);
      return imageResponse(cachedBuffer, "image/webp", true);
    } catch {
      // إذا لم يجد الملف، يكمل للخطوات التالية
    }
  }

  // --- المرحلة الثانية: جلب الصورة ومعالجتها ---
  try {
    const response = await axiosInstance.get(imageUrl, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const contentType = String(
      response.headers["content-type"] || "",
    ).toLowerCase();
    if (
      contentType.includes("x-icon") ||
      contentType.includes("ico") ||
      contentType.includes("image/bmp") ||
      contentType.includes("tiff")
    ) {
      return NextResponse.redirect(imageUrl, 302);
    }

    const buffer = Buffer.from(response.data);

    // إعداد معالجة Sharp
    const pipeline = sharp(buffer, { failOnError: false });

    // التحجيم إذا طلب المستخدم
    if (imageWidth || imageHeight) {
      pipeline.resize(imageWidth ?? undefined, imageHeight ?? undefined, {
        fit: "inside",
        withoutEnlargement: true,
        fastShrinkOnLoad: true,
      });
    }

    // التحويل إلى WebP (سرعة عالية + ضغط ممتاز)
    const processedBuffer = await pipeline
      .webp({
        quality: 75,
        effort: 3,
        force: true,
      })
      .toBuffer();

    // --- المرحلة الثالثة: الحفظ في الكاش (في الخلفية) ---
    if (nocache !== "true") {
      (async () => {
        try {
          await fs.mkdir(CACHE_DIR, { recursive: true });
          await fs.writeFile(filePath, processedBuffer);
        } catch (cacheErr) {
          const msg =
            cacheErr instanceof Error ? cacheErr.message : "خطأ غير معروف";
          console.error("خطأ أثناء حفظ الكاش:", msg);
        }
      })();
    }

    return imageResponse(processedBuffer, "image/webp", false);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "فشل غير معروف";
    console.error("❌ فشل في معالجة الصورة:", msg);
    return NextResponse.redirect(imageUrl, 302);
  }
}
