import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  return proxyRequest(req, { path: `${API_V1}/transactions/sync`, method: "POST" });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
