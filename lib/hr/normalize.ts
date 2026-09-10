import type {
  AttendanceStatus,
  LoanInstallmentStatus,
  BranchRef,
  ClearanceStatus,
  ClearanceStep,
  EmployeeDocumentStatus,
  EmployeeLoan,
  EmployeeProfile,
  EmploymentStatus,
  JobRequisitionPriority,
  JobRequisitionStatus,
  LeaveRequest,
  LeaveStatus,
  LoanStatus,
  PayrollRunStatus,
  Ref,
  TrainingParticipantStatus,
  UserRef,
} from "@/lib/hr/types"

/**
 * Helpers for reading the backend's populated-or-not reference fields and for
 * turning stored enum values into the labels the HR screens display.
 *
 * The same field arrives as an ObjectId string on list endpoints and as a
 * populated object on detail endpoints, so every screen needs `deref`/`refId`
 * rather than assuming one shape.
 */

/** The populated object behind a reference, or `null` when only an id came back. */
export function deref<T extends object>(ref: Ref<T>): T | null {
  if (!ref) return null
  if (typeof ref === "string") return null
  return ref
}

/** The id behind a reference, whether it arrived populated or as a raw string. */
export function refId<T extends { _id?: string }>(ref: Ref<T>): string {
  if (!ref) return ""
  if (typeof ref === "string") return ref
  return ref._id ?? ""
}

/** Display name for a user reference, falling back through the name fields. */
export function userName(ref: Ref<UserRef>, fallback = "—"): string {
  const user = deref(ref)
  if (!user) return fallback
  const full = user.fullName?.trim()
  if (full) return full
  const composed = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  if (composed) return composed
  return user.email?.trim() || fallback
}

/** Display name for the person an employee profile belongs to. */
export function employeeName(ref: Ref<EmployeeProfile>, fallback = "Unknown employee"): string {
  const employee = deref(ref)
  if (!employee) return fallback
  return userName(employee.userId, employee.employeeId || fallback)
}

export function employeeEmail(ref: Ref<EmployeeProfile>): string {
  const employee = deref(ref)
  if (!employee) return ""
  return deref(employee.userId)?.email ?? ""
}

/** Human-readable branch name. */
export function branchName(ref: Ref<BranchRef>, fallback = "—"): string {
  return deref(ref)?.name?.trim() || fallback
}

export function initials(name: string): string {
  const parts = name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((part) => /[a-z]/i.test(part))
  if (parts.length === 0) return "?"
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

/* --------------------------------------------------------------- labels -- */

/** Generic `snake_case` -> `Title Case` for any enum without a bespoke label. */
export function titleCase(value: string | null | undefined): string {
  if (!value) return "—"
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  terminated: "Terminated",
  resigned: "Resigned",
}

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending_supervisor: "Pending Supervisor",
  pending_hr: "Pending HR",
  approved: "Approved",
  declined: "Declined",
  cancelled: "Cancelled",
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  pending_pastor: "Pending Pastor",
  pending_director: "Pending Director",
  approved: "Approved",
  declined: "Declined",
  active: "Active",
  completed: "Completed",
}

export const LOAN_INSTALLMENT_STATUS_LABELS: Record<LoanInstallmentStatus, string> = {
  pending: "Upcoming",
  partial: "Part Paid",
  paid: "Paid",
  overdue: "Overdue",
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  half_day: "Half Day",
  missing: "Missing",
}

export const CLEARANCE_STATUS_LABELS: Record<ClearanceStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const CLEARANCE_STEP_LABELS: Record<ClearanceStep, string> = {
  line_manager: "Line Manager",
  finance: "Finance",
  admin: "Admin",
  it: "IT",
  hr: "HR",
}

export const JOB_REQUISITION_STATUS_LABELS: Record<JobRequisitionStatus, string> = {
  awaiting_director: "Awaiting Director",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

export const JOB_REQUISITION_PRIORITY_LABELS: Record<JobRequisitionPriority, string> = {
  normal: "Normal",
  urgent: "Urgent",
  critical: "Critical",
}

export const PAYROLL_RUN_STATUS_LABELS: Record<PayrollRunStatus, string> = {
  draft: "Draft",
  processing: "Processing",
  submitted: "Submitted",
  approved: "Approved",
  disbursed: "Disbursed",
}

export const TRAINING_PARTICIPANT_STATUS_LABELS: Record<TrainingParticipantStatus, string> = {
  enrolled: "Enrolled",
  attended: "Attended",
  certified: "Certified",
  failed: "Failed",
}

export const EMPLOYEE_DOCUMENT_STATUS_LABELS: Record<EmployeeDocumentStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  flagged: "Flagged",
}

/* ---------------------------------------------------------- badge styles -- */

