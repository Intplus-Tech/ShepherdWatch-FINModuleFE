import { API_V1 } from "@/lib/api";
import { NextRequest } from "next/server";
import { corsOptions, proxyRequest } from "@/lib/proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  const { id, employeeId } = await params;
  return proxyRequest(req, {
    path: `${API_V1}/hr/payroll/runs/${id}/employees/${employeeId}`,
    method: "GET",
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}
