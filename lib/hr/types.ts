/**
 * Types mirroring the backend HR domain (`/api/v1/hr/*`).
 *
 * These follow `shepherdwatch-be/src/models/*` and `utils/enums/hr.enums.ts`.
 * Reference fields (`employeeId`, `branchId`, `userId`, ...) are declared as
 * `Ref<T>` because the backend populates some of them and leaves others as raw
 * ObjectId strings depending on the endpoint — callers must narrow with the
 * `deref`/`refId` helpers in `lib/hr/normalize.ts` rather than assuming.
 */

export type Ref<T> = string | T | null | undefined

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export type Pagination = {
  total: number
  page: number
  limit: number
  pages: number
}

export type Paginated<T> = {
  items: T[]
  pagination: Pagination
}

/* ---------------------------------------------------------------- enums -- */

export const EMPLOYMENT_STATUSES = [
  "active",
  "on_leave",
  "suspended",
  "terminated",
  "resigned",
] as const
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number]

export const LEAVE_STATUSES = [
  "pending_supervisor",
  "pending_hr",
  "approved",
  "declined",
  "cancelled",
] as const
export type LeaveStatus = (typeof LEAVE_STATUSES)[number]

export const LOAN_STATUSES = [
  "pending_pastor",
  "pending_director",
  "approved",
  "declined",
  "active",
  "completed",
] as const
export type LoanStatus = (typeof LOAN_STATUSES)[number]

export const ATTENDANCE_STATUSES = ["present", "late", "absent", "half_day", "missing"] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export const CLEARANCE_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const
export type ClearanceStatus = (typeof CLEARANCE_STATUSES)[number]

export const CLEARANCE_STEPS = ["line_manager", "finance", "admin", "it", "hr"] as const
export type ClearanceStep = (typeof CLEARANCE_STEPS)[number]

export const JOB_REQUISITION_STATUSES = [
  "awaiting_director",
  "approved",
  "rejected",
  "cancelled",
] as const
export type JobRequisitionStatus = (typeof JOB_REQUISITION_STATUSES)[number]

export const JOB_REQUISITION_PRIORITIES = ["normal", "urgent", "critical"] as const
export type JobRequisitionPriority = (typeof JOB_REQUISITION_PRIORITIES)[number]

export const PAYROLL_RUN_STATUSES = [
  "draft",
  "processing",
  "submitted",
  "approved",
  "disbursed",
] as const
export type PayrollRunStatus = (typeof PAYROLL_RUN_STATUSES)[number]

export const TRAINING_PARTICIPANT_STATUSES = [
  "enrolled",
  "attended",
  "certified",
  "failed",
] as const
export type TrainingParticipantStatus = (typeof TRAINING_PARTICIPANT_STATUSES)[number]

export const TRAINING_LOCATION_TYPES = ["physical", "virtual", "hybrid"] as const
export type TrainingLocationType = (typeof TRAINING_LOCATION_TYPES)[number]

export const EMPLOYEE_DOCUMENT_TYPES = [
  "contract",
  "kyc",
  "educational",
  "professional",
  "performance",
  "misc",
] as const
export type EmployeeDocumentType = (typeof EMPLOYEE_DOCUMENT_TYPES)[number]

export const EMPLOYEE_DOCUMENT_STATUSES = ["pending", "verified", "flagged"] as const
export type EmployeeDocumentStatus = (typeof EMPLOYEE_DOCUMENT_STATUSES)[number]

/* --------------------------------------------------------------- shared -- */

export type UserRef = {
  _id?: string
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  avatarUrl?: string
}

export type BranchRef = {
  _id?: string
  name?: string
  state?: string
}

/* ------------------------------------------------------------- employee -- */

export type Qualification = {
  institution: string
  degree: string
  yearObtained: number
}

export type BankDetails = {
  bankName?: string
  accountNumber?: string
  accountName?: string
}

export type EmergencyContact = {
  name?: string
  relationship?: string
  phone?: string
  address?: string
}

export type NextOfKin = {
  name?: string
  relationship?: string
  phone?: string
  email?: string
}

export type AssignedAsset = {
  assetId?: string
  name?: string
  serialNumber?: string
  issuedDate?: string
  status?: string
}

export type AllowanceItem = {
  title: string
  amount: number
}

