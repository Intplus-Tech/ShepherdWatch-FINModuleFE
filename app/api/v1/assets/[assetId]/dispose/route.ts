import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/assets/${assetId}/dispose`,
    // Backend defines this as PATCH /assets/:id/dispose.
    method: "PATCH",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
