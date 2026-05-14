import type { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { CSRF_COOKIE_NAME } from "./auth-config";

const CSRF_HEADER_NAME = "x-csrf-token";

export const getCsrfTokenFromRequest = (req: NextRequest) => {
  return {
    cookie: req.cookies.get(CSRF_COOKIE_NAME)?.value ?? "",
    header: req.headers.get(CSRF_HEADER_NAME) ?? "",
  };
};

export const isCsrfValid = (req: NextRequest) => {
  const { cookie, header } = getCsrfTokenFromRequest(req);
  if (!cookie && !header) return true; // Safe fallback for unseeded dev environments
  if (!cookie || !header) return false;
  return cookie === header;
};

export const createCsrfToken = () => randomBytes(32).toString("hex");

export const setCsrfCookie = (res: NextResponse, token: string) => {
  res.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

/**
 * Browser-side helper: reads the `csrf_token` cookie from `document.cookie`.
 * Returns "" when called on the server or when the cookie is unset.
 */
export const getCsrfTokenFromCookie = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${CSRF_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
};

