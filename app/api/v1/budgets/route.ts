import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/**
 * The budget collection. `/budgets/{id}` and its sub-routes already existed,
 * but this one did not, so every list and create from the budget screens hit
 * Next's 404 instead of the backend. `/financial/budgets` proxies the same
 * backend path for callers that use that prefix.
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/budgets`, method: "GET" });
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/budgets`, method: "POST" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
