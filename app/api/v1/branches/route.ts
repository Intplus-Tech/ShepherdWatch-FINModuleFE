import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { isCsrfValid } from "@/lib/csrf";
import { applyAuthCookies, executeWithRefreshRetry } from "@/lib/backend-refresh";
import { getBackendUrl } from "@/lib/backend-auth-url";

function getBackendBranchesUrl(): string | null {
  return getBackendUrl(`${API_V1}/branches`);
}

type CreateBranchPayload = {
  name: string
  code: string
  branchType: "pioneer" | "growing" | "established"
  regionId?: string
  address?: string
  leadPastorId?: string
  assignedAccountantId?: string
  currency?: "NGN" | "USD" | "GBP" | "EUR"
}

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i

function normalizeBranchType(raw: unknown): CreateBranchPayload["branchType"] | null {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")

  if (!value) return null

  if (["pioneer", "new", "startup", "start_up"].includes(value)) return "pioneer"
  if (["growing", "growth"].includes(value)) return "growing"
  if (["established", "mature", "stable"].includes(value)) return "established"
  return null
}

function normalizeCreateBranchPayload(
  body: unknown
): { payload: CreateBranchPayload; missing?: undefined } | { payload?: undefined; missing: string[] } {
  if (!body || typeof body !== "object") return { missing: ["name", "code", "branchType"] }
  const source = body as Record<string, unknown>
  const name = String(source.name ?? "").trim()
  const code = String(source.code ?? source.branchCode ?? "").trim()
  const branchType = normalizeBranchType(
    source.branchType ?? source.branch_type ?? source.type ?? source.category
  )
  const regionId = String(source.regionId ?? source.region ?? "").trim()
  const address = String(source.address ?? "").trim()
  const leadPastorId = String(source.leadPastorId ?? "").trim()
  const assignedAccountantId = String(source.assignedAccountantId ?? "").trim()
  const currencyRaw = String(source.currency ?? "").toUpperCase()

  const missing: string[] = []
  if (!name) missing.push("name")
  if (!code) missing.push("code")
  if (!branchType) missing.push("branchType")
  if (missing.length || !branchType) return { missing }

  const payload: CreateBranchPayload = {
    name,
    code,
    branchType,
  }
  if (OBJECT_ID_PATTERN.test(regionId)) payload.regionId = regionId
  if (address) payload.address = address
  if (leadPastorId) payload.leadPastorId = leadPastorId
  if (assignedAccountantId) payload.assignedAccountantId = assignedAccountantId
  if (["NGN", "USD", "GBP", "EUR"].includes(currencyRaw)) {
    payload.currency = currencyRaw as CreateBranchPayload["currency"]
  }

  return { payload }
}

export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
      req
    );
  }

  const backendUrl = getBackendBranchesUrl();
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  ["page", "limit", "status", "branchType", "search"].forEach((key) => {
    const val = searchParams.get(key);
    if (val !== null && val !== "") query.set(key, val);
  });
  const regionFilter = searchParams.get("regionId") ?? searchParams.get("region");
  if (regionFilter && OBJECT_ID_PATTERN.test(regionFilter)) query.set("regionId", regionFilter);
  const url = query.toString() ? `${backendUrl}?${query}` : backendUrl;

  const { res: backendRes, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
  );

  const responseText = await backendRes.text();
  const contentType = backendRes.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let response: NextResponse;
  if (isJson) {
    try {
      const responseData = responseText ? JSON.parse(responseText) : null;
      response = NextResponse.json(responseData, { status: backendRes.status });
    } catch {
      response = NextResponse.json(
        { success: false, message: "Invalid response received from branches service" },
        { status: 502 }
      );
    }
  } else {
    response = new NextResponse(responseText, {
      status: backendRes.status,
      headers: contentType ? { "Content-Type": contentType } : undefined,
    });
  }

  applyAuthCookies(response, refreshedTokens);
  return applyCors(response, req);
}

export async function POST(req: NextRequest) {
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

  const backendUrl = getBackendBranchesUrl();
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  const bodyJson = await req.json().catch(() => null);
  const { payload, missing } = normalizeCreateBranchPayload(bodyJson)
  if (!payload) {
    return applyCors(
      NextResponse.json(
        { success: false, message: `Invalid payload. Missing or invalid: ${missing.join(", ")}.` },
        { status: 400 }
      ),
      req
    )
  }

  const { res: backendRes, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
    fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  );

  const responseText = await backendRes.text();
  const contentType = backendRes.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let response: NextResponse;
  if (isJson) {
    try {
      const responseData = responseText ? JSON.parse(responseText) : null;
      response = NextResponse.json(responseData, { status: backendRes.status });
    } catch {
      response = NextResponse.json(
        { success: false, message: "Invalid response received from branches service" },
        { status: 502 }
      );
    }
  } else {
    response = new NextResponse(responseText, {
      status: backendRes.status,
      headers: contentType ? { "Content-Type": contentType } : undefined,
    });
  }

  applyAuthCookies(response, refreshedTokens);
  return applyCors(response, req);
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
