import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { describeApiError } from "@/lib/api-error"
import { payeeSummary, readRequisitionDetails } from "@/lib/requisition-details"

/**
 * The accountant's General Ledger and bank reconciliation.
 *
 * Every amount is recorded once. The accountant posts a ledger entry with its
 * receipt (`/general-ledger`); the bank statement is imported separately
 * (`/reconciliation`). The two meet at reconciliation: a statement line is
 * either matched to the entries that explain it, or — for an inflow with no
 * entry behind it — allocated straight to an income category.
 */

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export type LedgerEntry = {
  id: string
  reference: string
  requisitionNumber: string
  requisitionId: string
  entryType: "income" | "expense"
  amount: number
  currency: string
  description: string
  payee: string
  notes: string
  /** pending | verified | unverified | flagged | split | matched */
  status: string
  /** unreconciled | reconciled */
  reconciliationStatus: string
  /** matched | allocated, once reconciled. */
  reconciliationMethod: string
  date: string
  createdAt: string
  paymentMethod: string
  coaId: string
  coaName: string
  coaCode: string
  bankAccountId: string
  bankAccountName: string
  hasReceipt: boolean
  receiptUrl: string
  meta: Record<string, unknown>
}

export type StatementLine = {
  id: string
  /** credit = money in. */
  transactionType: "credit" | "debit"
  amount: number
  currency: string
  description: string
  reference: string
  date: string
  /** unclassified | unreconciled | reconciled */
  displayStatus: string
  requiresAllocation: boolean
  reconciliationMethod: string
  matchedEntryIds: string[]
  bankAccountId: string
  bankName: string
  accountNumber: string
  coaId: string
  coaName: string
}

export type StatementAccount = {
  bankAccountId: string
  bankName: string
  accountName: string
  accountNumber: string
  currency: string
  inflow: number
  outflow: number
  net: number
  unreconciledCount: number
  unclassifiedCount: number
}

export type StatementSummary = {
  currency: string
  inflow: number
  outflow: number
  net: number
  unclassifiedAmount: number
  counts: { total: number; credits: number; debits: number; reconciled: number; unreconciled: number; unclassified: number }
  accounts: StatementAccount[]
}

export type LedgerStream = {
  id: string
  name: string
  code: string
  total: number
  verifiedTotal: number
  pendingTotal: number
  count: number
  unreconciledCount: number
}

export type StreamTotals = { income: LedgerStream[]; expense: LedgerStream[]; totals: { income: number; expense: number; net: number } }

export type RequisitionOption = {
  id: string
  requisitionNumber: string
  amount: number
  /** The expense title the requester gave, when there is one. */
  title: string
  justification: string
  requestedBy: string
  /** The budget head it was raised against. */
  coaId: string
  coaName: string
  /** Where the requester asked to be paid. */
  accountName: string
  bankName: string
  accountNumber: string
  payee: string
  attachmentUrl: string
  /** approved entries can be posted; anything else is still in the chain. */
  status: string
  /** Empty when it can be posted, otherwise why it cannot be. */
  blockedReason: string
}

export type AccountHead = { id: string; name: string; code: string; type: string }

export type MatchCandidate = {
  entry: LedgerEntry
  amountDifference: number
  daysApart: number
  exactAmount: boolean
}

// ---------------------------------------------------------------------------
// Readers
// ---------------------------------------------------------------------------

const readList = (payload: unknown): Record<string, unknown>[] => {
  const body = payload as Record<string, unknown> | null
  const data = body?.data
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>
    for (const key of ["content", "items", "entries", "lines", "candidates", "data"]) {
      if (Array.isArray(rec[key])) return rec[key] as Record<string, unknown>[]
    }
  }
  return []
}

const readData = (payload: unknown): Record<string, unknown> => {
  const body = payload as Record<string, unknown> | null
  const data = body?.data
  return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : {}
}

const idOf = (v: unknown): string => {
  if (v && typeof v === "object") {
    const rec = v as { _id?: unknown; id?: unknown }
    return String(rec._id ?? rec.id ?? "")
  }
  return typeof v === "string" ? v : ""
}

const obj = (v: unknown): Record<string, unknown> | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null)

