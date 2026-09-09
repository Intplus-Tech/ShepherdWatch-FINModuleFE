import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/hr/employees/${id}`,
    method: "GET",
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/hr/employees/${id}`,
    method: "PUT",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
