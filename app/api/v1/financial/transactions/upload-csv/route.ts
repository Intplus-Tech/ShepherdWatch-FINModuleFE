import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

// Multipart CSV upload — pass the body through untouched.
export async function POST(req: NextRequest) {
  return proxyRequest(req, {
    path: `${API_V1}/transactions/upload-csv`,
    method: "POST",
    passthroughBody: true,
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
