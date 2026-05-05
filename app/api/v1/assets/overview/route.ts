import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyRequest(req, { path: "api/v1/assets/overview", method: "GET" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
