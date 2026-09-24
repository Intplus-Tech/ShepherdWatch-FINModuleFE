import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** Approved requisitions not yet posted, for the New Entry picker. */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/general-ledger/requisitions`, method: "GET" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
