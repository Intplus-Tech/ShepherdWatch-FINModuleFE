import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { sessionStore } from "@/lib/session"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ message: "Invalid token" }, { status: 401 })

  const session = sessionStore.getSession(payload.userId)
  if (!session) return NextResponse.json({ message: "Session expired" }, { status: 401 })

  return NextResponse.json({
    user: {
      id: payload.userId,
      email: payload.userId,
      role: session.role,
      name: payload.userId.split("@")[0],
    },
  })
}
