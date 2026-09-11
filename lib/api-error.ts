/**
 * Turn a backend error body into one message that includes the field-level
 * detail. The API answers "Validation failed." at the top and puts the reason
 * underneath in whichever of several shapes the handler used — an array of
 * strings, an array of { field, message }, a map of field → message, a zod
 * `issues` list — so screens that only read `message` show nothing useful.
 */
export function describeApiError(payload: unknown, fallback = "The request could not be completed."): string {
  if (!payload || typeof payload !== "object") return fallback
  const body = payload as Record<string, unknown>

  const headline = typeof body.message === "string" && body.message.trim() ? body.message.trim() : fallback

  const details = collect(body.errors)
    .concat(collect(body.details), collect(body.error), collect(body.issues), collect(body.validation))
    .concat(body.data && typeof body.data === "object" ? collect((body.data as Record<string, unknown>).errors) : [])
    .filter((line, index, all) => line && line !== headline && all.indexOf(line) === index)

  return details.length ? `${headline} ${details.join(" · ")}` : headline
}

function collect(value: unknown): string[] {
  if (value === null || value === undefined) return []
  if (typeof value === "string") return [value.trim()]
  if (Array.isArray(value)) return value.flatMap(collect)
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    // { field: "amount", message: "must be a number" } and zod's { path, message }
    const field = record.field ?? record.property ?? record.param ?? (Array.isArray(record.path) ? record.path.join(".") : record.path)
    const message = record.message ?? record.msg ?? record.error
    if (typeof message === "string") return [field ? `${field}: ${message}` : message]
    // class-validator's { property, constraints: { rule: "message" } }
    if (record.constraints && typeof record.constraints === "object") {
      return Object.values(record.constraints as Record<string, unknown>)
        .filter((m): m is string => typeof m === "string")
        .map((m) => (field ? `${field}: ${m}` : m))
    }
    // { amount: "must be a number", date: ["is required"] }
    return Object.entries(record).flatMap(([key, entry]) => collect(entry).map((line) => `${key}: ${line}`))
  }
  return []
}
