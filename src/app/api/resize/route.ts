import { handleImageProxy } from "@/lib/imageProxy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { guardExternalServiceRoute } from "@/lib/server/externalRouteGuard";

const allowedRemoteHosts = new Set([
  "ensapi.ensbot.net",
  "api.ensmenu.com",
  "images.pexels.com",
]);
try {
  const configuredHost = new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "",
  ).hostname.toLowerCase();
  if (configuredHost) allowedRemoteHosts.add(configuredHost);
} catch {
  // Deployment validation reports malformed backend URLs.
}

const CONSOLE_IMAGE_OPTIONS = {
  allowLocalImages: true,
  allowCoverFit: true,
  allowedRemoteHosts: [...allowedRemoteHosts],
};

export async function GET(request: NextRequest) {
  const guard = await guardExternalServiceRoute(request, {
    routeKey: "image-resize",
    maxRequests: 60,
  });
  if (!guard.ok) {
    return NextResponse.json(
      { error: guard.error, ...(guard.code ? { code: guard.code } : {}) },
      { status: guard.status },
    );
  }
  return handleImageProxy(request, CONSOLE_IMAGE_OPTIONS);
}
