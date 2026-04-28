import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { isCsrfValid } from "@/lib/csrf";

function getBackendTenantUrl(id: string): string {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }
  return `${baseUrl}/api/v1/branches/${encodeURIComponent(id)}`;
}

type UpdateBranchPayload = {
  name?: string
  region?: string
  address?: string
  leadPastorId?: string
  assignedAccountantId?: string
  currency?: "NGN" | "USD" | "GBP" | "EUR"
}

function normalizeUpdateBranchPayload(body: unknown): UpdateBranchPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const payload: UpdateBranchPayload = {}

  if ("name" in source) {
    const name = String(source.name ?? "").trim()
    if (name) payload.name = name
  }

  if ("region" in source) {
    const region = String(source.region ?? "").trim()
    if (region) payload.region = region
  }

  if ("address" in source) {
    const address = String(source.address ?? "").trim()
    if (address) payload.address = address
  }

  if ("leadPastorId" in source) {
    const leadPastorId = String(source.leadPastorId ?? "").trim()
    if (leadPastorId) payload.leadPastorId = leadPastorId
  }

  if ("assignedAccountantId" in source) {
    const assignedAccountantId = String(source.assignedAccountantId ?? "").trim()
    if (assignedAccountantId) payload.assignedAccountantId = assignedAccountantId
  }

  if ("currency" in source) {
    const currency = String(source.currency ?? "").toUpperCase()
    if (["NGN", "USD", "GBP", "EUR"].includes(currency)) {
      payload.currency = currency as UpdateBranchPayload["currency"]
    }
  }

  return Object.keys(payload).length > 0 ? payload : null
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request origin" },
          { status: 403 }
        ),
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

    const branchId = context.params.id;
    const backendUrl = getBackendTenantUrl(branchId);

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const bodyText = await backendResponse.text();
    let payload;
    try {
      payload = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      payload = null;
    }

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to fetch branch details",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req);
  } catch (error) {
    console.error("Get branch proxy error:", error);
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request origin" },
          { status: 403 }
        ),
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

    const branchId = context.params.id;
    const backendUrl = getBackendTenantUrl(branchId);
    
    const body = await req.json().catch(() => null);
    const payloadToSend = normalizeUpdateBranchPayload(body)
    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid payload. Provide at least one of: name, region, address, leadPastorId, assignedAccountantId, currency.",
          },
          { status: 400 }
        ),
        req
      );
    }

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

    const bodyText = await backendResponse.text();
    let payload;
    try {
      payload = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      payload = null;
    }

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to update branch",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req);
  } catch (error) {
    console.error("Update branch proxy error:", error);
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
