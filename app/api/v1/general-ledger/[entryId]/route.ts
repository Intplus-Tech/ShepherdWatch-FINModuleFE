import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** One ledger entry, for the detail and receipt drawer. */
export async function GET(req: NextRequest, context: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await context.params;
  return proxyRequest(req, { path: `${API_V1}/general-ledger/${encodeURIComponent(entryId)}`, method: "GET" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
