import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_LOGIN_URL || "https://shw-fin-b-c.onrender.com";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("BACKEND_TOKEN_COOKIE")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No valid session found." }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/core/financial/coa`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let data = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: (data as any)?.message || "Failed to create COA" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating COA proxy:", error);
    return NextResponse.json(
      { message: "Internal server error connecting to backend" },
      { status: 500 }
    );
  }
}
