import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  BACKEND_REFRESH_TOKEN_COOKIE,
  BACKEND_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth-config";
import { getAuthEndpoint } from "@/lib/backend-auth-url";

type TokenPair = {
  accessToken: string;
  refreshToken?: string;
};

type AssetClassCreateBody = {
  name: string;
  description?: string;
  defaultDepreciationMethod?: "straight_line" | "declining_balance";
  defaultUsefulLifeYears?: number;
  defaultResidualValuePercent?: number;
};

type AssetClassCreateLegacyBody = {
  name: string;
  description?: string;
  depreciationMethod?: "straight_line" | "declining_balance";
  usefulLifeYears?: number;
  residualValuePercent?: number;
};

function getBackendUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/asset-classes`;
  }
  return null;
}

function pickToken(source: unknown, keys: string[]): string {
  if (!source || typeof source !== "object") return "";
  const sourceRecord = source as Record<string, unknown>;
  for (const key of keys) {
    const value = sourceRecord[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "";
}

async function parseJsonSafely(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}

async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  const refreshUrl = getAuthEndpoint("refresh-token");
  if (!refreshUrl) return null;

  const refreshRes = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!refreshRes.ok) return null;

  const payload = await parseJsonSafely(refreshRes);
  const payloadRecord = payload && typeof payload === "object"
    ? (payload as Record<string, unknown>)
    : null;
  const data =
    payloadRecord?.data && typeof payloadRecord.data === "object"
      ? (payloadRecord.data as Record<string, unknown>)
      : null;
  const tokens =
    data?.tokens && typeof data.tokens === "object"
      ? (data.tokens as Record<string, unknown>)
      : null;

  const accessToken =
    pickToken(tokens, ["accessToken", "access_token", "token"]) ||
    pickToken(data, ["accessToken", "access_token", "token"]) ||
    pickToken(payloadRecord, ["accessToken", "access_token", "token"]);

  if (!accessToken) return null;

  const nextRefreshToken =
    pickToken(tokens, ["refreshToken", "refresh_token"]) ||
    pickToken(data, ["refreshToken", "refresh_token"]) ||
    pickToken(payloadRecord, ["refreshToken", "refresh_token"]);

  return {
    accessToken,
    ...(nextRefreshToken ? { refreshToken: nextRefreshToken } : {}),
  };
}

async function callAssetClasses(
  url: string,
  method: "GET" | "POST",
  token: string,
  body?: unknown
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(method === "POST" ? { body: JSON.stringify(body ?? {}) } : {}),
    cache: "no-store",
  });
}

function applyAuthCookies(response: NextResponse, tokens: TokenPair | null) {
  if (!tokens) return;

  response.cookies.set({
    name: BACKEND_TOKEN_COOKIE,
    value: tokens.accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  if (tokens.refreshToken) {
    response.cookies.set({
      name: BACKEND_REFRESH_TOKEN_COOKIE,
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  }
}

async function executeWithRefreshRetry(
  req: NextRequest,
  url: string,
  method: "GET" | "POST",
  body?: unknown
): Promise<{ res: Response; refreshedTokens: TokenPair | null }> {
  let token = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value ?? "";
  let refreshedTokens: TokenPair | null = null;

  if (!token) {
    const refreshToken = req.cookies.get(BACKEND_REFRESH_TOKEN_COOKIE)?.value ?? "";
    if (refreshToken) {
      refreshedTokens = await refreshAccessToken(refreshToken);
      token = refreshedTokens?.accessToken ?? "";
    }
  }

  if (!token) {
    return {
      res: new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 }),
      refreshedTokens,
    };
  }

  let res = await callAssetClasses(url, method, token, body);
  if (![401, 403].includes(res.status)) {
    return { res, refreshedTokens };
  }

  const refreshToken = req.cookies.get(BACKEND_REFRESH_TOKEN_COOKIE)?.value ?? "";
  if (!refreshToken) {
    return { res, refreshedTokens };
  }

  const retriedTokens = await refreshAccessToken(refreshToken);
  if (!retriedTokens?.accessToken) {
    return { res, refreshedTokens };
  }

  refreshedTokens = retriedTokens;
  res = await callAssetClasses(url, method, retriedTokens.accessToken, body);

  return { res, refreshedTokens };
}

function normalizeCreatePayload(body: unknown): AssetClassCreateBody | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;

  const name = typeof source.name === "string" ? source.name.trim() : "";
  if (!name) return null;

  const payload: AssetClassCreateBody = { name };

  if (typeof source.description === "string" && source.description.trim()) {
    payload.description = source.description.trim();
  }

  const normalizedMethod = normalizeDepreciationMethod(
    source.defaultDepreciationMethod ?? source.depreciationMethod
  );
  if (normalizedMethod) {
    payload.defaultDepreciationMethod = normalizedMethod;
  }

  const usefulLife = toOptionalNumber(
    source.defaultUsefulLifeYears ?? source.usefulLifeYears
  );
  if (usefulLife !== undefined) {
    payload.defaultUsefulLifeYears = usefulLife;
  }

  const residual = toOptionalNumber(
    source.defaultResidualValuePercent ?? source.residualValuePercent
  );
  if (residual !== undefined) {
    payload.defaultResidualValuePercent = residual;
  }

  return payload;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeDepreciationMethod(
  value: unknown
): "straight_line" | "declining_balance" | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (normalized === "straight_line" || normalized === "straightline") {
    return "straight_line";
  }

  if (
    normalized === "declining_balance" ||
    normalized === "decliningbalance" ||
    normalized === "reducing_balance" ||
    normalized === "reducingbalance"
  ) {
    return "declining_balance";
  }

  return null;
}

function hasExtendedAssetClassFields(payload: AssetClassCreateBody): boolean {
  return (
    payload.defaultDepreciationMethod !== undefined ||
    payload.defaultUsefulLifeYears !== undefined ||
    payload.defaultResidualValuePercent !== undefined
  );
}

function hasExplicitMethod(payload: AssetClassCreateBody): boolean {
  return payload.defaultDepreciationMethod !== undefined;
}

function toLegacyCreatePayload(payload: AssetClassCreateBody): AssetClassCreateLegacyBody {
  return {
    name: payload.name,
    ...(payload.description ? { description: payload.description } : {}),
    ...(payload.defaultDepreciationMethod
      ? { depreciationMethod: payload.defaultDepreciationMethod }
      : {}),
    ...(payload.defaultUsefulLifeYears !== undefined
      ? { usefulLifeYears: payload.defaultUsefulLifeYears }
      : {}),
    ...(payload.defaultResidualValuePercent !== undefined
      ? { residualValuePercent: payload.defaultResidualValuePercent }
      : {}),
  };
}

export async function GET(req: NextRequest) {
  try {
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Pass along search params (e.g. for pagination if needed)
    const { searchParams } = new URL(req.url);
    const queryStr = searchParams.toString();
    const url = queryStr ? `${backendUrl}?${queryStr}` : backendUrl;

    const { res, refreshedTokens } = await executeWithRefreshRetry(req, url, "GET");

    const data = await parseJsonSafely(res);

    const response = NextResponse.json(data, {
      status: res.status,
    });
    applyAuthCookies(response, refreshedTokens);

    return response;
  } catch (error: unknown) {
    console.error("Asset Classes GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 }
      );
    }

    const rawBody = await req.json().catch(() => null);
    const body = normalizeCreatePayload(rawBody);
    if (!body) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const minimalBody: Pick<AssetClassCreateBody, "name" | "description"> = {
      name: body.name,
      ...(body.description ? { description: body.description } : {}),
    };

    const payloadCandidates: Array<AssetClassCreateBody | AssetClassCreateLegacyBody> =
      hasExtendedAssetClassFields(body)
        ? hasExplicitMethod(body)
          ? [body, toLegacyCreatePayload(body)]
          : [body, toLegacyCreatePayload(body), minimalBody]
        : [body];

    let res: Response = new Response(
      JSON.stringify({ success: false, message: "Invalid request body" }),
      { status: 400 }
    );
    let refreshedTokens: TokenPair | null = null;

    for (const payloadCandidate of payloadCandidates) {
      const attempt = await executeWithRefreshRetry(req, backendUrl, "POST", payloadCandidate);
      res = attempt.res;
      if (attempt.refreshedTokens) {
        refreshedTokens = attempt.refreshedTokens;
      }

      if (res.ok) {
        break;
      }

      // Do not keep retrying across non-validation failures.
      if (res.status !== 400) {
        break;
      }
    }

    const data = await parseJsonSafely(res);

    const response = NextResponse.json(data, {
      status: res.status,
    });
    applyAuthCookies(response, refreshedTokens);

    return response;
  } catch (error: unknown) {
    console.error("Asset Classes POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
