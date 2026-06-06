import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ImportDraft, SaveMenuImportRequest } from "@/types/menuImport";
import {
  executeMenuImportSave,
  getBearerToken,
} from "@/lib/menuImport/executeMenuImportSave";

export async function POST(request: NextRequest) {
  try {
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

    const cookieStore = await cookies();
    const sub = cookieStore.get("sub")?.value;
    const token = getBearerToken(sub);

    const result = await executeMenuImportSave(draft, menuId, locale, token, sub);

    if (result.blockingErrors && result.blockingErrors.length > 0) {
      return NextResponse.json(result, { status: 400 });
    }

    if (!token) {
      return NextResponse.json(result, { status: 401 });
    }

    const { refreshedSub, ...saveResult } = result;

    if (result.ok) {
      const response = NextResponse.json(saveResult, { status: 201 });
      if (refreshedSub) {
        response.cookies.set("sub", refreshedSub, { path: "/" });
      }
      return response;
    }

    if (result.partial) {
      const response = NextResponse.json(saveResult, { status: 207 });
      if (refreshedSub) {
        response.cookies.set("sub", refreshedSub, { path: "/" });
      }
      return response;
    }

    const response = NextResponse.json(saveResult, { status: 422 });
    if (refreshedSub) {
      response.cookies.set("sub", refreshedSub, { path: "/" });
    }
    return response;
  } catch (error) {
    console.error("[menu-import-save] error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
