import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { isCsrfValid } from "@/lib/csrf";
import { applyAuthCookies, executeWithRefreshRetry } from "@/lib/backend-refresh";
import { getBackendUrl } from "@/lib/backend-auth-url";

type ProxyOptions = {
  /** Backend path under base URL, e.g. `${API_V1}/transactions/summary`. */
  path: string;
  /** HTTP method to forward. */
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** When true, forwards body as raw stream (for multipart/file uploads). Default false (JSON). */
  passthroughBody?: boolean;
  /** When true, requires CSRF token for unsafe methods (default true for non-GET). */
  requireCsrf?: boolean;
};

/**
 * Generic helper for proxying a Next.js route handler request to the backend
 * while preserving auth refresh, CORS, CSRF, and query string forwarding.
 */
export async function proxyRequest(req: NextRequest, opts: ProxyOptions): Promise<NextResponse> {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
      req
    );
  }

  const enforceCsrf = opts.requireCsrf ?? opts.method !== "GET";
  if (enforceCsrf && !isCsrfValid(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "CSRF token invalid" }, { status: 403 }),
      req
    );
  }

  const backendBase = getBackendUrl(opts.path);
  if (!backendBase) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  const backendUrl = new URL(backendBase);
  req.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  let body: BodyInit | undefined;
  if (opts.method !== "GET" && opts.method !== "DELETE") {
    if (opts.passthroughBody) {
      const ct = req.headers.get("content-type");
      if (ct) headers["Content-Type"] = ct;
      body = req.body ?? undefined;
    } else {
      headers["Content-Type"] = "application/json";
      const json = await req.json().catch(() => null);
      body = JSON.stringify(json ?? {});
    }
  }

  try {
    const { res: backendRes, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl.toString(), {
        method: opts.method,
        headers: { ...headers, Authorization: `Bearer ${token}` },
        body,
        cache: "no-store",
        // @ts-expect-error duplex is required when streaming a body in undici
        duplex: opts.passthroughBody ? "half" : undefined,
      })
    );

    const contentType = backendRes.headers.get("content-type") ?? "";
    let response: NextResponse;
    if (contentType.includes("application/json")) {
      const data = await backendRes.json().catch(() => null);
      if (!backendRes.ok) {
        response = NextResponse.json(
          {
            success: false,
            message:
              (data && typeof data === "object" && "message" in data ? (data as { message?: string }).message : null) ??
              "Backend request failed",
          },
          { status: backendRes.status }
        );
      } else {
        response = NextResponse.json(data, { status: backendRes.status });
      }
    } else {
      const buf = await backendRes.arrayBuffer();
      response = new NextResponse(buf, {
        status: backendRes.status,
        headers: contentType ? { "Content-Type": contentType } : undefined,
      });
    }

    applyAuthCookies(response, refreshedTokens);
    return applyCors(response, req);
  } catch (error) {
    console.error(`Proxy error (${opts.method} ${opts.path}):`, error);
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    );
  }
}

export function corsOptions(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
