import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bankAccountId: string }> }
) {
  const { bankAccountId } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/bank-accounts/${bankAccountId}/activate`,
    method: "PATCH",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
