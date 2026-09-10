import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const { recordId } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/hr/trainings/records/${recordId}`,
    method: "GET",
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const { recordId } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/hr/trainings/records/${recordId}`,
    method: "PATCH",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
