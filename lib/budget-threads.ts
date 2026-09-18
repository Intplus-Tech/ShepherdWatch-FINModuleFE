import { API_V1 } from "@/lib/api"

/**
 * Budget line-item threads, shared by the accountant's budget page and the
 * pastor's review.
 *
 * A thread is the comments on a budget whose `lineItemRef` is one chart-of-
 * account head. The backend keeps no read state, so "new message" is judged
 * here: the thread's latest comment is by someone else and is not the one
 * this user last opened (remembered per browser).
 */

export type ThreadComment = {
  id: string
  budgetId: string
  lineItemRef: string
  lineName: string
  userId: string
  userName: string
  message: string
  createdAt: string
}

export type ThreadSummary = {
  count: number
  latestId: string
  latestAt: string
  latestUserId: string
  /** Every comment in the thread, oldest first, for counting what's unread. */
  entries: { id: string; userId: string }[]
}

const readList = (payload: unknown): Record<string, unknown>[] => {
  const body = payload as Record<string, unknown> | null
  const data = body?.data
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).content)) {
    return (data as Record<string, unknown>).content as Record<string, unknown>[]
  }
  return []
}

const idOf = (v: unknown): string => {
  if (v && typeof v === "object") {
    const rec = v as { _id?: unknown; id?: unknown }
    return String(rec._id ?? rec.id ?? "")
  }
  return typeof v === "string" ? v : ""
}

const nameOf = (v: unknown): string => {
  if (!v || typeof v !== "object") return ""
  const p = v as { firstName?: string; lastName?: string; email?: string; name?: string }
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.name || p.email || ""
}

export function mapComment(raw: Record<string, unknown>, budgetId: string): ThreadComment {
  const ref = raw.lineItemRef as Record<string, unknown> | string | undefined
  return {
    id: idOf(raw) || `comment-${String(raw.createdAt ?? "")}`,
    budgetId: idOf(raw.budgetId) || budgetId,
    lineItemRef: idOf(ref),
    lineName: ref && typeof ref === "object" ? String(ref.name ?? "") : "",
    userId: idOf(raw.userId),
    userName: nameOf(raw.userId) || String(raw.userName ?? raw.authorName ?? "Budget Team"),
    message: String(raw.message ?? ""),
    createdAt: String(raw.createdAt ?? ""),
  }
}