export type EmployeeProfile = {
  _id: string
  userId?: Ref<UserRef>
  branchId?: Ref<BranchRef>
  employeeId: string
  employmentStatus: EmploymentStatus
  dateOfBirth?: string
  gender?: "male" | "female"
  maritalStatus?: "single" | "married" | "divorced" | "widowed"
  phone?: string
  address?: string
  stateOfOrigin?: string
  nationality?: string
  religion?: string
  profileIntegrityScore?: number
  emergencyContact?: EmergencyContact
  nextOfKin?: NextOfKin
  jobTitle: string
  department?: string
  hireDate?: string
  confirmationDate?: string
  supervisorId?: Ref<UserRef>
  qualifications?: Qualification[]
  bankDetails?: BankDetails
  salary?: number
  allowances?: AllowanceItem[]
  assets?: AssignedAsset[]
  taxId?: string
  pensionId?: string
  nhfId?: string
  createdAt?: string
  updatedAt?: string
}

export type EmployeeMetrics = {
  totalStaff: number
  activeStaff: number
  onLeaveStaff: number
  suspendedStaff: number
  exitPendingStaff: number
}

/* ---------------------------------------------------------------- leave -- */

export type LeaveTypeConfig = {
  _id: string
  name: string
  code: string
  maxDaysPerYear: number
  carryOverAllowed?: boolean
  maxCarryOverDays?: number
  requiresApproval?: boolean
  isActive?: boolean
}

export type LeaveActionRecord = {
  action?: "approved" | "declined"
  comment?: string
  userId?: Ref<UserRef>
  timestamp?: string
}

export type LeaveRequest = {
  _id: string
  employeeId?: Ref<EmployeeProfile>
  branchId?: Ref<BranchRef>
  leaveTypeId?: Ref<LeaveTypeConfig>
  startDate: string
  endDate: string
  totalDays: number
  reason?: string
  handoverNote?: string
  appliedOnBehalfBy?: Ref<UserRef>
  conflictCount?: number
  attachments?: { name: string; url: string; size?: number; mimeType?: string }[]
  status: LeaveStatus
  supervisorId?: Ref<UserRef>
  supervisorAction?: LeaveActionRecord
  hrAction?: LeaveActionRecord
  createdAt?: string
  updatedAt?: string
}

export type LeaveMetrics = {
  total: number
  pending: number
  approved: number
  declined: number
}

export type LeaveBalance = {
  leaveTypeId: string
  name: string
  code: string
  entitlement: number
  used: number
  remaining: number
  requiresApproval?: boolean
}

/** `GET /leave-types/balances/:employeeId` wraps the rows with its context. */
export type LeaveBalancesResponse = {
  employeeId: string
  year: number
  balances: LeaveBalance[]
}

/* ----------------------------------------------------------------- loan -- */

export type LoanApproval = {
  role: string
  userId?: Ref<UserRef>
  action: "approved" | "declined"
  comment?: string
  timestamp?: string
}

export type LoanRepayment = {
  amount: number
  date: string
  transactionId?: string
  payrollRunId?: string
}

export const LOAN_INSTALLMENT_STATUSES = ["pending", "partial", "paid", "overdue"] as const
export type LoanInstallmentStatus = (typeof LOAN_INSTALLMENT_STATUSES)[number]

/**
 * One row of the stored repayment plan.
 *
 * Generated by the backend when the loan is activated, so the dates and amounts
 * are the real plan rather than a client-side projection.
 */
export type LoanInstallment = {
  installment: number
  dueDate: string
  amount: number
  paidAmount: number
  status: LoanInstallmentStatus
  paidAt?: string
}

/** Returned alongside a loan by `GET /loans/:id`. */
export type LoanScheduleSummary = {
  totalInstallments: number
  paidInstallments: number
  overdueInstallments: number
  remainingInstallments: number
  nextDueDate: string | null
  nextDueAmount: number
}

export type EmployeeLoan = {
  _id: string
  employeeId?: Ref<EmployeeProfile>
  branchId?: Ref<BranchRef>
  amount: number
  purpose: string
  tenureMonths: number
  monthlyDeduction: number
  debtServiceRatio: number
  status: LoanStatus
  firstDeductionDate?: string
  supportingDocumentUrls?: string[]
  accountantReview?: {
    reviewedBy?: Ref<UserRef>
    comment?: string
    timestamp?: string
    isVerified?: boolean
  }
  overrideDetails?: {
    approvedBy?: Ref<UserRef>
    reason?: string
    acknowledgedPolicyViolation?: boolean
    timestamp?: string
  }
  approvals?: LoanApproval[]
  declineReason?: string
  disbursedAt?: string
  totalRepaid?: number
  repayments?: LoanRepayment[]
  schedule?: LoanInstallment[]
  createdAt?: string
  updatedAt?: string
}

