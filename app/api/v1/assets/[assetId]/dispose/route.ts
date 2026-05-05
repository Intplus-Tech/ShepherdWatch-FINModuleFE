import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  return proxyRequest(req, {
    path: `api/v1/assets/${assetId}/dispose`,
    method: "POST",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
