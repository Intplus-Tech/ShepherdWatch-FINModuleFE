import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_LOGIN_URL || "https://shw-fin-b-c.onrender.com";

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("BACKEND_TOKEN_COOKIE")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No valid session found." }, { status: 401 });
    }

    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/core/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to update user status" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating user status proxy:", error);
    return NextResponse.json(
      { message: "Internal server error connecting to backend" },
      { status: 500 }
    );
  }
}
