import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/assets/${assetId}`,
    method: "GET",
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/assets/${assetId}`,
    method: "PATCH",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
