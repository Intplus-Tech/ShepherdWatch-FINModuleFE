import { NextRequest, NextResponse } from "next/server";
import { verifyTokenWithMeta, signAccessToken, signRefreshToken } from "@/lib/jwt";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  BACKEND_TOKEN_COOKIE,
  BACKEND_REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth-config";
import { refreshStore } from "@/lib/refresh-store";
import { randomUUID } from "crypto";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { isCsrfValid } from "@/lib/csrf";

export async function POST(req: NextRequest) {
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
      NextResponse.json(
        { success: false, message: "CSRF token invalid" },
        { status: 403 }
      ),
      req
    );
  }

  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return applyCors(
      NextResponse.json(
      { success: false, message: "Refresh token missing" },
      { status: 401 }
      ),
      req
    );
  }

  const verified = verifyTokenWithMeta(refreshToken);
  if (!verified || verified.tokenType !== "refresh") {
    return applyCors(
      NextResponse.json(
      { success: false, message: "Invalid refresh token" },
      { status: 401 }
      ),
      req
    );
  }

  const tokenId = verified.jwtId;
  if (!tokenId || !(await refreshStore.hasValid(tokenId))) {
    // The refresh token ID is unknown; reject rotation to prevent replay.
    return applyCors(
      NextResponse.json(
      { success: false, message: "Refresh token not recognized" },
      { status: 401 }
      ),
      req
    );
  }

  const payload = verified.payload;
  const accessTokenId = randomUUID();
  const newRefreshTokenId = randomUUID();
  const accessToken = signAccessToken(payload, accessTokenId);
  const newRefreshToken = signRefreshToken(payload, newRefreshTokenId);

  const extRefreshToken = req.cookies.get(BACKEND_REFRESH_TOKEN_COOKIE)?.value;
  let newExtAccessToken = null;
  let newExtRefreshToken = null;

  if (extRefreshToken) {
    const backendRefreshUrl = process.env.BACKEND_LOGIN_URL?.replace("/login", "/refresh-token");
    if (backendRefreshUrl) {
      try {
        const backendRes = await fetch(backendRefreshUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refreshToken: extRefreshToken }),
        });
        if (backendRes.ok) {
          const backendPayload = await backendRes.json();
          if (backendPayload?.data?.accessToken) {
            newExtAccessToken = backendPayload.data.accessToken;
          }
          if (backendPayload?.data?.refreshToken) {
            newExtRefreshToken = backendPayload.data.refreshToken;
          }
        }
      } catch (err) {
        console.error("Backend refresh failed:", err);
      }
    }
  }

  await refreshStore.delete(tokenId);
  await refreshStore.add(
    newRefreshTokenId,
    payload.id,
    Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000
  );

  const response = NextResponse.json(
    { success: true, token: accessToken },
    { status: 200 }
  );

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: newRefreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });

  if (newExtAccessToken) {
    response.cookies.set({
      name: BACKEND_TOKEN_COOKIE,
      value: newExtAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  }
  
  if (newExtRefreshToken || extRefreshToken) {
    response.cookies.set({
      name: BACKEND_REFRESH_TOKEN_COOKIE,
      value: (newExtRefreshToken || extRefreshToken) as string,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  }

  return applyCors(response, req);
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
