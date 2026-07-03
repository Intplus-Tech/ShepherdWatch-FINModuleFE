/**
 * Lightweight, dependency-free helpers for reading non-sensitive claims from a
 * backend JWT (the access token). We never trust these claims for authorization
 * — the backend re-validates the bearer token on every request. We only use
 * them to recover values the client failed to supply (e.g. branchId) so strict
 * backend validators don't reject otherwise-authenticated requests.
 */

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }
  // Fallback for non-Node runtimes.
  return atob(padded);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = decodeBase64Url(parts[1]);
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function pickString(record: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!record) return "";
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  // Look one level into nested objects (branch.id, tenant.id, etc.).
  for (const key of Object.keys(record)) {
    const nested = record[key];
    if (nested && typeof nested === "object") {
      const inner = pickString(nested as Record<string, unknown>, keys);
      if (inner) return inner;
    }
  }
  return "";
}

/**
 * Best-effort extraction of a branch identifier from a backend access token.
 * Falls back to tenantId-shaped claims because some deployments use a single
 * identifier for both concepts.
 */
export function extractBranchIdFromJwt(token: string): string {
  const payload = decodeJwtPayload(token);
  if (!payload) return "";
  return (
    pickString(payload, ["branchId", "branch_id"]) ||
    pickString(payload, ["tenantId", "tenant_id"])
  );
}

/**
 * Extract branchId and tenantId as distinct values from a backend access token.
 * Branch-scoped backend validators expect `branchId`; conflating it with
 * tenantId (as older code did) makes them reject otherwise-valid requests.
 */
export function extractIdsFromJwt(token: string): { branchId: string; tenantId: string } {
  const payload = decodeJwtPayload(token);
  if (!payload) return { branchId: "", tenantId: "" };
  return {
    branchId: pickString(payload, ["branchId", "branch_id"]),
    tenantId: pickString(payload, ["tenantId", "tenant_id"]),
  };
}
