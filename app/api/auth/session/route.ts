import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 })
  }

  // For now, just verify the token exists
  // In a full implementation, you could decode it or validate with backend
  try {
    // Decode JWT to get user info (basic JWT decode without verification)
    const [, payload] = accessToken.split(".")
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString())

    return NextResponse.json({
      user: {
        id: decoded.userId,
        email: decoded.userId,
        role: "user",
        name: decoded.userId?.split("@")[0] || "User",
      },
    })
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}