const personOf = (v: unknown): string => {
  const p = obj(v)
  if (!p) return typeof v === "string" ? v : ""
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || String(p.name ?? p.email ?? "")
}

export function mapLedgerEntry(raw: Record<string, unknown>): LedgerEntry {
  const coa = obj(raw.chartOfAccountId) ?? obj(raw.chartOfAccount) ?? obj(raw.accountId)
  const bank = obj(raw.bankAccountId) ?? obj(raw.bankAccount)
  const req = obj(raw.requisitionId)
  const typeRaw = String(raw.entryType ?? raw.type ?? raw.transactionType ?? raw.flowType ?? "").toLowerCase()
  return {
    id: idOf(raw),
    reference: String(raw.reference ?? raw.referenceNumber ?? ""),
    requisitionNumber: String(req?.requisitionNumber ?? raw.requisitionNumber ?? ""),
    requisitionId: idOf(raw.requisitionId),
    entryType: ["credit", "income", "inflow"].includes(typeRaw) ? "income" : "expense",
    amount: Number(raw.amount ?? raw.grossAmount ?? 0),
    currency: String(raw.currency ?? "NGN"),
    description: String(raw.description ?? raw.narration ?? ""),
    payee: String(raw.payee ?? raw.vendor ?? ""),
    notes: String(raw.notes ?? ""),
    status: String(raw.status ?? "pending").toLowerCase(),
    reconciliationStatus: String(raw.reconciliationStatus ?? "unreconciled").toLowerCase(),
    reconciliationMethod: String(raw.reconciliationMethod ?? ""),
    date: String(raw.transactionDate ?? raw.date ?? raw.createdAt ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    paymentMethod: String(raw.paymentMethod ?? ""),
    coaId: idOf(raw.chartOfAccountId ?? raw.chartOfAccount ?? raw.accountId),
    coaName: String(coa?.name ?? raw.coaName ?? ""),
    coaCode: String(coa?.code ?? raw.coaCode ?? ""),
    bankAccountId: idOf(raw.bankAccountId ?? raw.bankAccount),
    bankAccountName: String(bank?.accountName ?? bank?.bankName ?? ""),
    hasReceipt: Boolean(raw.hasReceipt ?? raw.receiptUrl),
    receiptUrl: String(raw.receiptUrl ?? ""),
    meta: obj(raw.meta) ?? {},
  }
}

export function mapStatementLine(raw: Record<string, unknown>): StatementLine {
  const bank = obj(raw.bankAccountId) ?? obj(raw.bankAccount)
  const coa = obj(raw.chartOfAccountId)
  const matched = raw.matchedEntryIds ?? raw.matchedEntries
  return {
    id: idOf(raw),
    transactionType: String(raw.transactionType ?? "").toLowerCase() === "credit" ? "credit" : "debit",
    amount: Number(raw.amount ?? 0),
    currency: String(raw.currency ?? "NGN"),
    description: String(raw.description ?? raw.narration ?? ""),
    reference: String(raw.reference ?? ""),
    date: String(raw.transactionDate ?? raw.valueDate ?? raw.date ?? raw.createdAt ?? ""),
    displayStatus: String(raw.displayStatus ?? raw.status ?? "unreconciled").toLowerCase(),
    requiresAllocation: Boolean(raw.requiresAllocation),
    reconciliationMethod: String(raw.reconciliationMethod ?? ""),
    matchedEntryIds: Array.isArray(matched) ? (matched as unknown[]).map(idOf).filter(Boolean) : [],
    bankAccountId: idOf(raw.bankAccountId ?? raw.bankAccount),
    bankName: String(bank?.bankName ?? ""),
    accountNumber: String(bank?.accountNumber ?? ""),
    coaId: idOf(raw.chartOfAccountId),
    coaName: String(coa?.name ?? raw.coaName ?? ""),
  }
}

// ---------------------------------------------------------------------------
// General Ledger
// ---------------------------------------------------------------------------

export type LedgerQuery = {
  entryType?: "income" | "expense"
  reconciliationStatus?: "unreconciled" | "reconciled"
  status?: string
  chartOfAccountId?: string
  bankAccountId?: string
  requisitionId?: string
  paymentMethod?: string
  startDate?: string
  endDate?: string
  search?: string
  sort?: "transactionDate" | "amount" | "createdAt"
  order?: "asc" | "desc"
  page?: number
  limit?: number
}

export async function loadLedgerEntries(query: LedgerQuery = {}): Promise<LedgerEntry[]> {
  const q = new URLSearchParams({ page: String(query.page ?? 1), limit: String(Math.min(query.limit ?? 100, 100)) })
  for (const key of ["entryType", "reconciliationStatus", "status", "chartOfAccountId", "bankAccountId", "requisitionId", "paymentMethod", "startDate", "endDate", "search", "sort", "order"] as const) {
    const value = query[key]
    if (value) q.set(key, String(value))
  }
  const res = await fetch(`${API_V1}/general-ledger?${q.toString()}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load the ledger."))
  return readList(json).map(mapLedgerEntry).filter((e) => e.id)
}

export async function loadLedgerEntry(id: string): Promise<LedgerEntry | null> {
  const res = await fetch(`${API_V1}/general-ledger/${encodeURIComponent(id)}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load the entry."))
  const data = readData(json)
  return data && Object.keys(data).length ? mapLedgerEntry(data) : null
}

export async function loadStreams(params: { entryType?: "income" | "expense"; startDate?: string; endDate?: string } = {}): Promise<StreamTotals> {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, String(v))
  const res = await fetch(`${API_V1}/general-ledger/streams${q.toString() ? `?${q}` : ""}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load stream totals."))
  const data = readData(json)
  const mapStream = (s: Record<string, unknown>): LedgerStream => ({
    id: idOf(s.chartOfAccountId ?? s),
    name: String(s.name ?? ""),
    code: String(s.code ?? ""),
    total: Number(s.total ?? 0),
    verifiedTotal: Number(s.verifiedTotal ?? 0),
    pendingTotal: Number(s.pendingTotal ?? 0),
    count: Number(s.count ?? 0),
    unreconciledCount: Number(s.unreconciledCount ?? 0),
  })
  const totals = obj(data.totals) ?? {}
  return {
    income: (Array.isArray(data.income) ? (data.income as Record<string, unknown>[]) : []).map(mapStream),
    expense: (Array.isArray(data.expense) ? (data.expense as Record<string, unknown>[]) : []).map(mapStream),
    totals: { income: Number(totals.income ?? 0), expense: Number(totals.expense ?? 0), net: Number(totals.net ?? 0) },
  }
}

const BLOCKED_REASON: Record<string, string> = {
  pending_pastor: "awaiting the branch pastor",
  pending_director: "awaiting Director approval",
  draft: "not submitted yet",
  declined: "declined",
  paid: "already paid",
}

function mapRequisition(r: Record<string, unknown>, statusOverride?: string): RequisitionOption {
  const head = obj(r.budgetHeadId) ?? obj(r.chartOfAccountId)
  const details = readRequisitionDetails(r)
  const status = String(statusOverride ?? r.status ?? "approved").toLowerCase()
  return {
    id: idOf(r),
    requisitionNumber: String(r.requisitionNumber ?? r.reference ?? ""),
    amount: Number(r.amount ?? 0),
    title: details.title,
    justification: details.justification || String(r.justification ?? ""),
    requestedBy: personOf(r.requestedBy),
    coaId: idOf(r.budgetHeadId ?? r.chartOfAccountId),
    coaName: String(head?.name ?? ""),
    accountName: details.accountName,
    bankName: details.bankName,
    accountNumber: details.accountNumber,
    payee: payeeSummary(details),
    attachmentUrl: details.attachmentUrl,
    status,
    blockedReason: status === "approved" ? "" : BLOCKED_REASON[status] ?? `status: ${status}`,
  }
}

/** Approved requisitions that have not been posted to the ledger yet. */
export async function loadPostableRequisitions(search = ""): Promise<RequisitionOption[]> {
  const q = new URLSearchParams()
  if (search) q.set("search", search)
  const res = await fetch(`${API_V1}/general-ledger/requisitions${q.toString() ? `?${q}` : ""}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load requisitions."))
  return readList(json).map((r) => mapRequisition(r, "approved")).filter((r) => r.id)
}

/**
 * Requests still moving through the approval chain. The accountant cannot
 * post against these yet, but seeing them — and why — beats an empty list.
 */
export async function loadAwaitingRequisitions(): Promise<RequisitionOption[]> {
  const statuses = ["pending_pastor", "pending_director"] as const
  const lists = await Promise.all(
    statuses.map((status) =>
      fetch(`${API_V1}/financial/requisitions?status=${status}&limit=50`, { credentials: "include" })
        .then((r) => r.json().catch(() => null))
        .then((j) => readList(j).map((r) => mapRequisition(r, status)))
        .catch(() => [] as RequisitionOption[])
    )
  )
  return lists.flat().filter((r) => r.id)
}

export type NewEntryInput = {
  entryType: "income" | "expense"
  transactionDate: string
  chartOfAccountId: string
  amount: number
  /** The receipt or voucher: the file itself, or one already uploaded. */
  receipt?: File
  receiptFileId?: string
  payee?: string
  requisitionId?: string
  paymentMethod?: "cash" | "transfer" | "cheque" | "card" | "pos"
  bankAccountId?: string
  description?: string
  reference?: string
  notes?: string
}

/** Stores a document and returns its FileUpload id, for reuse across entries. */
export async function uploadReceipt(file: File, branchId: string): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  form.append("folder", "ledger-receipts")
  if (branchId) form.append("branchId", branchId)
  const res = await fetch(`${API_V1}/file-uploads`, {
    method: "POST",
    headers: { "x-csrf-token": getCsrfTokenFromCookie() },
    credentials: "include",
    body: form,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to upload the document."))
  const data = readData(json)
  const id = idOf(data)
  if (!id) throw new Error("The document was uploaded but no file id came back.")
  return id
}

/**
 * Posts an entry with its receipt. A single entry sends the file inline;
 * a collection uploads the slip once and passes `receiptFileId` on every
 * line, so one counting session stores one document, not one per line.
 */
export async function createLedgerEntry(input: NewEntryInput): Promise<LedgerEntry> {
  const optional = ["payee", "requisitionId", "paymentMethod", "bankAccountId", "description", "reference", "notes"] as const
  let res: Response

  if (input.receiptFileId) {
    res = await fetch(`${API_V1}/general-ledger`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
      credentials: "include",
      body: JSON.stringify({
        entryType: input.entryType,
        transactionDate: input.transactionDate,
        chartOfAccountId: input.chartOfAccountId,
        amount: input.amount,
        receiptFileId: input.receiptFileId,
        currency: "NGN",
        ...Object.fromEntries(optional.map((k) => [k, input[k]]).filter(([, v]) => Boolean(v))),
      }),
    })
  } else {
    if (!input.receipt) throw new Error("A receipt is required before an entry can be posted.")
    const form = new FormData()
    form.append("entryType", input.entryType)
    form.append("transactionDate", input.transactionDate)
    form.append("chartOfAccountId", input.chartOfAccountId)
    form.append("amount", String(input.amount))
    form.append("receipt", input.receipt)
    // Blank multipart fields are ignored by the API, but sending only what we
    // have keeps the request readable in the network tab.
    for (const key of optional) {
      const value = input[key]
      if (value) form.append(key, String(value))
    }
    res = await fetch(`${API_V1}/general-ledger`, {
      method: "POST",
      headers: { "x-csrf-token": getCsrfTokenFromCookie() },
      credentials: "include",
      body: form,
    })
  }

  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to post the entry."))
  return mapLedgerEntry(readData(json))
}

// ---------------------------------------------------------------------------
// Bank accounts and account heads
// ---------------------------------------------------------------------------

export type BankAccountRow = {
  id: string
  accountName: string
  accountNumber: string
  bankName: string
  currency: string
  balance: number
  isActive: boolean
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

/**
 * Account heads of one type. The ledger keys off the API's own account types:
 * `income` for the streams an inflow belongs to, `expense` for spending.
 */
export async function loadAccountHeads(branchId: string, type: "income" | "expense"): Promise<AccountHead[]> {
  const out: AccountHead[] = []
  const seen = new Set<string>()
  for (let page = 1; page <= 5; page++) {
    const q = new URLSearchParams({ page: String(page), limit: "100", accountType: type })
    if (branchId) q.set("branchId", branchId)
    const res = await fetch(`${API_V1}/financial/coa?${q.toString()}`, { credentials: "include" })
    const json = await res.json().catch(() => null)
    if (!res.ok) break
    const items = readList(json)
    for (const h of items) {
      const id = idOf(h)
      // The API has answered `revenue` for income heads in places; accept both.
      const kind = String(h.accountType ?? type).toLowerCase()
      const wanted = type === "income" ? kind === "income" || kind === "revenue" : kind === type
      if (id && wanted && !seen.has(id)) {
        seen.add(id)
        out.push({ id, name: String(h.name ?? ""), code: String(h.code ?? ""), type: kind })
      }
    }
    if (items.length < 100) break
  }
  return out
}

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------

export type StatementQuery = {
  direction?: "all" | "credit" | "debit"
  status?: "reconciled" | "unreconciled" | "unclassified"
  bankAccountId?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

export async function loadStatementLines(query: StatementQuery = {}): Promise<{ lines: StatementLine[]; total: number; pages: number }> {
  const q = new URLSearchParams({ page: String(query.page ?? 1), limit: String(Math.min(query.limit ?? 100, 100)) })
  for (const key of ["direction", "status", "bankAccountId", "startDate", "endDate", "search"] as const) {
    const value = query[key]
    if (value && !(key === "direction" && value === "all")) q.set(key, String(value))
  }
  const res = await fetch(`${API_V1}/reconciliation/statement-lines?${q.toString()}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load statement lines."))
  const pagination = obj((json as Record<string, unknown> | null)?.pagination) ?? {}
  return {
    lines: readList(json).map(mapStatementLine).filter((l) => l.id),
    total: Number(pagination.total ?? 0),
    pages: Number(pagination.pages ?? 1),
  }
}

export async function loadStatementSummary(params: { startDate?: string; endDate?: string; bankAccountId?: string; currency?: string } = {}): Promise<StatementSummary> {
  const q = new URLSearchParams({ currency: params.currency ?? "NGN" })
  for (const key of ["startDate", "endDate", "bankAccountId"] as const) {
    if (params[key]) q.set(key, String(params[key]))
  }
  const res = await fetch(`${API_V1}/reconciliation/statement-lines/summary?${q.toString()}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load the statement summary."))
  const d = readData(json)
  const counts = obj(d.counts) ?? {}
  return {
    currency: String(d.currency ?? "NGN"),
    inflow: Number(d.inflow ?? 0),
    outflow: Number(d.outflow ?? 0),
    net: Number(d.net ?? 0),
    unclassifiedAmount: Number(d.unclassifiedAmount ?? 0),
    counts: {
      total: Number(counts.total ?? 0),
      credits: Number(counts.credits ?? 0),
      debits: Number(counts.debits ?? 0),
      reconciled: Number(counts.reconciled ?? 0),
      unreconciled: Number(counts.unreconciled ?? 0),
      unclassified: Number(counts.unclassified ?? 0),
    },
    accounts: (Array.isArray(d.accounts) ? (d.accounts as Record<string, unknown>[]) : []).map((a) => ({
      bankAccountId: idOf(a.bankAccountId ?? a),
      bankName: String(a.bankName ?? ""),
      accountName: String(a.accountName ?? ""),
      accountNumber: String(a.accountNumber ?? ""),
      currency: String(a.currency ?? "NGN"),
      inflow: Number(a.inflow ?? 0),
      outflow: Number(a.outflow ?? 0),
      net: Number(a.net ?? 0),
      unreconciledCount: Number(a.unreconciledCount ?? 0),
      unclassifiedCount: Number(a.unclassifiedCount ?? 0),
    })),
  }
}

export type ImportResult = { imported: number; duplicates: number; skipped: number; errors: { row: number; reason: string }[] }

export async function importStatement(file: File, bankAccountId: string): Promise<ImportResult> {
  const form = new FormData()
  form.append("file", file)
  form.append("bankAccountId", bankAccountId)
  const res = await fetch(`${API_V1}/reconciliation/statements/import`, {
    method: "POST",
    headers: { "x-csrf-token": getCsrfTokenFromCookie() },
    credentials: "include",
    body: form,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to import the statement."))
  const d = readData(json)
  return {
    imported: Number(d.imported ?? 0),
    duplicates: Number(d.duplicates ?? 0),
    skipped: Number(d.skipped ?? 0),
    errors: (Array.isArray(d.errors) ? (d.errors as Record<string, unknown>[]) : []).map((e) => ({ row: Number(e.row ?? 0), reason: String(e.reason ?? "") })),
  }
}

/** Allocate Now: an inflow with no entry behind it goes straight to a stream. */
export async function allocateStatementLine(lineId: string, chartOfAccountId: string, notes?: string): Promise<void> {
  const res = await fetch(`${API_V1}/reconciliation/statement-lines/${encodeURIComponent(lineId)}/allocate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
    credentials: "include",
    body: JSON.stringify({ chartOfAccountId, ...(notes ? { notes } : {}) }),
  })
  if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "Unable to allocate this line."))
}

export async function loadMatchCandidates(lineId: string, params: { paymentMethod?: string; windowDays?: number } = {}): Promise<{ line: StatementLine | null; candidates: MatchCandidate[]; suggestedEntryIds: string[] }> {
  const q = new URLSearchParams()
  if (params.paymentMethod) q.set("paymentMethod", params.paymentMethod)
  if (params.windowDays) q.set("windowDays", String(params.windowDays))
  const res = await fetch(`${API_V1}/reconciliation/statement-lines/${encodeURIComponent(lineId)}/match-candidates${q.toString() ? `?${q}` : ""}`, { credentials: "include" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(describeApiError(json, "Unable to load matching entries."))
  const d = readData(json)
  const line = obj(d.statementLine)
  const suggested = Array.isArray(d.suggestedEntryIds) ? (d.suggestedEntryIds as unknown[]).map(idOf).filter(Boolean) : []
  return {
    line: line ? mapStatementLine(line) : null,
    candidates: (Array.isArray(d.candidates) ? (d.candidates as Record<string, unknown>[]) : []).map((c) => {
      // A candidate is the entry itself plus how close it is to the line.
      const entrySrc = obj(c.entry) ?? obj(c.ledgerEntry) ?? c
      return {
        entry: mapLedgerEntry(entrySrc),
        amountDifference: Number(c.amountDifference ?? 0),
        daysApart: Number(c.daysApart ?? 0),
        exactAmount: Boolean(c.exactAmount),
      }
    }),
    suggestedEntryIds: suggested,
  }
}

export async function matchStatementLine(lineId: string, ledgerEntryIds: string[], notes?: string): Promise<void> {
  const res = await fetch(`${API_V1}/reconciliation/statement-lines/${encodeURIComponent(lineId)}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
    credentials: "include",
    body: JSON.stringify({ ledgerEntryIds, ...(notes ? { notes } : {}) }),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => null)
    const err = new Error(describeApiError(json, "Unable to reconcile this line.")) as Error & { status?: number }
    err.status = res.status
    throw err
  }
}

export async function unmatchStatementLine(lineId: string): Promise<void> {
  const res = await fetch(`${API_V1}/reconciliation/statement-lines/${encodeURIComponent(lineId)}/unmatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
    credentials: "include",
  })
  if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "Unable to undo this match."))
}

// ---------------------------------------------------------------------------
// Formatting shared by the ledger screens
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

/** A short ledger reference for an entry that carries none. */
export const entryRef = (e: LedgerEntry) =>
  e.reference || e.requisitionNumber || `#${e.entryType === "income" ? "SVC" : "TXN"}-${e.id.slice(-6).toUpperCase()}`

/** The badge an entry wears in the pending tables. */
export function entryState(e: LedgerEntry): { label: string; tone: "green" | "amber" | "rose" | "blue" | "gray" } {
  if (e.reconciliationStatus === "reconciled") return { label: e.reconciliationMethod === "allocated" ? "Allocated" : "Reconciled", tone: "green" }
  if (e.status === "flagged") return { label: "Flagged", tone: "rose" }
  if (e.status === "matched") return { label: "Matched", tone: "green" }
  if (e.status === "split") return { label: "Split", tone: "blue" }
  if (e.status === "verified") return { label: "Verified · awaiting bank", tone: "amber" }
  return e.entryType === "income" ? { label: "In safe · awaiting bank", tone: "amber" } : { label: "Awaiting bank debit", tone: "amber" }
}

/** The pill a statement line wears on the Multi-Bank Ledger. */
export function lineState(l: StatementLine): { label: string; tone: "green" | "amber" | "rose" } {
  if (l.displayStatus === "reconciled") return { label: l.reconciliationMethod === "allocated" ? "Allocated" : "Reconciled", tone: "green" }
  if (l.requiresAllocation || l.displayStatus === "unclassified") return { label: "Allocate now", tone: "rose" }
  return { label: "Unreconciled", tone: "amber" }
}

// ---------------------------------------------------------------------------
// The cash safe
// ---------------------------------------------------------------------------

/**
 * What the branch is holding but has not banked: income it has recorded and
 * the statement has not yet confirmed. There is no counting-room API, so the
 * safe is read off the ledger itself — which is what it actually is.
 *
 * Cash and cheques are told apart by the entry's payment method, and the
 * funds are the income streams the entries were posted to.
 */
export type SafeFund = {
  coaId: string
  name: string
  code: string
  cash: number
  cheque: number
  chequeDocs: { ref: string; amount: number; url: string }[]
  total: number
}

export type SafeView = {
  total: number
  physicalCash: number
  cheques: number
  /** Each unbanked income entry, newest first. */
  batches: LedgerEntry[]
  funds: SafeFund[]
}

export function buildSafeView(entries: LedgerEntry[]): SafeView {
  const unbanked = entries
    .filter((e) => e.entryType === "income" && e.reconciliationStatus === "unreconciled")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const isCheque = (e: LedgerEntry) => e.paymentMethod === "cheque"
  const byFund = new Map<string, SafeFund>()
  for (const e of unbanked) {
    const key = e.coaId || e.coaName || "unassigned"
    const fund =
      byFund.get(key) ??
      { coaId: e.coaId, name: e.coaName || "Unassigned stream", code: e.coaCode, cash: 0, cheque: 0, chequeDocs: [], total: 0 }
    if (isCheque(e)) {
      fund.cheque += e.amount
      fund.chequeDocs.push({ ref: entryRef(e), amount: e.amount, url: e.receiptUrl })
    } else {
      fund.cash += e.amount
    }
    fund.total += e.amount
    byFund.set(key, fund)
  }

  const cheques = unbanked.filter(isCheque).reduce((sum, e) => sum + e.amount, 0)
  const total = unbanked.reduce((sum, e) => sum + e.amount, 0)
  return {
    total,
    physicalCash: total - cheques,
    cheques,
    batches: unbanked,
    funds: [...byFund.values()].sort((a, b) => b.total - a.total),
  }
}

// ---------------------------------------------------------------------------
// Collection batches
// ---------------------------------------------------------------------------

/**
 * The reference every line of one counting session shares, so the safe can be
 * audited as a batch: SVC-YYYYMM-DD-NN for a service collection, OFC- for an
 * office one. NN counts the batches already recorded that day.
 */
export async function nextBatchNumber(date: string, kind: "service" | "office"): Promise<string> {
  const day = (date || new Date().toISOString().slice(0, 10)).slice(0, 10)
  const [year, month, dayOfMonth] = day.split("-")
  const prefix = `${kind === "service" ? "SVC" : "OFC"}-${year}${month}-${dayOfMonth}`
  let used = new Set<string>()
  try {
    const entries = await loadLedgerEntries({ entryType: "income", startDate: day, endDate: day, limit: 100 })
    used = new Set(entries.map((e) => e.reference).filter((ref) => ref.startsWith(prefix)))
  } catch {
    // A failed lookup only risks a duplicate suffix; the entry still posts.
  }
  let n = 1
  while (used.has(`${prefix}-${String(n).padStart(2, "0")}`)) n += 1
  return `${prefix}-${String(n).padStart(2, "0")}`
}
