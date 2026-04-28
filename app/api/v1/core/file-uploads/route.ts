import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"

function getRequiredEnv(name: "BACKEND_API_URL"): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request origin" },
          { status: 403 }
        ),
        req
      )
    }

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      )
    }

    const baseUrl = getRequiredEnv("BACKEND_API_URL")
    const url = `${baseUrl.replace(/\/+$/, "")}/api/v1/file-uploads`

    // Extract raw form data properly ensuring the boundary signature exists
    const incomingFormData = await req.formData()
    const outFormData = new FormData()

    const file = incomingFormData.get("file")
    if (file) outFormData.append("file", file)
    
    const folder = incomingFormData.get("folder")
    if (folder) outFormData.append("folder", folder)
    
    const branchId = incomingFormData.get("branchId")
    if (branchId) outFormData.append("branchId", branchId)

    const backendResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
      body: outFormData, // Fetch will automatically append the correct Content-Type with right boundary
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "File upload failed via backend",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("File upload proxy error:", error)
    return applyCors(
      NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      ),
      req
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request origin" },
          { status: 403 }
        ),
        req
      )
    }

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      )
    }

    const baseUrl = getRequiredEnv("BACKEND_API_URL")
    const url = new URL(`${baseUrl.replace(/\/+$/, "")}/api/v1/file-uploads`)

    const searchParams = req.nextUrl.searchParams
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const branchId = searchParams.get("branchId")
    const mimeType = searchParams.get("mimeType")
    const folder = searchParams.get("folder")

    if (page) url.searchParams.set("page", page)
    if (limit) url.searchParams.set("limit", limit)
    if (branchId) url.searchParams.set("branchId", branchId)
    if (mimeType) url.searchParams.set("mimeType", mimeType)
    if (folder) url.searchParams.set("folder", folder)

    const backendResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to fetch files via backend",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: backendResponse.status }), req)
  } catch (error) {
    console.error("File uploads list proxy error:", error)
    return applyCors(
      NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      ),
      req
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req)
  return new NextResponse(null, { status: 204, headers: headers ?? undefined })
}
