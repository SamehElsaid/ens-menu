import { LENA_SYSTEM_HINTS } from "@/lib/lena/assistantConfig";
import { extractTextFromN8n } from "@/lib/lena/parseN8nChatResponse";
import { NextRequest, NextResponse } from "next/server";
import { guardExternalServiceRoute } from "@/lib/server/externalRouteGuard";

const WEBHOOK_URL =
  process.env.N8N_CHAT_WEBHOOK ??
  process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK ??
  "https://ensbot.net/webhook/chat-ai";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardExternalServiceRoute(request, {
      routeKey: "chat",
      maxRequests: 20,
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

    const body = (await request.json()) as {
      message?: string;
      sessionId?: string;
    };

    const message = body.message?.trim();
    const sessionId = body.sessionId?.trim();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "message and sessionId are required" },
        { status: 400 },
      );
    }
    if (message.length > 4_000 || sessionId.length > 128) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        sessionId,
        hints: LENA_SYSTEM_HINTS,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    const raw = await upstream.text();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "webhook_request_failed" },
        { status: 502 },
      );
    }

    const aiText =
      extractTextFromN8n(raw) || "حدث خطأ، حاول مرة تانية";

    return new NextResponse(aiText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[chat-api] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