/** Every comment on a budget, oldest first. */
export async function fetchBudgetComments(budgetId: string): Promise<ThreadComment[]> {
  const res = await fetch(`${API_V1}/financial/budgets/${encodeURIComponent(budgetId)}/comments?page=1&limit=100`, {
    credentials: "include",
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error((json as { message?: string } | null)?.message ?? "Unable to load messages.")
  return readList(json)
    .map((c) => mapComment(c, budgetId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export const threadKey = (budgetId: string, lineItemRef: string) => `${budgetId}|${lineItemRef}`

/** One summary per (budget, line) across the given budgets; failures are skipped. */
export async function loadThreadSummaries(budgetIds: string[]): Promise<Record<string, ThreadSummary>> {
  const lists = await Promise.all(budgetIds.map((id) => fetchBudgetComments(id).catch(() => [] as ThreadComment[])))
  const out: Record<string, ThreadSummary> = {}
  for (const c of lists.flat()) {
    const key = threadKey(c.budgetId, c.lineItemRef)
    const cur = out[key]
    if (!cur) {
      out[key] = { count: 1, latestId: c.id, latestAt: c.createdAt, latestUserId: c.userId, entries: [{ id: c.id, userId: c.userId }] }
    } else {
      cur.count += 1
      cur.entries.push({ id: c.id, userId: c.userId })
      if (new Date(c.createdAt).getTime() >= new Date(cur.latestAt).getTime()) {
        cur.latestId = c.id
        cur.latestAt = c.createdAt
        cur.latestUserId = c.userId
      }
    }
  }
  return out
}

const seenStorageKey = (userId: string) => `sw.budget-threads.seen.${userId || "anon"}`

function readSeen(userId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(seenStorageKey(userId))
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

/** Remember that this user has opened the thread up to its latest comment. */
export function markThreadSeen(userId: string, budgetId: string, lineItemRef: string, latestId: string) {
  try {
    const seen = readSeen(userId)
    seen[threadKey(budgetId, lineItemRef)] = latestId
    localStorage.setItem(seenStorageKey(userId), JSON.stringify(seen))
  } catch {
    // Storage unavailable: the indicator simply stays on.
  }
}

/** Unread: someone else wrote last, and this user hasn't opened the thread since. */
export function isThreadUnread(summary: ThreadSummary | undefined, userId: string, budgetId: string, lineItemRef: string): boolean {
  if (!summary || summary.count === 0) return false
  if (summary.latestUserId && summary.latestUserId === userId) return false
  return readSeen(userId)[threadKey(budgetId, lineItemRef)] !== summary.latestId
}

/** How many messages from other people this user hasn't opened the thread for. */
export function unreadCount(summary: ThreadSummary | undefined, userId: string, budgetId: string, lineItemRef: string): number {
  if (!summary || summary.count === 0) return 0
  const seenId = readSeen(userId)[threadKey(budgetId, lineItemRef)]
  const seenIndex = seenId ? summary.entries.findIndex((e) => e.id === seenId) : -1
  return summary.entries.slice(seenIndex + 1).filter((e) => e.userId && e.userId !== userId).length
}

/**
 * Names for the chart-of-account heads a branch's budget lines point at. The
 * allocation API returns only the head's id and drops the notes we send, so
 * the head is the one place a line's name survives.
 */
export async function loadAccountHeadNames(branchId: string): Promise<Record<string, { name: string; code: string }>> {
  const out: Record<string, { name: string; code: string }> = {}
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `${API_V1}/financial/coa?page=${page}&limit=100&accountType=expense&branchId=${encodeURIComponent(branchId)}`,
      { credentials: "include" }
    )
    const json = await res.json().catch(() => null)
    if (!res.ok) break
    const items = readList(json)
    for (const h of items) {
      const id = idOf(h)
      if (id) out[id] = { name: String(h.name ?? ""), code: String(h.code ?? "") }
    }
    if (items.length < 100) break
  }
  return out
}

// ---------------------------------------------------------------------------
// Budget lines as things to post an expense against.
// ---------------------------------------------------------------------------

/** The table group each API budget category is shown under. */
export const BUDGET_GROUP_LABELS: Record<string, string> = {
  operational: "Operational Expenses",
  programs: "Program Budgets",
  project: "Program Budgets",
  capital: "Capital Projects",
}

export type BudgetLineOption = {
  /** The allocation's id. */
  id: string
  budgetId: string
  chartOfAccountId: string
  name: string
  code: string
  group: string
  period: string
  /** "Name (Group)", with the period added when more than one is listed. */
  label: string
}

/**
 * Every line of the branch's budgets, newest budget per period and category,
 * labelled with the group it sits under — so an expense is posted against the
 * line the accountant budgeted, not just an account head.
 */
export async function loadBudgetLineOptions(branchId: string): Promise<BudgetLineOption[]> {
  const res = await fetch(`${API_V1}/budgets?branchId=${encodeURIComponent(branchId)}&limit=100`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error((json as { message?: string } | null)?.message ?? "Unable to load budgets.")

  // One budget per (period, category): the first the API lists is its newest.
  const budgets: { id: string; period: string; group: string }[] = []
  for (const b of readList(json)) {
    const id = idOf(b)
    const name = String(b.name ?? b.title ?? "")
    const period = name.split(" · ")[0]
    const category = String(b.category ?? "operational")
    const group = BUDGET_GROUP_LABELS[category] ?? category
    if (!id || budgets.some((x) => x.period === period && x.group === group)) continue
    budgets.push({ id, period, group })
  }
  if (budgets.length === 0) return []

  type Row = { a: Record<string, unknown>; b: (typeof budgets)[number] }
  const [heads, lists] = await Promise.all([
    loadAccountHeadNames(branchId).catch(() => ({}) as Record<string, { name: string; code: string }>),
    Promise.all(
      budgets.map((b) =>
        fetch(`${API_V1}/financial/budget-allocations?budgetId=${encodeURIComponent(b.id)}&limit=100`, { credentials: "include" })
          .then((r) => r.json().catch(() => null))
          .then((j) => readList(j).map((a): Row => ({ a, b })))
          .catch(() => [] as Row[])
      )
    ),
  ])
  const periods = new Set(budgets.map((b) => b.period))
  return lists.flat().flatMap(({ a, b }): BudgetLineOption[] => {
    const coa = a.chartOfAccountId
    const coaId = idOf(coa)
    const populated = coa && typeof coa === "object" ? (coa as Record<string, unknown>) : null
    const head = heads[coaId]
    const id = idOf(a)
    if (!id || !coaId) return []
    const name = String(populated?.name ?? head?.name ?? a.notes ?? "Line item")
    const code = String(populated?.code ?? head?.code ?? "")
    return [
      {
        id,
        budgetId: b.id,
        chartOfAccountId: coaId,
        name,
        code,
        group: b.group,
        period: b.period,
        label: periods.size > 1 ? `${name} (${b.group} · ${b.period})` : `${name} (${b.group})`,
      },
    ]
  })
}
