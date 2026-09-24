import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** One statement line, with the entries matched to it. */
export async function GET(req: NextRequest, context: { params: Promise<{ lineId: string }> }) {
  const { lineId } = await context.params;
  return proxyRequest(req, {
    path: `${API_V1}/reconciliation/statement-lines/${encodeURIComponent(lineId)}`,
    method: "GET",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
