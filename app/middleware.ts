import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "@/lib/jwt";
import { sessionStore } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.redirect(new URL("/login", req.url));

  const session = sessionStore.getSession(decoded.userId);
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  // role-based check
  if (req.nextUrl.pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-user-id", session.userId);
  res.headers.set("x-user-role", session.role);
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};