/** `GET /loans/:id` returns the loan plus its schedule summary. */
export type EmployeeLoanDetail = EmployeeLoan & {
  scheduleSummary?: LoanScheduleSummary
}

/* ----------------------------------------------------------- attendance -- */

export type AttendanceLog = {
  _id: string
  employeeId?: Ref<EmployeeProfile>
  branchId?: Ref<BranchRef>
  date: string
  clockIn?: string
  clockOut?: string
  durationMinutes?: number
  status: AttendanceStatus
  isManualEntry?: boolean
  markedBy?: Ref<UserRef>
  reason?: string
  anomalyFixed?: boolean
  resolutionNote?: string
  resolvedBy?: Ref<UserRef>
  resolvedAt?: string
  createdAt?: string
}

export type AttendanceMetrics = {
  totalEmployees: number
  clockedInToday: number
  lateToday: number
  absentToday: number
  attendanceRate: number
  avgClockInTime?: string
}

/* ------------------------------------------------------------- training -- */

export type TrainingEvent = {
  _id: string
  title: string
  branchId?: Ref<BranchRef>
  isGlobal?: boolean
  locationType: TrainingLocationType
  venueOrLink: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  trainerName: string
  trainerType?: "internal" | "external"
  maxCapacity?: number
  isPaid?: boolean
  amount?: number
  budgetRequested?: number
  budgetApproved?: boolean
  budgetApprovedBy?: Ref<UserRef>
  budgetJustification?: string
  flyerUrl?: string
  certificationIncluded?: boolean
  description?: string
  participantCount?: number
  createdAt?: string
}

export type TrainingParticipant = {
  _id: string
  trainingEventId?: Ref<TrainingEvent>
  employeeId?: Ref<EmployeeProfile>
  enrolledBy?: Ref<UserRef>
  status: TrainingParticipantStatus
  score?: number
  completionDate?: string
  renewalDate?: string
  certificateUrl?: string
}

export type TrainingMetrics = {
  totalSessions: number
  staffEnrolled: number
  pendingCompletions: number
}

/**
 * `GET /trainings/budget-overview`.
 *
 * `annualAllocation` comes from `GlobalHrConfig` (with an optional per-branch
 * override) and `totalSpent` is scoped to the caller's branch, so a branch view
 * measures its own spend against its own budget.
 */
export type TrainingBudgetOverview = {
  annualAllocation: number
  totalSpent: number
  availableBalance: number
  currency: string
  /** "branch" when scoped to the caller's branch, "organisation" otherwise. */
  scope: "branch" | "organisation"
}

/* ------------------------------------------------------- exit clearance -- */

export type ClearanceStepRecord = {
  step: ClearanceStep
  clearedBy?: Ref<UserRef>
  status: ClearanceStatus
  comment?: string
  timestamp?: string
}

export type AdminChecklistItem = {
  key: string
  label: string
  isReturned?: boolean
  itemDetails?: string
}

export type FinanceSettlement = {
  outstandingLoanBalance?: number
  unreturnedAssetsCost?: number
  loanDeductionApproved?: boolean
  netFinalPay?: number
  note?: string
}

export type PastorRelease = {
  confirmedBy?: Ref<UserRef>
  confirmedAt?: string
  dischargeLetterSent?: boolean
}

export type ExitClearance = {
  _id: string
  employeeId?: Ref<EmployeeProfile>
  branchId?: Ref<BranchRef>
  reason: string
  lastWorkingDate: string
  status: ClearanceStatus
  steps?: ClearanceStepRecord[]
  adminChecklist?: AdminChecklistItem[]
  financeSettlement?: FinanceSettlement
  pastorRelease?: PastorRelease
  initiatedBy?: Ref<UserRef>
  completedAt?: string
  createdAt?: string
}

export type ExitClearanceMetrics = {
  total: number
  inProgress: number
  completed: number
}

/* ------------------------------------------------------ job requisition -- */

