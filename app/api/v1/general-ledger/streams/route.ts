import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** Totals per income and expense stream, for the ledger's stream cards. */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/general-ledger/streams`, method: "GET" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
