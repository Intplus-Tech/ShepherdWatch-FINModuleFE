import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { describeApiError } from "@/lib/api-error"

/**
 * The accountant's General Ledger, over the transactions API.
 *
 * An entry the accountant keys in (income counted, an expense paid) is a
 * transaction in `pending` status: it is on the ledger but the bank has not
 * confirmed it. Recording the bank teller for an income entry, or matching an
 * expense to its statement line, verifies it — one entry, one bank movement,
 * no double posting. Statement lines uploaded from the bank arrive as
 * `import` transactions, unclassified until allocated to an account head.
 *
 * The cash safe, counting batches and journal vouchers have no API yet; the
 * screens show sample data for those parts (see `MOCK_SAFE`) until they do.
 */

export type LedgerEntry = {
  id: string
  reference: string
  type: "income" | "expense"
  amount: number
  currency: string
  description: string
  status: string
  date: string
  createdAt: string
  source: string
  coaId: string
  coaName: string
  coaCode: string
  bankAccountId: string
  bankAccountName: string
  attachments: string[]
  meta: Record<string, unknown>
}

export type BankAccountRow = {
  id: string
  accountName: string
  accountNumber: string
  bankName: string
  currency: string
  balance: number
  isActive: boolean
}

export type AccountHead = { id: string; name: string; code: string; type: string }

