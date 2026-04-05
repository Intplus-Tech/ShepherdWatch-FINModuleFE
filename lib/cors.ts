import type { NextRequest, NextResponse } from "next/server";
import { FRONTEND_ORIGIN } from "./auth-config";

const allowedOrigins = FRONTEND_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const isOriginAllowed = (req: NextRequest) => {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true;

  try {
    if (new URL(origin).host === host) return true;
  } catch {
    return false;
  }

  if (allowedOrigins.length === 0) return false;
  return allowedOrigins.includes(origin);
};

export const getCorsHeaders = (req: NextRequest) => {
  const origin = req.headers.get("origin");
  if (!origin || allowedOrigins.length === 0) return null;
  if (!allowedOrigins.includes(origin)) return null;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    Vary: "Origin",
  };
};

export const applyCors = (res: NextResponse, req: NextRequest) => {
  const headers = getCorsHeaders(req);
  if (!headers) return res;

  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }

  return res;
};
