/** Normalized HR domain models. Hooks map the backend payloads onto these. */

export type EmploymentStatus = "active" | "on_leave" | "suspended" | "terminated" | "resigned"
export type AttendanceStatus = "present" | "late" | "absent" | "half_day" | "missing"
export type LeaveStatus = "pending_supervisor" | "pending_hr" | "approved" | "declined" | "cancelled"
export type LoanStatus =
  | "pending_accountant"
  | "pending_pastor"
  | "pending_director"
  | "approved"
  | "active"
  | "completed"
  | "rejected"
  | "withdrawn"
export type RequisitionStatus = "draft" | "pending_review" | "approved" | "rejected" | "filled" | "cancelled"
export type RequisitionPriority = "low" | "medium" | "high" | "critical"
export type ExitClearanceStatus =
  | "pending_admin"
  | "pending_finance"
  | "pending_pastor"
  | "completed"
  | "cancelled"
export type DocumentType =
  | "contract"
  | "id_proof"
  | "academic_credential"
  | "certification"
  | "medical_clearance"
  | "background_check"
  | "other"
export type DocumentStatus = "pending" | "verified" | "flagged"
export type TrainingRecordStatus = "enrolled" | "attended" | "certified" | "failed" | "no_show"

export type HrEmployee = {
  id: string
  employeeCode: string
  name: string
  email: string
  avatarUrl: string
  jobTitle: string
  department: string
  employmentStatus: EmploymentStatus | string
  salary: number
  hireDate: string
  branchId: string
  branchName: string
  role: string
  phone: string
  profileIntegrityScore: number
}

export type HrEmployeeDetail = HrEmployee & {
  dateOfBirth: string
  gender: string
  maritalStatus: string
  address: string
  nationality: string
  religion: string
  emergencyContact: { name: string; relationship: string; phone: string; email: string }
  allowances: { title: string; amount: number }[]
  disbursementDetails: { bankName: string; accountNumber: string; accountName: string }
}

export type HrEmployeeMetrics = {
  totalStaff: number
  activeStaff: number
  onLeaveStaff: number
  suspendedStaff: number
  exitPendingStaff: number
}

export type HrAttendanceLog = {
  id: string
  date: string
  clockIn: string
  clockOut: string
  durationMinutes: number
  status: AttendanceStatus | string
  isManualEntry: boolean
  reason: string
  anomalyFixed: boolean
  employeeId: string
  employeeCode: string
  employeeName: string
  jobTitle: string
  department: string
  avatarUrl: string
}

export type HrAttendanceMetrics = {
  totalEmployees: number
  clockedInToday: number
  lateToday: number
  absentToday: number
  attendanceRate: number
  avgClockInTime: string
}

export type HrLeave = {
  id: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  handoverNote: string
  status: LeaveStatus | string
  conflictCount: number
  employeeId: string
  employeeCode: string
  employeeName: string
  jobTitle: string
  department: string
  avatarUrl: string
  leaveTypeId: string
  leaveTypeName: string
  leaveTypeCode: string
  createdAt: string
}

export type HrLeaveMetrics = {
  total: number
  pending: number
  approved: number
  declined: number
}

export type HrLoanReview = {
  isVerified: boolean
  action: string
  comment: string
  at: string
}

export type HrLoanRepayment = {
  amount: number
  paidAt: string
  reference: string
}

export type HrLoan = {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  jobTitle: string
  department: string
  branchId: string
  branchName: string
  amount: number
  monthlyDeduction: number
  remainingBalance: number
  tenureMonths: number
  purpose: string
  status: LoanStatus | string
  debtServiceRatio: number
  exceedsPolicyLimit: boolean
  createdAt: string
  basicSalary: number
  netSalary: number
  accountantReview: HrLoanReview | null
  pastorApproval: HrLoanReview | null
  directorOverride: HrLoanReview | null
  repayments: HrLoanRepayment[]
}

export type HrPayrollLineItem = {
  employeeId: string
  employeeCode: string
  employeeName: string
  basicSalary: number
  allowances: number
  grossPay: number
  tax: number
  pension: number
  loanDeduction: number
  netPay: number
}

export type HrPayrollRun = {
  id: string
  branchId: string
  period: string
  status: string
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  employeeCount: number
  lineItems: HrPayrollLineItem[]
}

export type HrPayrollOverview = {
  period: string
  totalBranches: number
  totalStaffCount: number
  totalGrossPayroll: number
  totalTaxWithheld: number
  totalPensionWithheld: number
  totalLoanRecovered: number
  totalNetPayable: number
  statusDistribution: Record<string, number>
}

export type HrPayslip = {
  period: string
  employee: {
    id: string
    employeeCode: string
    name: string
    department: string
    jobTitle: string
    bankName: string
    accountNumber: string
  }
  earnings: Record<string, number>
  deductions: Record<string, number>
  netPay: number
}

export type HrTrainingParticipant = {
  recordId: string
  employeeId: string
  employeeName: string
  jobTitle: string
  status: TrainingRecordStatus | string
  score: number
  certificateUrl: string
}

export type HrTraining = {
  id: string
  title: string
  description: string
  locationType: string
  venueOrLink: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  trainerName: string
  trainerType: string
  maxCapacity: number
  enrolledCount: number
  isPaid: boolean
  amount: number
  budgetRequested: number
  budgetApproved: boolean
  certificationIncluded: boolean
  status: string
  branchId: string
  participants: HrTrainingParticipant[]
}

export type HrTrainingMetrics = {
  totalEvents: number
  totalEnrolled: number
  certifiedStaff: number
  completionRate: number
  pendingBudgetsCount: number
}

export type HrTrainingBudget = {
  annualAllocation: number
  totalSpent: number
  committedPending: number
  availableBalance: number
  percentageUtilized: number
}

export type HrJobRequisition = {
  id: string
  requisitionNumber: string
  roleTitle: string
  department: string
  branchId: string
  branchName: string
  salarySuggested: number
  priority: RequisitionPriority | string
  status: RequisitionStatus | string
  expectedStartDate: string
  justification: string
  reviewComment: string
  createdAt: string
}

export type HrJobRequisitionMetrics = {
  totalRequisitions: number
  pendingReviewCount: number
  approvedCount: number
  rejectedCount: number
  criticalVacancies: number
}

export type HrClearanceChecklistItem = {
  key: string
  label: string
  isReturned: boolean
  itemDetails: string
}

export type HrExitClearance = {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  jobTitle: string
  department: string
  branchId: string
  branchName: string
  reason: string
  lastWorkingDate: string
  status: ExitClearanceStatus | string
  createdAt: string
  adminSignOff: {
    isCompleted: boolean
    notes: string
    signedOffAt: string
    checklist: HrClearanceChecklistItem[]
  }
  financeSignOff: {
    isCompleted: boolean
    outstandingLoanBalance: number
    unreturnedAssetsCost: number
    loanDeductionApproved: boolean
    netFinalPay: number
    note: string
    signedOffAt: string
    directorOverride: boolean
  }
  pastorRelease: { isCompleted: boolean; releasedAt: string }
}

export type HrExitClearanceMetrics = {
  inProgressCount: number
  pendingAdminCount: number
  pendingFinanceCount: number
  pendingPastorCount: number
  completedCount: number
}

export type HrDocument = {
  id: string
  employeeId: string
  title: string
  documentType: DocumentType | string
  fileUrl: string
  fileSize: number
  mimeType: string
  verificationStatus: DocumentStatus | string
  verifiedAt: string
  flagReason: string
  effectiveDate: string
  expiryDate: string
  createdAt: string
}
