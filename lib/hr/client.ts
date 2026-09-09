import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"

/**
 * Shared fetch layer for the HR module. Every HR hook goes through here so the
 * CSRF header, credential mode and error unwrapping stay in one place.
 *
 * The backend wraps every payload as { success, message, data, timestamp } and
 * paginates under either `pagination` (employees, attendance, leaves) or `meta`
 * (loans, trainings, requisitions, exit clearances) — both are normalized below.
 */

export const HR_BASE = `${API_V1}/hr`

export type QueryValue = string | number | boolean | null | undefined

export type HrPagination = {
  total: number
  page: number
  limit: number
  pages: number
}

export type HrListResult<T> = {
  items: T[]
  pagination: HrPagination
}

function csrfHeaders(): Record<string, string> {
  const token = getCsrfTokenFromCookie()
  return token ? { "x-csrf-token": token } : {}
}

export function buildQuery(params: Record<string, QueryValue> = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (!text || text === "all") continue
    search.set(key, text)
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

async function unwrap(response: Response, fallbackMessage: string): Promise<unknown> {
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message ?? "")
        : "") || fallbackMessage
    throw new Error(message)
  }
  return payload
}

export async function hrGet(path: string, params?: Record<string, QueryValue>): Promise<unknown> {
  const query = buildQuery(params)
  const response = await fetch(`${HR_BASE}${path}${query}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })

  // Some HR list endpoints reject filter values the docs say they accept and
  // answer 400 "Validation failed" for the whole request. Rather than showing
  // an empty screen, retry unfiltered and narrow client-side; the warning names
  // the query that was refused so it can be reported to the backend.
  if (response.status === 400 && query) {
    console.warn(`HR ${path} rejected its query (${query}); retrying without filters.`)
    const retry = await fetch(`${HR_BASE}${path}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
    if (retry.ok) return retry.json().catch(() => null)
  }

  return unwrap(response, "Unable to load HR data.")
}

async function hrMutate(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<unknown> {
  const response = await fetch(`${HR_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(),
    },
    body: method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
  })
  return unwrap(response, "The request could not be completed.")
}

export const hrPost = (path: string, body?: unknown) => hrMutate("POST", path, body)
export const hrPut = (path: string, body?: unknown) => hrMutate("PUT", path, body)
export const hrPatch = (path: string, body?: unknown) => hrMutate("PATCH", path, body)
export const hrDelete = (path: string) => hrMutate("DELETE", path)

/* ---------------------------------------------------------------- readers */

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
  }
  return ""
}

export function readNumber(...values: unknown[]): number {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

export function readBoolean(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === "boolean") return value
    if (value === "true") return true
    if (value === "false") return false
  }
  return false
}

/** `data` on the envelope, as an object. */
export function payloadData(payload: unknown): Record<string, unknown> {
  return asRecord(asRecord(payload).data)
}

/** `data` on the envelope, as an array. */
export function payloadList(payload: unknown): unknown[] {
  return asArray(asRecord(payload).data)
}

/** Reads either the `pagination` or the `meta` pagination shape. */
export function payloadPagination(payload: unknown, fallbackLimit = 20): HrPagination {
  const root = asRecord(payload)
  const source = asRecord(root.pagination ?? root.meta)
  const limit = readNumber(source.limit) || fallbackLimit
  const total = readNumber(source.total)
  return {
    total,
    page: readNumber(source.page) || 1,
    limit,
    pages: readNumber(source.pages, source.totalPages) || (limit > 0 ? Math.ceil(total / limit) : 0),
  }
}

/**
 * Populated refs come back either as an id string or as an expanded object.
 * Returns the id in both cases.
 */
export function readRefId(value: unknown): string {
  if (typeof value === "string") return value
  const record = asRecord(value)
  return readString(record._id, record.id)
}

/** Full name from a populated `userId`, an employee record, or first/last fields. */
export function readPersonName(...sources: unknown[]): string {
  for (const source of sources) {
    const record = asRecord(source)
    const direct = readString(record.fullName, record.name, record.employeeName)
    if (direct) return direct
    const composed = `${readString(record.firstName)} ${readString(record.lastName)}`.trim()
    if (composed) return composed
    const nested = asRecord(record.userId)
    const nestedName = readString(nested.fullName, nested.name)
    if (nestedName) return nestedName
    const nestedComposed = `${readString(nested.firstName)} ${readString(nested.lastName)}`.trim()
    if (nestedComposed) return nestedComposed
  }
  return ""
}

/**
 * Belt-and-braces filter for list results. `hrGet` may have retried a rejected
 * query without its filters, so anything the caller asked to filter on is
 * re-applied here; when the server honoured the filter this is a no-op.
 */
export function keepMatching<T>(items: T[], field: keyof T, value?: string): T[] {
  if (!value) return items
  return items.filter((item) => String(item[field] ?? "") === value)
}
