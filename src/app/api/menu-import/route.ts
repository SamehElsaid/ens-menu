import { NextRequest, NextResponse } from "next/server";
import { extractJsonFromN8n } from "@/lib/menuImport/parseN8nMenuImportResponse";
import {
  MENU_IMPORT_ACCEPTED_TYPES,
  MENU_IMPORT_COMPRESSED_TARGET_BYTES,
  MENU_IMPORT_COMPRESS_THRESHOLD_BYTES,
} from "@/lib/menuImport/constants";
import { formatImageSizeLog } from "@/lib/menuImport/formatImageSize";
import { resizeImageBufferToMaxSize } from "@/lib/menuImport/resizeImageBuffer";

const TIMEOUT_MS = 90_000;

function resolveWebhookUrl(): string {
  return (
    process.env.N8N_MENU_IMPORT_WEBHOOK ??
    process.env.NEXT_PUBLIC_N8N_MENU_IMPORT_WEBHOOK ??
    "https://ensbot.net/webhook-test/menu-image-test"
  );
}

export async function POST(request: NextRequest) {
  const webhookUrl = resolveWebhookUrl();
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const menuId = String(formData.get("menuId") ?? "").trim();
    const locale = String(formData.get("locale") ?? "ar").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!menuId) {
      return NextResponse.json({ error: "menuId is required" }, { status: 400 });
    }

    if (
      !MENU_IMPORT_ACCEPTED_TYPES.includes(
        file.type as (typeof MENU_IMPORT_ACCEPTED_TYPES)[number],
      )
    ) {
      return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
    }

    const originalSize = file.size;
    console.log("[menu-import-api] Image before upload:", {
      menuId,
      locale,
      fileName: file.name,
      mimeType: file.type,
      ...formatImageSizeLog(originalSize),
    });

    let uploadFile: File = file;

    if (originalSize > MENU_IMPORT_COMPRESS_THRESHOLD_BYTES) {
      try {
        const inputBuffer = Buffer.from(await file.arrayBuffer());
        const compressed = await resizeImageBufferToMaxSize(
          inputBuffer,
          file.type,
          MENU_IMPORT_COMPRESSED_TARGET_BYTES,
        );
        const baseName = file.name.replace(/\.[^.]+$/, "") || "menu-image";
        uploadFile = new File(
          [new Uint8Array(compressed.buffer)],
          `${baseName}.${compressed.extension}`,
          { type: compressed.mimeType },
        );

        console.log("[menu-import-api] Image compressed before upload:", {
          menuId,
          fileName: uploadFile.name,
          original: formatImageSizeLog(originalSize),
          compressed: formatImageSizeLog(uploadFile.size),
        });
      } catch (compressError) {
        console.error("[menu-import-api] compression failed:", compressError);
        return NextResponse.json(
          { error: "image_compression_failed" },
          { status: 400 },
        );
      }
    }

    const upstreamForm = new FormData();
    upstreamForm.append("file", uploadFile, uploadFile.name);
    upstreamForm.append("menuId", menuId);
    upstreamForm.append("locale", locale);
    upstreamForm.append("image", uploadFile, uploadFile.name);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let upstream: Response;
    try {
      upstream = await fetch(webhookUrl, {
        method: "POST",
        body: upstreamForm,
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const rawText = await upstream.text();

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: "webhook_failed",
          detail: rawText.slice(0, 500),
        },
        { status: upstream.status >= 400 ? upstream.status : 502 },
      );
    }

    const extracted = extractJsonFromN8n(rawText);

    if (extracted === null) {
      return NextResponse.json(
        {
          error: "invalid_response",
          detail: rawText.slice(0, 500),
          rawText: rawText.slice(0, 2000),
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { raw: extracted },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "timeout" }, { status: 504 });
    }
    console.error("[menu-import-api] error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

