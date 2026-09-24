import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** Unreconciled entries that could explain this statement line. */
export async function GET(req: NextRequest, context: { params: Promise<{ lineId: string }> }) {
  const { lineId } = await context.params;
  return proxyRequest(req, {
    path: `${API_V1}/reconciliation/statement-lines/${encodeURIComponent(lineId)}/match-candidates`,
    method: "GET",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
