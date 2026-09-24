import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** Bank statement CSV import. Multipart, so the body streams through. */
export async function POST(req: NextRequest) {
  return proxyRequest(req, {
    path: `${API_V1}/reconciliation/statements/import`,
    method: "POST",
    passthroughBody: true,
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
