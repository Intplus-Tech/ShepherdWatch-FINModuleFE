/**
 * The branch's list of services, for tagging a congregational collection.
 *
 * The API has no endpoint for this — the closest, `/templates`, is for email
 * templates — so the list is kept per branch in the browser until one exists.
 * It is a short, branch-managed config list, not financial data: nothing here
 * is posted to the ledger except the chosen service's name.
 */

export type ChurchService = {
  id: string
  name: string
  /** Unticked services stay on the list but drop out of the picker. */
  active: boolean
}

const key = (branchId: string) => `sw.services.${branchId || "default"}`

const DEFAULTS: ChurchService[] = [
  { id: "sunday-1", name: "Sunday 1st Service", active: true },
  { id: "sunday-2", name: "Sunday 2nd Service", active: true },
]

export function loadServices(branchId: string): ChurchService[] {
  try {
    const raw = localStorage.getItem(key(branchId))
    if (!raw) return [...DEFAULTS]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return [...DEFAULTS]
    return parsed
      .map((s) => {
        const rec = (s ?? {}) as Record<string, unknown>
        return { id: String(rec.id ?? ""), name: String(rec.name ?? ""), active: rec.active !== false }
      })
      .filter((s) => s.id && s.name)
  } catch {
    return [...DEFAULTS]
  }
}

export function saveServices(branchId: string, services: ChurchService[]): void {
  try {
    localStorage.setItem(key(branchId), JSON.stringify(services))
  } catch {
    // Storage unavailable: the list lasts for this page only.
  }
}

export function addService(branchId: string, name: string): ChurchService[] {
  const trimmed = name.trim()
  if (!trimmed) return loadServices(branchId)
  const current = loadServices(branchId)
  if (current.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return current
  const next = [...current, { id: `svc-${Date.now()}`, name: trimmed, active: true }]
  saveServices(branchId, next)
  return next
}

export function renameService(branchId: string, id: string, name: string): ChurchService[] {
  const trimmed = name.trim()
  const next = loadServices(branchId).map((s) => (s.id === id && trimmed ? { ...s, name: trimmed } : s))
  saveServices(branchId, next)
  return next
}

export function removeService(branchId: string, id: string): ChurchService[] {
  const next = loadServices(branchId).filter((s) => s.id !== id)
  saveServices(branchId, next)
  return next
}

export function toggleService(branchId: string, id: string): ChurchService[] {
  const next = loadServices(branchId).map((s) => (s.id === id ? { ...s, active: !s.active } : s))
  saveServices(branchId, next)
  return next
}
