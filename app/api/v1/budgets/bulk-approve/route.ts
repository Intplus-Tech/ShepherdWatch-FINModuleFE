import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** Approves several budgets in one call. */
export async function PATCH(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/budgets/bulk-approve`, method: "PATCH" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
