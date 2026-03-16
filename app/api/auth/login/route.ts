import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createToken } from "@/lib/jwt"
import { sessionStore } from "@/lib/session"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    const user = {
      id: data.email,
      email: data.email,
      role: "director",
      name: data.email.split("@")[0],
    }

    const token = createToken({ userId: user.id, role: user.role })
    const sessionDuration = data.rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60

    sessionStore.createSession(user.id, {
      role: user.role,
      expires: Date.now() + sessionDuration,
    })

    const res = NextResponse.json({ user })
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: data.rememberMe ? 60 * 60 * 24 * 30 : undefined,
      path: "/",
    })

    return res
  } catch (err) {
    const message = err instanceof z.ZodError ? "Invalid login payload" : "Login failed"
    return NextResponse.json({ message }, { status: 400 })
  }
}
