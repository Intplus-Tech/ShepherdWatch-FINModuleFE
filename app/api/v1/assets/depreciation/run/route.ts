import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  return proxyRequest(req, { path: "api/v1/assets/depreciation/run", method: "POST" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
