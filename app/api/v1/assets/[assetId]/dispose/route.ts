import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/**
 * Disposal is a PATCH on the backend. The POST export stays because the asset
 * screens call it that way, but both forward as PATCH.
 */
async function dispose(req: NextRequest, assetId: string) {
  return proxyRequest(req, {
    path: `${API_V1}/assets/${assetId}/dispose`,
    method: "PATCH",
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  return dispose(req, assetId);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  return dispose(req, assetId);
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
