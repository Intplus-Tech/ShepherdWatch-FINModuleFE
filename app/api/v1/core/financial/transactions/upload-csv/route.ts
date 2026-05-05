import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

// Multipart CSV upload — pass the body through untouched.
export async function POST(req: NextRequest) {
  return proxyRequest(req, {
    path: "api/v1/transactions/upload-csv",
    method: "POST",
    passthroughBody: true,
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
