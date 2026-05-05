import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { isCsrfValid } from "@/lib/csrf";

import { getBackendApiUrl } from "@/lib/env"


type UpdateBranchStatusPayload = {
  status: "active" | "review" | "suspended" | "onboarding"
}

function normalizeStatusPayload(body: unknown): UpdateBranchStatusPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const status = String(source.status ?? "").toLowerCase().trim()
  if (!["active", "review", "suspended", "onboarding"].includes(status)) {
    return null
  }
  return { status: status as UpdateBranchStatusPayload["status"] }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    if (!isCsrfValid(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "CSRF token invalid" }, { status: 403 }),
        req
      );
    }

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      );
    }

    const branchId = (await context.params).id;
    if (!branchId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Branch ID is required" }, { status: 400 }),
        req
      );
    }

    const baseUrl = getBackendApiUrl();

    const body = await req.json().catch(() => null);
    const payloadToSend = normalizeStatusPayload(body)
    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid payload. status must be one of: active, review, suspended, onboarding.",
          },
          { status: 400 }
        ),
        req
      );
    }
    const backendUrl = `${baseUrl}/branches/${encodeURIComponent(branchId)}/status`;

    const backendResponse = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payloadToSend),
      cache: "no-store",
    });

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to update branch status",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req);
  } catch (error) {
    console.error("Update branch status proxy error:", error);
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
