import { API_V1 } from "@/lib/api"

/**
 * Requisition details the API has no fields for.
 *
 * `POST /requisitions` accepts only branchId, budgetHeadId, amount,
 * justification and requiredDate — anything else sent alongside is silently
 * dropped. The expense title, the payee's bank details and any attachment
 * still have to reach the approver and the accountant who pays, so they ride
 * inside the justification in a fixed, human-readable block and are parsed
 * back out for display.
 *
 * This is a stopgap. Once the backend adds real fields (title, accountName,
 * bankName, accountNumber, attachments), `encode` and `decode` are the only
 * two places that need to change.
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

/** A one-line payee summary for tables, or "" when no details were given. */
export function payeeSummary(details: RequisitionDetails): string {
  return [details.accountName, details.bankName, details.accountNumber].filter(Boolean).join(" · ")
}

/**
 * Whether a requisition still fits its budget head. The API blocks a plain
 * approval once it does not, so screens check this before offering one.
 */
export type BudgetFit = { isOverBudget: boolean; overageAmount: number; remainingBudget: number }

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
