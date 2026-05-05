import { fetchBackendMe } from "@/lib/backend-auth-me";
import { extractBranchIdFromJwt } from "@/lib/jwt-claims";

// Short in-memory cache to avoid repeated /me lookups for the same token within
// a single Next.js server runtime. Keyed by the trailing portion of the access
// token (full token kept off the key for log-safety).
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { value: string; expires: number }>();

function pickIdString(record: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!record) return "";
  for (const key of keys) {
    const v = record[key];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object") {
      const nested = v as Record<string, unknown>;
      const id = nested.id ?? nested._id;
      if (typeof id === "string" && id.trim()) return id.trim();
    }
  }
  return "";
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

/**
 * Resolves the active session's branchId by inspecting the JWT first and then
 * falling back to a backend `/auth/me` lookup. Returns "" if nothing is found.
 */
export async function resolveBranchIdFromSession(token: string): Promise<string> {
  const fromJwt = extractBranchIdFromJwt(token);
  if (fromJwt) return fromJwt;

  if (!token) return "";

  const cacheKey = token.slice(-32);
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.value;

  try {
    const res = await fetchBackendMe(token);
    if (!res || !res.ok) return "";

    const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!payload) return "";

    const data = asObject(payload.data) ?? payload;
    const user = asObject(data.user) ?? data;

    const branchId =
      pickIdString(user, ["branchId", "branch_id", "branch"]) ||
      pickIdString(user, ["tenantId", "tenant_id", "tenant"]) ||
      pickIdString(data, ["branchId", "branch_id", "branch"]) ||
      pickIdString(data, ["tenantId", "tenant_id", "tenant"]);

    if (branchId) {
      cache.set(cacheKey, { value: branchId, expires: Date.now() + CACHE_TTL_MS });
      return branchId;
    }
  } catch (err) {
    console.warn("[resolveBranchIdFromSession] /me lookup failed:", err);
  }

  return "";
}
