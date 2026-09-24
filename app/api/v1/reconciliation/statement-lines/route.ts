import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** Imported bank statement lines — the Multi-Bank Ledger table. */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/reconciliation/statement-lines`, method: "GET" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
