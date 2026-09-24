import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** Reverse a match: the line and its entries go back to unreconciled. */
export async function POST(req: NextRequest, context: { params: Promise<{ lineId: string }> }) {
  const { lineId } = await context.params;
  return proxyRequest(req, {
    path: `${API_V1}/reconciliation/statement-lines/${encodeURIComponent(lineId)}/unmatch`,
    method: "POST",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
