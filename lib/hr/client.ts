import { API_V1 } from "@/lib/api"
import type { ApiEnvelope, Paginated, Pagination } from "@/lib/hr/types"

/**
 * Thin transport for the HR API.
 *
 * Everything under `/api/v1/hr/*` is forwarded by `app/api/v1/hr/[...slug]`,
 * which attaches the bearer token and refreshes it on 401. CSRF headers are
 * added globally by `installCsrfInterceptors`, so mutations here don't set them.
 *
 * The backend wraps every response in `{ success, message, data, timestamp }`
 * and puts pagination *beside* `data` (never nested inside it) — see
 * `ApiResponse.paginated`. `getList` relies on that shape rather than probing a
 * chain of possible locations.
 */

export class HrApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "HrApiError"
    this.status = status
  }
}

const DEFAULT_PAGINATION: Pagination = { total: 0, page: 1, limit: 0, pages: 0 }

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>

export function buildQuery(params: QueryParams = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

async function parseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) return res.json().catch(() => null)
  const text = await res.text().catch(() => "")
  return text ? { message: text } : null
}

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>
    if (typeof record.message === "string" && record.message.trim()) return record.message
    const errors = record.errors
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0]
      if (first && typeof first === "object") {
        const message = (first as Record<string, unknown>).message
        if (typeof message === "string" && message.trim()) return message
      }
    }
  }
  return fallback
}

async function request<T>(
  path: string,
  init: RequestInit & { fallbackError?: string } = {},
): Promise<{ body: ApiEnvelope<T>; raw: Record<string, unknown> }> {
  const { fallbackError, ...options } = init
  const res = await fetch(`${API_V1}/hr${path}`, {
    credentials: "include",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  })

  const body = await parseBody(res)

  if (!res.ok) {
    throw new HrApiError(errorMessage(body, fallbackError ?? "HR request failed"), res.status)
  }

  const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>
  return { body: raw as unknown as ApiEnvelope<T>, raw }
}

/** GET an endpoint whose `data` is a single object. */
export async function hrGet<T>(path: string, params?: QueryParams): Promise<T> {
  const { body } = await request<T>(`${path}${buildQuery(params)}`, { method: "GET" })
  return body.data
}

/** GET a paginated endpoint: `data` is the array, `pagination` sits beside it. */
export async function hrGetList<T>(path: string, params?: QueryParams): Promise<Paginated<T>> {
  const { body, raw } = await request<T[]>(`${path}${buildQuery(params)}`, { method: "GET" })
  const items = Array.isArray(body.data) ? body.data : []
  const pagination = (raw.pagination as Pagination | undefined) ?? {
    ...DEFAULT_PAGINATION,
    total: items.length,
    limit: items.length,
    pages: items.length > 0 ? 1 : 0,
  }
  return { items, pagination }
}

export async function hrPost<T>(path: string, payload?: unknown): Promise<T> {
  const { body } = await request<T>(path, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  })
  return body.data
}

export async function hrPut<T>(path: string, payload?: unknown): Promise<T> {
  const { body } = await request<T>(path, {
    method: "PUT",
    body: JSON.stringify(payload ?? {}),
  })
  return body.data
}

export async function hrPatch<T>(path: string, payload?: unknown): Promise<T> {
  const { body } = await request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(payload ?? {}),
  })
  return body.data
}

export async function hrDelete<T>(path: string): Promise<T> {
  const { body } = await request<T>(path, { method: "DELETE" })
  return body.data
}

/**
 * Read an optional field off an unconstrained mutation variable.
 *
 * The mutation helpers infer their input type from the caller, so `onSuccess`
 * sees an opaque `TInput`; this is how they recover the id needed to invalidate
 * a specific detail query without constraining every input shape.
 */
export function fieldOf(input: unknown, key: string): string | undefined {
  if (!input || typeof input !== "object") return undefined
  const value = (input as Record<string, unknown>)[key]
  return typeof value === "string" && value ? value : undefined
}
