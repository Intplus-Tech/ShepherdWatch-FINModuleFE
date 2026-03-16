import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { sessionStore } from "@/lib/session"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      sessionStore.deleteSession(payload.userId)
    }
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set("token", "", { maxAge: 0, path: "/" })
  return res
}
