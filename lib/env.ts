import { API_V1 } from "@/lib/api";
export function getRequiredEnv(name: "BACKEND_API_URL" | "GATEWAY_BASE_URL"): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Backend API base URL (origin + versioned prefix), e.g. `https://host${API_V1}`.
 *
 * This is the SINGLE place that knows about the `${API_V1}` segment. Route handlers
 * should call this instead of hard-coding `${baseUrl}${API_V1}/...` so that future
 * version bumps (e.g. `/api/v2`) require editing only this function.
 *
 * Behaviour:
 *  - Reads `BACKEND_API_URL` (must be set, env-var stays as the bare origin).
 *  - Strips trailing slashes and any accidental trailing `${API_V1}` from the env value.
 *  - In production, refuses `http://` to prevent accidental insecure traffic.
 *  - When `path` is provided, returns `<origin>${API_V1}/<path>` (leading slashes on
 *    `path` are tolerated). When omitted, returns `<origin>${API_V1}` (no trailing slash).
 */
export function getBackendApiUrl(path: string = ""): string {
  const raw = getRequiredEnv("BACKEND_API_URL")
  if (process.env.NODE_ENV === "production" && raw.startsWith("http://")) {
    throw new Error("BACKEND_API_URL must use https in production")
  }
  // Same clean-up as `getBackendBaseUrl` in backend-auth-url.ts: the env value
  // is sometimes the swagger URL (…/api-docs) or already versioned (…/api/v1).
  // Routes built here and routes built there must land on the same origin, or
  // half the API answers the backend's "resource was not found".
  const origin = raw
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api-docs(?:\/.*)?$/i, "")
    .replace(/\/api(?:\/v1)?$/i, "")
  const base = `${origin}${API_V1}`
  const clean = String(path).replace(/^\/+/, "")
  return clean ? `${base}/${clean}` : base
}
