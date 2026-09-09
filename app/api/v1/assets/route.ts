import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

/** The asset register: list and create. */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/assets`, method: "GET" });
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/assets`, method: "POST" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
