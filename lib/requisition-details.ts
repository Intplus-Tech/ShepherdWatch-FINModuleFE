import { API_V1 } from "@/lib/api"

/**
 * Requisition details beyond the core amount and justification.
 *
 * The API now stores `title`, `accountName`, `bankName`, `accountNumber` and
 * `attachments` as real fields, so `readRequisitionDetails` reads them
 * straight off the record. Requisitions raised before those fields existed
 * carry the same information packed inside the justification, so the decoder
 * below stays as the fallback for them.
 */

const PAYMENT_MARKER = "-- Payment details --"
const TITLE_PREFIX = "Title:"

export type RequisitionDetails = {
  title: string
  justification: string
  accountName: string
  bankName: string
  accountNumber: string
  attachmentUrl: string
  attachmentName: string
}

const EMPTY: RequisitionDetails = {
  title: "",
  justification: "",
  accountName: "",
  bankName: "",
  accountNumber: "",
  attachmentUrl: "",
  attachmentName: "",
}

/** Fold the extra details into one justification string. */
export function encodeRequisitionDetails(details: Partial<RequisitionDetails>): string {
  const lines: string[] = []
  if (details.title?.trim()) lines.push(`${TITLE_PREFIX} ${details.title.trim()}`, "")
  if (details.justification?.trim()) lines.push(details.justification.trim())

  const payment: string[] = []
  if (details.accountName?.trim()) payment.push(`Account name: ${details.accountName.trim()}`)
  if (details.bankName?.trim()) payment.push(`Bank: ${details.bankName.trim()}`)
  if (details.accountNumber?.trim()) payment.push(`Account number: ${details.accountNumber.trim()}`)
  if (details.attachmentUrl?.trim()) payment.push(`Attachment: ${details.attachmentName?.trim() || "Document"} ${details.attachmentUrl.trim()}`)
  if (payment.length > 0) lines.push("", PAYMENT_MARKER, ...payment)

  return lines.join("\n").trim()
}

/** Pull the details back out. Text written before this format still reads fine. */
export function decodeRequisitionDetails(justification: string): RequisitionDetails {
  const raw = String(justification ?? "")
  if (!raw.trim()) return { ...EMPTY }

  const markerAt = raw.indexOf(PAYMENT_MARKER)
  const body = markerAt >= 0 ? raw.slice(0, markerAt) : raw
  const paymentBlock = markerAt >= 0 ? raw.slice(markerAt + PAYMENT_MARKER.length) : ""

  const bodyLines = body.split("\n")
  let title = ""
  if (bodyLines[0]?.trim().startsWith(TITLE_PREFIX)) {
    title = bodyLines[0].trim().slice(TITLE_PREFIX.length).trim()
    bodyLines.shift()
  }

  const field = (label: string) => {
    const line = paymentBlock.split("\n").find((l) => l.trim().toLowerCase().startsWith(`${label.toLowerCase()}:`))
    return line ? line.slice(line.indexOf(":") + 1).trim() : ""
  }

  const attachment = field("Attachment")
  // "<name> <url>" — the url is the last whitespace-separated token.
  const urlAt = attachment.lastIndexOf(" http")
  const attachmentUrl = urlAt >= 0 ? attachment.slice(urlAt + 1).trim() : attachment.startsWith("http") ? attachment : ""
  const attachmentName = urlAt >= 0 ? attachment.slice(0, urlAt).trim() : attachmentUrl ? "Document" : ""

  return {
    title,
    justification: bodyLines.join("\n").trim(),
    accountName: field("Account name"),
    bankName: field("Bank"),
    accountNumber: field("Account number"),
    attachmentUrl,
    attachmentName,
  }
}

/**
 * The details for one requisition, preferring the stored fields and falling
 * back to the older justification packing.
 */
export function readRequisitionDetails(record: Record<string, unknown> | null | undefined): RequisitionDetails {
  const rec = record ?? {}
  const text = String(rec.justification ?? "")
  const legacy = decodeRequisitionDetails(text)
  const str = (value: unknown) => (typeof value === "string" ? value.trim() : "")

  // The first attachment, however the API returns it: an id, a url, or an
  // object carrying both.
  const first = Array.isArray(rec.attachments) ? (rec.attachments as unknown[])[0] : undefined
  const asObject = first && typeof first === "object" ? (first as Record<string, unknown>) : null
  const attachmentUrl = asObject ? str(asObject.url ?? asObject.secureUrl) : str(first).startsWith("http") ? str(first) : ""
  const attachmentName = asObject ? str(asObject.fileName ?? asObject.originalName) : ""

  return {
    title: str(rec.title) || legacy.title,
    // The stored justification is the plain reason once real fields exist.
    justification: str(rec.title) ? text.trim() : legacy.justification || text.trim(),
    accountName: str(rec.accountName) || legacy.accountName,
    bankName: str(rec.bankName) || legacy.bankName,
    accountNumber: str(rec.accountNumber) || legacy.accountNumber,
    attachmentUrl: attachmentUrl || legacy.attachmentUrl,
    attachmentName: attachmentName || legacy.attachmentName || (attachmentUrl ? "Document" : ""),
  }
}

/** A one-line payee summary for tables, or "" when no details were given. */
export function payeeSummary(details: RequisitionDetails): string {
  return [details.accountName, details.bankName, details.accountNumber].filter(Boolean).join(" · ")
}

/**
 * Whether a requisition still fits its budget head. The API blocks a plain
 * approval once it does not, so screens check this before offering one.
 */
export type BudgetFit = {
  isOverBudget: boolean
  overageAmount: number
  remainingBudget: number
  allocatedAmount: number
  totalSpent: number
}

/**
 * Why an approval is blocked.
 *
 * `unallocated` is the important one: `budget-context` reports the month's
 * allocation for the budget head, and it reads 0 even when the branch has an
 * approved budget with allocations against that head — so every request looks
 * over budget. Saying "over budget" there would be untrue; the figure is
 * simply missing.
 */
export type BudgetIssue = "none" | "overage" | "unallocated"

export function budgetIssue(fit?: BudgetFit | null): BudgetIssue {
  if (!fit || !fit.isOverBudget) return "none"
  return fit.allocatedAmount > 0 ? "overage" : "unallocated"
}

export async function fetchBudgetContext(id: string): Promise<BudgetFit | null> {
  try {
    const res = await fetch(`${API_V1}/financial/requisitions/${encodeURIComponent(id)}/budget-context`, {
      credentials: "include",
    })
    if (!res.ok) return null
    const json = (await res.json().catch(() => null)) as { data?: Record<string, unknown> } | null
    const d = json?.data
    if (!d) return null
    return {
      isOverBudget: Boolean(d.isOverBudget),
      overageAmount: Number(d.overageAmount ?? 0),
      remainingBudget: Number(d.remainingBudget ?? 0),
      allocatedAmount: Number(d.allocatedAmount ?? 0),
      totalSpent: Number(d.totalSpent ?? 0),
    }
  } catch {
    return null
  }
}

/** Budget fit for several requisitions at once, keyed by id. */
export async function fetchBudgetContexts(ids: string[]): Promise<Record<string, BudgetFit>> {
  const results = await Promise.all(ids.slice(0, 30).map((id) => fetchBudgetContext(id).then((fit) => ({ id, fit }))))
  return Object.fromEntries(results.filter((r) => r.fit).map((r) => [r.id, r.fit as BudgetFit]))
}
