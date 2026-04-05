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
