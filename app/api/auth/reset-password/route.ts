import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyCors, getCorsHeaders } from "@/lib/cors";

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    const parsedBody = resetSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid reset payload" }, { status: 400 }),
        req
      );
    }

    const { token, password } = parsedBody.data;
    const backendUrl = process.env.BACKEND_LOGIN_URL?.replace("/login", "/reset-password");

    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const responseData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: responseData?.message || "Failed to reset password. Please try again.",
          },
          { status: backendRes.status }
        ),
        req
      );
    }

    return applyCors(
      NextResponse.json(
        { success: true, message: responseData?.message || "Password successfully reset." },
        { status: 200 }
      ),
      req
    );
  } catch (err) {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Server error occurred while resetting password" },
        { status: 502 }
      ),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