const readList = (payload: unknown): Record<string, unknown>[] => {
  const body = payload as Record<string, unknown> | null
  const data = body?.data
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>
    for (const key of ["content", "items", "transactions", "accounts", "data"]) {
      if (Array.isArray(rec[key])) return rec[key] as Record<string, unknown>[]
    }
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

const populated = (v: unknown): Record<string, unknown> | null => (v && typeof v === "object" ? (v as Record<string, unknown>) : null)

export function mapLedgerEntry(raw: Record<string, unknown>): LedgerEntry {
  const typeRaw = String(raw.type ?? raw.transactionType ?? raw.flowType ?? "").toLowerCase()
  const type: LedgerEntry["type"] = ["credit", "income", "inflow"].includes(typeRaw) ? "income" : "expense"
  const coa = populated(raw.chartOfAccountId) ?? populated(raw.chartOfAccount)
  const bank = populated(raw.bankAccountId) ?? populated(raw.bankAccount)
  const meta = populated(raw.meta) ?? {}
  const attachments = Array.isArray(raw.attachments)
    ? (raw.attachments as unknown[]).map((a) => (typeof a === "string" ? a : String((a as { url?: string })?.url ?? ""))).filter(Boolean)
    : []
  return {
    id: idOf(raw),
    reference: String(raw.reference ?? raw.referenceNumber ?? ""),
    type,
    amount: Number(raw.amount ?? 0),
    currency: String(raw.currency ?? "NGN"),
    description: String(raw.description ?? raw.narration ?? ""),
    status: String(raw.status ?? "pending").toLowerCase(),
    date: String(raw.transactionDate ?? raw.date ?? raw.createdAt ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    source: String(raw.source ?? "manual").toLowerCase(),
    coaId: idOf(raw.chartOfAccountId ?? raw.chartOfAccount),
    coaName: String(coa?.name ?? raw.coaName ?? raw.categoryName ?? ""),
    coaCode: String(coa?.code ?? raw.coaCode ?? ""),
    bankAccountId: idOf(raw.bankAccountId ?? raw.bankAccount),
    bankAccountName: String(bank?.accountName ?? bank?.bankName ?? ""),
    attachments,
    meta,
  }
}

export async function loadLedgerEntries(params: {
  branchId: string
  type?: "income" | "expense"
  status?: "pending" | "verified" | "flagged" | "cancelled"
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
}): Promise<LedgerEntry[]> {
  const q = new URLSearchParams({ page: "1", limit: String(Math.min(params.limit ?? 100, 100)) })
  if (params.branchId) q.set("branchId", params.branchId)
  if (params.type) q.set("type", params.type)
  if (params.status) q.set("status", params.status)
  if (params.startDate) q.set("startDate", params.startDate)
  if (params.endDate) q.set("endDate", params.endDate)
  if (params.search) q.set("search", params.search)
  const res = await fetch(`${API_V1}/financial/transactions?${q.toString()}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load ledger entries."))
  return readList(json)
    .map(mapLedgerEntry)
    .filter((e) => e.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function loadBankAccounts(branchId: string): Promise<BankAccountRow[]> {
  const q = new URLSearchParams({ page: "1", limit: "100" })
  if (branchId) q.set("branchId", branchId)
  const res = await fetch(`${API_V1}/financial/bank-accounts?${q.toString()}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load bank accounts."))
  return readList(json)
    .map((a) => ({
      id: idOf(a),
      accountName: String(a.accountName ?? a.name ?? ""),
      accountNumber: String(a.accountNumber ?? ""),
      bankName: String(a.bankName ?? ""),
      currency: String(a.currency ?? "NGN"),
      balance: Number(a.lastClosingBalance ?? a.balance ?? a.currentBalance ?? 0),
      isActive: a.isActive !== false,
    }))
    .filter((a) => a.id)
}

/** Account heads of one type for the branch, for categorising entries. */
export async function loadAccountHeads(branchId: string, type: "expense" | "revenue"): Promise<AccountHead[]> {
  const out: AccountHead[] = []
  for (let page = 1; page <= 5; page++) {
    const q = new URLSearchParams({ page: String(page), limit: "100", accountType: type })
    if (branchId) q.set("branchId", branchId)
    const res = await fetch(`${API_V1}/financial/coa?${q.toString()}`, { credentials: "include" })
    const json = await res.json().catch(() => null)
    if (!res.ok) break
    const items = readList(json)
    for (const h of items) {
      const id = idOf(h)
      if (id) out.push({ id, name: String(h.name ?? ""), code: String(h.code ?? ""), type: String(h.accountType ?? type) })
    }
    if (items.length < 100) break
  }
  return out
}

const jsonHeaders = () => ({ "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() })

/** Categorise a statement line (or any entry) under an account head. */
export async function allocateEntry(id: string, chartOfAccountId: string, submitForReview = true): Promise<void> {
  const res = await fetch(`${API_V1}/financial/transactions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify({ chartOfAccountId, submitForReview }),
  })
  if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "Unable to allocate the entry."))
}

/** Merge free-form details (teller slip, requisition link…) onto an entry. */
export async function updateEntry(id: string, patch: { meta?: Record<string, unknown>; reference?: string; description?: string }): Promise<void> {
  const res = await fetch(`${API_V1}/financial/transactions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "Unable to update the entry."))
}

/** The bank has confirmed this entry: verified, optionally against a budget line. */
export async function verifyEntry(id: string, body: { notes?: string; chartOfAccountId?: string; budgetAllocationId?: string } = {}): Promise<void> {
  const res = await fetch(`${API_V1}/financial/transactions/${encodeURIComponent(id)}/verify`, {
    method: "PATCH",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify({ status: "verified", ...body }),
  })
  if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "Unable to verify the entry."))
}

export type NewEntryInput = {
  type: "income" | "expense"
  amount: number
  description: string
  branchId: string
  chartOfAccountId: string
  transactionDate: string
  bankAccountId?: string
  reference?: string
  attachments?: string[]
}

export async function createEntry(input: NewEntryInput): Promise<LedgerEntry> {
  const res = await fetch(`${API_V1}/financial/transactions`, {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify({ source: "manual", currency: "NGN", ...input }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to post the entry."))
  const data = (json as { data?: Record<string, unknown> } | null)?.data
  return data ? mapLedgerEntry(data) : { ...mapLedgerEntry({}), ...input, id: "", currency: "NGN", status: "pending" } as LedgerEntry
}

/** A receipt or teller slip, stored and returned as a URL to attach. */
export async function uploadDocument(file: File, folder: string, branchId: string): Promise<{ url: string; fileName: string }> {
  const form = new FormData()
  form.append("file", file)
  form.append("folder", folder)
  if (branchId) form.append("branchId", branchId)
  const res = await fetch(`${API_V1}/file-uploads`, {
    method: "POST",
    headers: { "x-csrf-token": getCsrfTokenFromCookie() },
    credentials: "include",
    body: form,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to upload the file."))
  const data = ((json as { data?: Record<string, unknown> } | null)?.data ?? json ?? {}) as Record<string, unknown>
  const url = String(data.url ?? data.secureUrl ?? data.secure_url ?? "")
  if (!url) throw new Error("The file was uploaded but no link came back.")
  return { url, fileName: String(data.fileName ?? data.originalName ?? file.name) }
}

// ---------------------------------------------------------------------------
// Formatting shared by the ledger screens.
// ---------------------------------------------------------------------------

export const ngn = (value: number, opts: { decimals?: boolean } = {}) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: opts.decimals ? 2 : 0, maximumFractionDigits: opts.decimals ? 2 : 0 }).format(value)

export const shortDate = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
}

export const longDate = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export const timeOf = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** A short ledger reference for an entry that has none: #SVC- for income, #TXN- for expense. */
export const entryRef = (e: LedgerEntry) => e.reference || `#${e.type === "income" ? "SVC" : "TXN"}-${e.id.slice(-6).toUpperCase()}`

/** How the stream labels an entry's state. */
export function entryState(e: LedgerEntry): { label: string; tone: "green" | "amber" | "rose" | "blue" | "gray" } {
  if (e.status === "verified") return { label: "Reconciled", tone: "green" }
  if (e.status === "flagged") return { label: "Flagged", tone: "rose" }
  if (e.status === "cancelled") return { label: "Cancelled", tone: "gray" }
  if (e.source === "import") return e.coaId ? { label: "Matched", tone: "blue" } : { label: "Uncategorized", tone: "rose" }
  return e.type === "income" ? { label: "In safe · awaiting bank", tone: "amber" } : { label: "Awaiting bank debit", tone: "amber" }
}

// ---------------------------------------------------------------------------
// Sample data for the parts with no API yet: the counting-room safe, its
// locked batches and the journal voucher that closes one. Replace when the
// safe endpoints land.
// ---------------------------------------------------------------------------

export type SafeFund = {
  name: string
  gl: string
  /** Notes and coins counted for this fund. */
  cash: number
  /** Cheques received for it, and where the scans are. */
  cheque: number
  chequeDocs: { ref: string; amount: number; url: string }[]
  remaining: number
}
export type SafeBatch = { ref: string; serviceDate: string; serviceType: string; total: number; status: string }

export const MOCK_SAFE = {
  total: 1_100_000,
  physicalCash: 1_050_000,
  cheques: 50_000,
  batch: { ref: "SVC-202609-13-01", serviceDate: "2026-09-13", serviceType: "Sunday 1st Service", total: 1_100_000, status: "IN_SAFE (PENDING BANK RUN)" } as SafeBatch,
  funds: [
    { name: "Tithes (General)", gl: "4010-01", cash: 420_000, cheque: 30_000, chequeDocs: [{ ref: "CHQ-100482", amount: 30_000, url: "" }], remaining: 450_000 },
    { name: "General Offering", gl: "4020-01", cash: 250_000, cheque: 0, chequeDocs: [], remaining: 250_000 },
    { name: "Building Project Fund", gl: "4050-02", cash: 280_000, cheque: 20_000, chequeDocs: [{ ref: "CHQ-100483", amount: 20_000, url: "" }], remaining: 300_000 },
    { name: "Thanksgiving & Vows", gl: "4030-01", cash: 100_000, cheque: 0, chequeDocs: [], remaining: 100_000 },
  ] as SafeFund[],
  signatories: [
    { name: "Grace Okonkwo", role: "Counting Committee Officer" },
    { name: "Tunde Bakare", role: "Accountant" },
  ],
  lockDocument: "Image_898e89.jpg",
  journal: { ref: "#JIV-202609-074", teller: "Receipt_GraceBuilding_INV-9921.Pdf" },
}
