import { NextRequest, NextResponse } from "next/server";
import type { ImportDraft, SaveMenuImportRequest } from "@/types/menuImport";
import { executeMenuImportSave } from "@/lib/menuImport/executeMenuImportSave";
import { guardExternalServiceRoute } from "@/lib/server/externalRouteGuard";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardExternalServiceRoute(request, {
      routeKey: "menu-import-save",
      maxRequests: 20,
      windowMs: 5 * 60_000,
    });
    if (!guard.ok) {
      return NextResponse.json(
        { error: guard.error, ...(guard.code ? { code: guard.code } : {}) },
        {
          status: guard.status,
          headers: guard.retryAfter
            ? { "Retry-After": String(guard.retryAfter) }
            : undefined,
        },
      );
    }

    const body = (await request.json()) as SaveMenuImportRequest;
    const menuId = String(body.menuId ?? "").trim();
    const locale = String(body.locale ?? "ar").trim();
    const draft = body.draft as ImportDraft | undefined;

    if (!menuId || !draft?.categories) {
      return NextResponse.json(
        { error: "menuId and draft are required" },
        { status: 400 },
      );
    }

    const result = await executeMenuImportSave(
      draft,
      menuId,
      locale,
      guard.cookieHeader,
      request.headers.get("x-csrf-token"),
      request.headers.get("origin"),
    );

    if (result.blockingErrors && result.blockingErrors.length > 0) {
      return NextResponse.json(result, { status: 400 });
    }

    const saveResult = result;

    if (result.ok) {
      return NextResponse.json(saveResult, { status: 201 });
    }

    if (result.partial) {
      return NextResponse.json(saveResult, { status: 207 });
    }

    return NextResponse.json(saveResult, { status: 422 });
  } catch (error) {
    console.error("[menu-import-save] error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
