import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** Tie a statement line to the ledger entries that add up to it. */
export async function POST(req: NextRequest, context: { params: Promise<{ lineId: string }> }) {
  const { lineId } = await context.params;
  return proxyRequest(req, {
    path: `${API_V1}/reconciliation/statement-lines/${encodeURIComponent(lineId)}/match`,
    method: "POST",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
