import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/hr/documents/${id}/verify`,
    method: "POST",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
