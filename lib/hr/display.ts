/** Display helpers shared by every HR screen: labels, badges and formatters. */

export const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  terminated: "Exited",
  resigned: "Resigned",
}

export const EMPLOYMENT_STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  on_leave: "bg-amber-100 text-amber-700",
  suspended: "bg-orange-100 text-orange-700",
  terminated: "bg-slate-100 text-slate-600",
  resigned: "bg-slate-100 text-slate-600",
}

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  half_day: "Half Day",
  missing: "Missing",
}

export const ATTENDANCE_STATUS_STYLES: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700",
  late: "bg-amber-100 text-amber-700",
  absent: "bg-rose-100 text-rose-700",
  half_day: "bg-blue-100 text-blue-700",
  missing: "bg-slate-100 text-slate-600",
}

export const LEAVE_STATUS_LABELS: Record<string, string> = {
  pending_supervisor: "Pending Supervisor",
  pending_hr: "Pending HR",
  approved: "Approved",
  declined: "Declined",
  cancelled: "Cancelled",
}

export const LEAVE_STATUS_STYLES: Record<string, string> = {
  pending_supervisor: "bg-amber-100 text-amber-700",
  pending_hr: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  declined: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
}

export const LOAN_STATUS_LABELS: Record<string, string> = {
  pending_accountant: "Pending Accountant",
  pending_pastor: "Pending Pastor",
  pending_director: "Pending Director",
  approved: "Approved",
  active: "Active",
  completed: "Completed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

export const LOAN_STATUS_STYLES: Record<string, string> = {
  pending_accountant: "bg-amber-100 text-amber-700",
  pending_pastor: "bg-blue-100 text-blue-700",
  pending_director: "bg-purple-100 text-purple-700",
  approved: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-600",
  rejected: "bg-rose-100 text-rose-700",
  withdrawn: "bg-slate-100 text-slate-600",
}

export const REQUISITION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  filled: "Filled",
  cancelled: "Cancelled",
}

export const REQUISITION_STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending_review: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  filled: "bg-blue-100 text-blue-700",
  cancelled: "bg-slate-100 text-slate-600",
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

export const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
}

export const CLEARANCE_STATUS_LABELS: Record<string, string> = {
  pending_admin: "Pending Admin",
  pending_finance: "Pending Finance",
  pending_pastor: "Pending Pastor",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const CLEARANCE_STATUS_STYLES: Record<string, string> = {
  pending_admin: "bg-amber-100 text-amber-700",
  pending_finance: "bg-blue-100 text-blue-700",
  pending_pastor: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
}

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  verified: "Verified",
  flagged: "Flagged",
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  contract: "Contract",
  id_proof: "ID Proof",
  academic_credential: "Academic Credential",
  certification: "Certification",
  medical_clearance: "Medical Clearance",
  background_check: "Background Check",
  other: "Other",
}

export const TRAINING_RECORD_LABELS: Record<string, string> = {
  enrolled: "Enrolled",
  attended: "Attended",
  certified: "Certified",
  failed: "Failed",
  no_show: "No Show",
}

/** Falls back to a title-cased version of any value the backend adds later. */
export function statusLabel(map: Record<string, string>, value: string): string {
  const key = String(value ?? "").toLowerCase()
  if (map[key]) return map[key]
  return key
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function statusStyle(map: Record<string, string>, value: string): string {
  return map[String(value ?? "").toLowerCase()] ?? "bg-slate-100 text-slate-600"
}

const NAIRA = "₦"

export function formatNaira(amount: number, options: { compact?: boolean } = {}): string {
  const value = Number.isFinite(amount) ? amount : 0
  if (options.compact) {
    if (Math.abs(value) >= 1_000_000) return `${NAIRA}${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000) return `${NAIRA}${(value / 1_000).toFixed(0)}K`
  }
  return `${NAIRA}${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`
}

export function formatDate(value: string, fallback = "—"): string {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export function formatShortDate(value: string, fallback = "—"): string {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
}

export function formatTime(value: string, fallback = "—"): string {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    // Already a plain "09:00" clock value.
    return /^\d{1,2}:\d{2}/.test(value) ? value : fallback
  }
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "—"
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export function initials(name: string): string {
  const cleaned = String(name ?? "").replace(/^(Dr|Rev|Pastor|Mr|Mrs|Ms)\.?\s+/i, "").trim()
  if (!cleaned) return "—"
  return cleaned
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** "Showing 1 - 20 of 124 records" for the table footers. */
export function rangeLabel(page: number, limit: number, total: number, noun = "records"): string {
  if (!total) return `No ${noun}`
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `Showing ${start} - ${end} of ${total} ${noun}`
}
