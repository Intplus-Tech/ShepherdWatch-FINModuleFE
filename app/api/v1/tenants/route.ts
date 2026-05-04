import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/backend-auth-url";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("BACKEND_TOKEN_COOKIE")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No valid session found." }, { status: 401 });
    }

    const backendUrl = getBackendUrl("api/v1/core/tenants");
    if (!backendUrl) {
      return NextResponse.json({ message: "Backend URL not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${backendUrl}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Handle empty response body
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
        { message: (data as any)?.message || "Failed to fetch tenants" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tenants proxy:", error);
    return NextResponse.json(
      { message: "Internal server error connecting to backend" },
      { status: 500 }
    );
  }
}
