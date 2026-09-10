import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxy";
import { getCorsHeaders } from "@/lib/cors";

async function handle(req: NextRequest, method: "GET" | "POST") {
  return proxyRequest(req, {
    path: `${API_V1}/hr`,
    method,
  });
}

export async function GET(req: NextRequest) {
  return handle(req, "GET");
}

export async function POST(req: NextRequest) {
  return handle(req, "POST");
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