/**
 * Tailwind classes per status, kept next to the labels so a new backend enum
 * value shows up as one unstyled-but-readable badge instead of an empty cell.
 */
const NEUTRAL_BADGE = "bg-[#F3F4F6] text-[#4B5563]"

export const EMPLOYMENT_STATUS_BADGES: Record<EmploymentStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  on_leave: "bg-amber-50 text-amber-700",
  suspended: "bg-orange-50 text-orange-700",
  terminated: "bg-red-50 text-red-700",
  resigned: "bg-[#F3F4F6] text-[#4B5563]",
}

export const LEAVE_STATUS_BADGES: Record<LeaveStatus, string> = {
  pending_supervisor: "bg-amber-50 text-amber-700",
  pending_hr: "bg-blue-50 text-blue-700",
  approved: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-700",
  cancelled: "bg-[#F3F4F6] text-[#4B5563]",
}

export const LOAN_STATUS_BADGES: Record<LoanStatus, string> = {
  pending_pastor: "bg-amber-50 text-amber-700",
  pending_director: "bg-blue-50 text-blue-700",
  approved: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-700",
  active: "bg-violet-50 text-violet-700",
  completed: "bg-[#F3F4F6] text-[#4B5563]",
}

export const LOAN_INSTALLMENT_STATUS_BADGES: Record<LoanInstallmentStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  partial: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-rose-100 text-rose-700",
}

export const ATTENDANCE_STATUS_BADGES: Record<AttendanceStatus, string> = {
  present: "bg-emerald-50 text-emerald-700",
  late: "bg-amber-50 text-amber-700",
  absent: "bg-red-50 text-red-700",
  half_day: "bg-blue-50 text-blue-700",
  missing: "bg-[#F3F4F6] text-[#4B5563]",
}

export const CLEARANCE_STATUS_BADGES: Record<ClearanceStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-[#F3F4F6] text-[#4B5563]",
}

export const JOB_REQUISITION_STATUS_BADGES: Record<JobRequisitionStatus, string> = {
  awaiting_director: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-[#F3F4F6] text-[#4B5563]",
}

export const JOB_REQUISITION_PRIORITY_BADGES: Record<JobRequisitionPriority, string> = {
  normal: "bg-[#F3F4F6] text-[#4B5563]",
  urgent: "bg-amber-50 text-amber-700",
  critical: "bg-red-50 text-red-700",
}

export const PAYROLL_RUN_STATUS_BADGES: Record<PayrollRunStatus, string> = {
  draft: "bg-[#F3F4F6] text-[#4B5563]",
  processing: "bg-blue-50 text-blue-700",
  submitted: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  disbursed: "bg-violet-50 text-violet-700",
}

export const TRAINING_PARTICIPANT_STATUS_BADGES: Record<TrainingParticipantStatus, string> = {
  enrolled: "bg-blue-50 text-blue-700",
  attended: "bg-violet-50 text-violet-700",
  certified: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
}

export const EMPLOYEE_DOCUMENT_STATUS_BADGES: Record<EmployeeDocumentStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  verified: "bg-emerald-50 text-emerald-700",
  flagged: "bg-red-50 text-red-700",
}

/** Look a value up in a label/badge map without crashing on unknown enums. */
export function lookup<T extends string>(
  map: Record<T, string>,
  value: string | null | undefined,
  fallback?: string,
): string {
  if (value && value in map) return map[value as T]
  return fallback ?? titleCase(value)
}

export function badgeFor<T extends string>(
  map: Record<T, string>,
  value: string | null | undefined,
): string {
  if (value && value in map) return map[value as T]
  return NEUTRAL_BADGE
}

/* ------------------------------------------------------------- derived --- */

/** Outstanding principal on a loan. */
export function loanBalance(loan: EmployeeLoan): number {
  return Math.max(0, (loan.amount ?? 0) - (loan.totalRepaid ?? 0))
}

/** Repayment progress as a 0-100 percentage. */
export function loanProgress(loan: EmployeeLoan): number {
  if (!loan.amount) return 0
  return Math.min(100, Math.round(((loan.totalRepaid ?? 0) / loan.amount) * 100))
}

/** Whether a leave request is still awaiting any decision. */
export function isLeavePending(leave: LeaveRequest): boolean {
  return leave.status === "pending_supervisor" || leave.status === "pending_hr"
}

/** `HH:MM AM` for a stored timestamp, or an em dash when absent. */
export function clockTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

/** `7h 42m` from a stored duration. */
export function duration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "—"
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
}

/** Current period in the `YYYY-MM` shape the payroll endpoints expect. */
export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

/** `2024-10` -> `October 2024`. */
export function periodLabel(period: string | null | undefined): string {
  if (!period) return "—"
  const [year, month] = period.split("-").map(Number)
  if (!year || !month) return period
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString("en-NG", { month: "long", year: "numeric" })
}
