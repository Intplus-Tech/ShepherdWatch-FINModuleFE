import { NextRequest, NextResponse } from "next/server"
import { verifyToken, verifyTokenWithMeta } from "@/lib/jwt"
import { refreshStore } from "@/lib/refresh-store"
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json(
      { ok: false, message: "Invalid request origin" },
      { status: 403 }
      ),
      req
    );
  }

  if (!isCsrfValid(req)) {
    return applyCors(
      NextResponse.json(
        { ok: false, message: "CSRF token invalid" },
        { status: 403 }
      ),
      req
    );
  }

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  const payload = accessToken ? verifyToken(accessToken) : null
  const refreshMeta = !payload && refreshToken ? verifyTokenWithMeta(refreshToken) : null
  const refreshPayload = refreshMeta?.tokenType === "refresh" ? refreshMeta.payload : null

  const userId = payload?.id ?? refreshPayload?.id
  if (userId) {
    await refreshStore.deleteAllForUser(userId)
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  return applyCors(res, req)
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
