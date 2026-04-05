import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders } from "@/lib/cors"

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return applyCors(NextResponse.json({ message: "Unauthenticated" }, { status: 401 }), req)

  const payload = verifyToken(token)
  if (!payload) return applyCors(NextResponse.json({ message: "Invalid token" }, { status: 401 }), req)

  return applyCors(NextResponse.json({
    user: {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    },
  }), req)
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
