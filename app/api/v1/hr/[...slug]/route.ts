import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxy";
import { getCorsHeaders } from "@/lib/cors";

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

async function handle(
  req: NextRequest,
  context: RouteContext,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
) {
  const { slug } = await context.params;
  const path = `${API_V1}/hr/${slug.join("/")}`;
  return proxyRequest(req, {
    path,
    method,
  });
}

export async function GET(req: NextRequest, context: RouteContext) {
  return handle(req, context, "GET");
}

export async function POST(req: NextRequest, context: RouteContext) {
  return handle(req, context, "POST");
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return handle(req, context, "PUT");
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return handle(req, context, "PATCH");
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return handle(req, context, "DELETE");
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}
