import { NextRequest, NextResponse } from "next/server";
import { applyAuthCookies, executeWithRefreshRetry } from "@/lib/backend-refresh";
import { getBackendUrl } from "@/lib/backend-auth-url";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId  } = await params;
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const backendUrl = getBackendUrl(`api/v1/core/users/${userId}/status`);
    if (!backendUrl) {
      return NextResponse.json({ message: "Backend URL not configured" }, { status: 500 });
    }

    const { res: backendRes, refreshedTokens } = await executeWithRefreshRetry(request, (token) =>
      fetch(backendUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
    );

    const data = await backendRes.json();

    let response: NextResponse;
    if (!backendRes.ok) {
      response = NextResponse.json(
        { message: data.message || "Failed to update user status" },
        { status: backendRes.status }
      );
    } else {
      response = NextResponse.json(data);
    }

    applyAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    console.error("Error updating user status proxy:", error);
    return NextResponse.json(
      { message: "Internal server error connecting to backend" },
      { status: 500 }
    );
  }
}
