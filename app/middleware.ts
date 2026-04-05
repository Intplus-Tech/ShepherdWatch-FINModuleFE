import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-config";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.redirect(new URL("/login", req.url));

  // role-based check
  if (req.nextUrl.pathname.startsWith("/admin") && decoded.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-user-id", decoded.id);
  res.headers.set("x-user-role", decoded.role);
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
