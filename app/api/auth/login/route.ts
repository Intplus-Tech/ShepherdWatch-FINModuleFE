import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
})

const BACKEND_URL = process.env.BACKEND_URL || "http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    // Call backend API for authentication
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { message: errorData.message || "Login failed" },
        { status: backendResponse.status }
      )
    }

    const backendData = await backendResponse.json()
    const { accessToken, refreshToken } = backendData.data

    // Create response with user data
    const res = NextResponse.json({
      user: {
        id: data.email,
        email: data.email,
        role: "user",
        name: data.email.split("@")[0],
      },
    })

    // Store backend tokens in cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: data.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 1 day
      path: "/",
    }

    res.cookies.set("accessToken", accessToken, cookieOptions)
    res.cookies.set("refreshToken", refreshToken, cookieOptions)

    return res
  } catch (err) {
    console.error("Login error:", err)
    const message = err instanceof z.ZodError ? "Invalid login payload" : "Login failed"
    return NextResponse.json({ message }, { status: 400 })
  }
}