export type JobRequisition = {
  _id: string
  refNumber: string
  roleTitle: string
  department: string
  branchId?: Ref<BranchRef>
  salarySuggested: number
  priority: JobRequisitionPriority
  expectedStartDate: string
  justification: string
  status: JobRequisitionStatus
  submittedBy?: Ref<UserRef>
  reviewedBy?: Ref<UserRef>
  reviewComment?: string
  reviewedAt?: string
  createdAt?: string
}

export type JobRequisitionMetrics = {
  activeRequests: number
  approvedThisMonth: number
}

/* -------------------------------------------------------------- payroll -- */

export type PayrollEntry = {
  employeeId?: Ref<EmployeeProfile>
  employeeName: string
  jobTitle: string
  department?: string
  basicSalary: number
  allowances?: AllowanceItem[]
  totalAllowances?: number
  grossPay: number
  payeDeduction?: number
  pensionDeduction?: number
  loanDeduction?: number
  otherDeductions?: number
  totalDeductions: number
  netPay: number
  employmentStatus?: string
}

export type PayrollRun = {
  _id: string
  branchId?: Ref<BranchRef>
  period: string
  status: PayrollRunStatus
  entries?: PayrollEntry[]
  totalEmployees?: number
  totalGross?: number
  totalDeductions?: number
  totalNet?: number
  processedBy?: Ref<UserRef>
  submittedBy?: Ref<UserRef>
  submittedAt?: string
  approvedBy?: Ref<UserRef>
  approvedAt?: string
  disbursedBy?: Ref<UserRef>
  disbursedAt?: string
  rejectionReason?: string
  createdAt?: string
}

export type PayrollOverview = {
  period: string
  summary: {
    totalGross: number
    totalDeductions: number
    totalNet: number
    totalEmployees: number
    totalBranches: number
  }
  branchRuns: PayrollRun[]
}

export type Payslip = {
  runPeriod: string
  branch?: Ref<BranchRef>
  employee?: EmployeeProfile
  payslip?: PayrollEntry
}

/* ------------------------------------------------------------ documents -- */

export type EmployeeDocument = {
  _id: string
  employeeId?: Ref<EmployeeProfile>
  documentType: EmployeeDocumentType
  title: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  effectiveDate?: string
  expiryDate?: string
  status: EmployeeDocumentStatus
  verifiedBy?: Ref<UserRef>
  verifiedAt?: string
  flagReason?: string
  isLocked?: boolean
  uploadedBy?: Ref<UserRef>
  createdAt?: string
}

/* --------------------------------------------------------------- config -- */

export type TrainingBranchAllocation = {
  branchId: string
  annualAllocation: number
}

/** `GET /hr/config` — organisation-wide HR settings. */
export type GlobalHrConfig = {
  _id: string
  training: {
    annualAllocation: number
    currency: string
    branchAllocations: TrainingBranchAllocation[]
  }
  updatedBy?: Ref<UserRef>
  updatedAt?: string
}

/* ----------------------------------------------------------- dashboards -- */

export type AccountantDashboard = {
  kpis: {
    totalEmployees: number
    payrollMtd: number
    activeLoans: number
    loanBalance: number
  }
  workforceCostTrend: { period: string; month: string; payroll: number; deductions: number }[]
  loanPortfolioHealth: { category: string; count: number; principal: number }[]
  recentActions: { action: string; timestamp: string; user: string }[]
}

export type AdminDashboard = {
  kpis: {
    totalEmployees: number
    onLeaveToday: number
    clockedInToday: number
    clockInRate: number
    activeTrainings: number
  }
  pendingActions: { type: string; count: number; label: string }[]
}

export type PastorDashboard = {
  operationalSummary: {
    attendanceRate: number
    totalEmployees: number
    presentToday: number
    staffOnLeave: { employee?: Ref<EmployeeProfile>; returnDate: string }[]
    nextTraining?: TrainingEvent | null
  }
}

export type DirectorOverview = {
  metrics: {
    totalHeadcount: number
    totalBranches: number
    totalActiveLoans: number
    turnoverRate: number
    turnoverBasis: { leaversThisYear: number; since: string }
    totalPayrollCost: number
    payrollPeriod: string
  }
  headcountByBranch: {
    branchId: string
    branchName: string
    state?: string
    count: number
    presentToday: number
    attendanceRate: number
    attendanceHealth: "GOOD" | "WARNING" | "CRITICAL" | "UNKNOWN"
  }[]
}
