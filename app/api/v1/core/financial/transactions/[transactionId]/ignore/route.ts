import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;
  return proxyRequest(req, {
    path: `api/v1/transactions/${transactionId}/ignore`,
    method: "POST",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
