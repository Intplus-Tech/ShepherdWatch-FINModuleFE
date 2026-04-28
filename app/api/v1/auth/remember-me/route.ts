import { NextRequest, NextResponse } from "next/server";
import { REMEMBER_ME_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders } from "@/lib/cors";

export async function GET(req: NextRequest) {
  const rememberMe = req.cookies.get(REMEMBER_ME_COOKIE)?.value === "true";
  return applyCors(NextResponse.json({ rememberMe }), req);
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
