import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyCors, getCorsHeaders } from "@/lib/cors";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    const parsedBody = forgotSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 }),
        req
      );
    }

    const { email } = parsedBody.data;
    const backendUrl = process.env.BACKEND_LOGIN_URL?.replace("/login", "/forgot-password");

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
      body: JSON.stringify({ email }),
    });

    const responseData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: responseData?.message || "Failed to send reset email. Please try again.",
          },
          { status: backendRes.status }
        ),
        req
      );
    }

    return applyCors(
      NextResponse.json(
        { success: true, message: responseData?.message || "Password reset email sent." },
        { status: 200 }
      ),
      req
    );
  } catch (error) {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Server error occurred while sending reset email" },
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
