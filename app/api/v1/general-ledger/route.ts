import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/**
 * The General Ledger collection: what the church has booked, plus bank lines
 * allocated straight to a category.
 *
 * A POST carries the receipt, so the body is streamed through untouched and
 * the browser's multipart boundary survives.
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/general-ledger`, method: "GET" });
}

export async function POST(req: NextRequest) {
  const isMultipart = (req.headers.get("content-type") ?? "").includes("multipart/form-data");
  return proxyRequest(req, { path: `${API_V1}/general-ledger`, method: "POST", passthroughBody: isMultipart });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
