import {
  asArray,
  asRecord,
  readBoolean,
  readNumber,
  readPersonName,
  readRefId,
  readString,
} from "@/lib/hr/client"
import type {
  HrAttendanceLog,
  HrAttendanceMetrics,
  HrDocument,
  HrEmployee,
  HrEmployeeDetail,
  HrEmployeeMetrics,
  HrExitClearance,
  HrExitClearanceMetrics,
  HrJobRequisition,
  HrJobRequisitionMetrics,
  HrLeave,
  HrLeaveMetrics,
  HrLoan,
  HrLoanReview,
  HrPayrollOverview,
  HrPayrollRun,
  HrPayslip,
  HrTraining,
  HrTrainingBudget,
  HrTrainingMetrics,
} from "@/lib/hr/types"

/**
 * Every list endpoint populates its refs differently — `employeeId` comes back
 * as a bare id on writes, as `{ userId: { fullName } }` on the employee-centric
 * reads, and as `{ firstName, lastName }` on the loan/clearance reads. These
 * mappers flatten all three into one shape so the screens never branch on it.
 */

function branchOf(raw: unknown): { branchId: string; branchName: string } {
  const branch = asRecord(raw)
  return {
    branchId: readRefId(raw),
    branchName: readString(branch.name, branch.branchName),
  }
}

/** Pulls the employee-facing fields out of whichever ref shape arrived. */
function employeeRef(raw: unknown) {
  const employee = asRecord(raw)
  const user = asRecord(employee.userId)
  return {
    employeeId: readRefId(raw),
    employeeCode: readString(employee.employeeId, employee.staffId, employee.code),
    employeeName: readPersonName(employee, user),
    jobTitle: readString(employee.jobTitle, employee.designation),
    department: readString(employee.department),
    avatarUrl: readString(user.avatarUrl, employee.avatarUrl),
  }
}

export function mapEmployee(raw: unknown): HrEmployee {
  const item = asRecord(raw)
  const user = asRecord(item.userId)
  const branch = branchOf(item.branchId)
  return {
    id: readString(item._id, item.id),
    employeeCode: readString(item.employeeId, item.staffId),
    name: readPersonName(item, user),
    email: readString(user.email, item.email),
    avatarUrl: readString(user.avatarUrl, item.avatarUrl),
    jobTitle: readString(item.jobTitle),
    department: readString(item.department),
    employmentStatus: readString(item.employmentStatus, item.status) || "active",
    salary: readNumber(item.salary),
    hireDate: readString(item.hireDate),
    branchId: branch.branchId,
    branchName: branch.branchName,
    role: readString(user.role, item.role),
    phone: readString(item.phone, user.phone),
    profileIntegrityScore: readNumber(item.profileIntegrityScore),
  }
}

export function mapEmployeeDetail(raw: unknown): HrEmployeeDetail {
  const item = asRecord(raw)
  const emergency = asRecord(item.emergencyContact)
  const disbursement = asRecord(item.disbursementDetails)
  return {
    ...mapEmployee(raw),
    dateOfBirth: readString(item.dateOfBirth),
    gender: readString(item.gender),
    maritalStatus: readString(item.maritalStatus),
    address: readString(item.address),
    nationality: readString(item.nationality),
    religion: readString(item.religion),
    emergencyContact: {
      name: readString(emergency.name),
      relationship: readString(emergency.relationship),
      phone: readString(emergency.phone),
      email: readString(emergency.email),
    },
    allowances: asArray(item.allowances).map((entry) => {
      const allowance = asRecord(entry)
      return {
        title: readString(allowance.title, allowance.name),
        amount: readNumber(allowance.amount),
      }
    }),
    disbursementDetails: {
      bankName: readString(disbursement.bankName),
      accountNumber: readString(disbursement.accountNumber),
      accountName: readString(disbursement.accountName),
    },
  }
}

export function mapEmployeeMetrics(raw: unknown): HrEmployeeMetrics {
  const data = asRecord(raw)
  return {
    totalStaff: readNumber(data.totalStaff, data.totalEmployees),
    activeStaff: readNumber(data.activeStaff),
    onLeaveStaff: readNumber(data.onLeaveStaff),
    suspendedStaff: readNumber(data.suspendedStaff),
    exitPendingStaff: readNumber(data.exitPendingStaff),
  }
}

export function mapAttendanceLog(raw: unknown): HrAttendanceLog {
  const item = asRecord(raw)
  const employee = employeeRef(item.employeeId)
  return {
    id: readString(item._id, item.id),
    date: readString(item.date),
    clockIn: readString(item.clockIn),
    clockOut: readString(item.clockOut),
    durationMinutes: readNumber(item.durationMinutes),
    status: readString(item.status) || "missing",
    isManualEntry: readBoolean(item.isManualEntry),
    reason: readString(item.reason, item.resolutionNote),
    anomalyFixed: readBoolean(item.anomalyFixed),
    ...employee,
  }
}

export function mapAttendanceMetrics(raw: unknown): HrAttendanceMetrics {
  const data = asRecord(raw)
  return {
    totalEmployees: readNumber(data.totalEmployees),
    clockedInToday: readNumber(data.clockedInToday),
    lateToday: readNumber(data.lateToday),
    absentToday: readNumber(data.absentToday),
    attendanceRate: readNumber(data.attendanceRate),
    avgClockInTime: readString(data.avgClockInTime),
  }
}

export function mapLeave(raw: unknown): HrLeave {
  const item = asRecord(raw)
  const employee = employeeRef(item.employeeId)
  const leaveType = asRecord(item.leaveTypeId)
  return {
    id: readString(item._id, item.id),
    startDate: readString(item.startDate),
    endDate: readString(item.endDate),
    totalDays: readNumber(item.totalDays),
    reason: readString(item.reason),
    handoverNote: readString(item.handoverNote),
    status: readString(item.status) || "pending_supervisor",
    conflictCount: readNumber(item.conflictCount),
    leaveTypeId: readRefId(item.leaveTypeId),
    leaveTypeName: readString(leaveType.name, item.leaveTypeName),
    leaveTypeCode: readString(leaveType.code),
    createdAt: readString(item.createdAt),
    ...employee,
  }
}

export function mapLeaveMetrics(raw: unknown): HrLeaveMetrics {
  const data = asRecord(raw)
  return {
    total: readNumber(data.total),
    pending: readNumber(data.pending),
    approved: readNumber(data.approved),
    declined: readNumber(data.declined),
  }
}

function mapLoanReview(raw: unknown): HrLoanReview | null {
  const review = asRecord(raw)
  if (!Object.keys(review).length) return null
  return {
    isVerified: readBoolean(review.isVerified),
    action: readString(review.action),
    comment: readString(review.comment, review.reason, review.note),
    at: readString(review.reviewedAt, review.approvedAt, review.overriddenAt, review.at),
  }
}

export function mapLoan(raw: unknown): HrLoan {
  const item = asRecord(raw)
  const employeeRaw = asRecord(item.employeeId)
  const employee = employeeRef(item.employeeId)
  const branch = branchOf(item.branchId)
  return {
    id: readString(item._id, item.id),
    ...employee,
    branchId: branch.branchId,
    branchName: branch.branchName,
    amount: readNumber(item.amount),
    monthlyDeduction: readNumber(item.monthlyDeduction),
    remainingBalance: readNumber(item.remainingBalance),
    tenureMonths: readNumber(item.tenureMonths),
    purpose: readString(item.purpose),
    status: readString(item.status) || "pending_accountant",
    debtServiceRatio: readNumber(item.debtServiceRatio),
    exceedsPolicyLimit: readBoolean(item.exceedsPolicyLimit),
    createdAt: readString(item.createdAt),
    basicSalary: readNumber(employeeRaw.basicSalary, employeeRaw.salary),
    netSalary: readNumber(employeeRaw.netSalary),
    accountantReview: mapLoanReview(item.accountantReview),
    pastorApproval: mapLoanReview(item.pastorApproval),
    directorOverride: mapLoanReview(item.directorOverride),
    repayments: asArray(item.repayments).map((entry) => {
      const repayment = asRecord(entry)
      return {
        amount: readNumber(repayment.amount),
        paidAt: readString(repayment.paidAt, repayment.date),
        reference: readString(repayment.reference),
      }
    }),
  }
}

export function mapPayrollRun(raw: unknown): HrPayrollRun {
  const item = asRecord(raw)
  return {
    id: readString(item._id, item.id),
    branchId: readRefId(item.branchId),
    period: readString(item.period),
    status: readString(item.status) || "draft",
    totalGrossPay: readNumber(item.totalGrossPay),
    totalDeductions: readNumber(item.totalDeductions),
    totalNetPay: readNumber(item.totalNetPay),
    employeeCount: readNumber(item.employeeCount),
    lineItems: asArray(item.lineItems).map((entry) => {
      const line = asRecord(entry)
      return {
        employeeId: readRefId(line.employeeId),
        employeeCode: readString(line.staffId, line.employeeCode),
        employeeName: readString(line.employeeName) || readPersonName(line),
        basicSalary: readNumber(line.basicSalary),
        allowances: readNumber(line.allowances),
        grossPay: readNumber(line.grossPay),
        tax: readNumber(line.tax),
        pension: readNumber(line.pension),
        loanDeduction: readNumber(line.loanDeduction),
        netPay: readNumber(line.netPay),
      }
    }),
  }
}

export function mapPayrollOverview(raw: unknown): HrPayrollOverview {
  const data = asRecord(raw)
  const distribution = asRecord(data.statusDistribution)
  return {
    period: readString(data.period),
    totalBranches: readNumber(data.totalBranches),
    totalStaffCount: readNumber(data.totalStaffCount),
    totalGrossPayroll: readNumber(data.totalGrossPayroll),
    totalTaxWithheld: readNumber(data.totalTaxWithheld),
    totalPensionWithheld: readNumber(data.totalPensionWithheld),
    totalLoanRecovered: readNumber(data.totalLoanRecovered),
    totalNetPayable: readNumber(data.totalNetPayable),
    statusDistribution: Object.fromEntries(
      Object.entries(distribution).map(([key, value]) => [key, readNumber(value)])
    ),
  }
}

function numberMap(raw: unknown): Record<string, number> {
  return Object.fromEntries(
    Object.entries(asRecord(raw)).map(([key, value]) => [key, readNumber(value)])
  )
}

export function mapPayslip(raw: unknown): HrPayslip {
  const data = asRecord(raw)
  const employee = asRecord(data.employee)
  return {
    period: readString(data.period),
    employee: {
      id: readString(employee._id, employee.id),
      employeeCode: readString(employee.staffId, employee.employeeId),
      name: readString(employee.name) || readPersonName(employee),
      department: readString(employee.department),
      jobTitle: readString(employee.jobTitle),
      bankName: readString(employee.bankName),
      accountNumber: readString(employee.accountNumber),
    },
    earnings: numberMap(data.earnings),
    deductions: numberMap(data.deductions),
    netPay: readNumber(data.netPay),
  }
}

export function mapTraining(raw: unknown): HrTraining {
  const item = asRecord(raw)
  return {
    id: readString(item._id, item.id),
    title: readString(item.title),
    description: readString(item.description),
    locationType: readString(item.locationType) || "in_person",
    venueOrLink: readString(item.venueOrLink),
    startDate: readString(item.startDate),
    endDate: readString(item.endDate),
    startTime: readString(item.startTime),
    endTime: readString(item.endTime),
    trainerName: readString(item.trainerName),
    trainerType: readString(item.trainerType),
    maxCapacity: readNumber(item.maxCapacity),
    enrolledCount: readNumber(item.enrolledCount),
    isPaid: readBoolean(item.isPaid),
    amount: readNumber(item.amount),
    budgetRequested: readNumber(item.budgetRequested),
    budgetApproved: readBoolean(item.budgetApproved),
    certificationIncluded: readBoolean(item.certificationIncluded),
    status: readString(item.status) || "scheduled",
    branchId: readRefId(item.branchId),
    participants: asArray(item.participants).map((entry) => {
      const participant = asRecord(entry)
      const employee = employeeRef(participant.employeeId)
      return {
        recordId: readString(participant._id, participant.id),
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        jobTitle: employee.jobTitle,
        status: readString(participant.status) || "enrolled",
        score: readNumber(participant.score),
        certificateUrl: readString(participant.certificateUrl),
      }
    }),
  }
}

export function mapTrainingMetrics(raw: unknown): HrTrainingMetrics {
  const data = asRecord(raw)
  return {
    totalEvents: readNumber(data.totalEvents),
    totalEnrolled: readNumber(data.totalEnrolled),
    certifiedStaff: readNumber(data.certifiedStaff),
    completionRate: readNumber(data.completionRate),
    pendingBudgetsCount: readNumber(data.pendingBudgetsCount),
  }
}

export function mapTrainingBudget(raw: unknown): HrTrainingBudget {
  const data = asRecord(raw)
  return {
    annualAllocation: readNumber(data.annualAllocation),
    totalSpent: readNumber(data.totalSpent),
    committedPending: readNumber(data.committedPending),
    availableBalance: readNumber(data.availableBalance),
    percentageUtilized: readNumber(data.percentageUtilized),
  }
}

export function mapJobRequisition(raw: unknown): HrJobRequisition {
  const item = asRecord(raw)
  const branch = branchOf(item.branchId)
  return {
    id: readString(item._id, item.id),
    requisitionNumber: readString(item.requisitionNumber),
    roleTitle: readString(item.roleTitle),
    department: readString(item.department),
    branchId: branch.branchId,
    branchName: branch.branchName,
    salarySuggested: readNumber(item.salarySuggested),
    priority: readString(item.priority) || "medium",
    status: readString(item.status) || "pending_review",
    expectedStartDate: readString(item.expectedStartDate),
    justification: readString(item.justification),
    reviewComment: readString(item.reviewComment),
    createdAt: readString(item.createdAt),
  }
}

export function mapJobRequisitionMetrics(raw: unknown): HrJobRequisitionMetrics {
  const data = asRecord(raw)
  return {
    totalRequisitions: readNumber(data.totalRequisitions),
    pendingReviewCount: readNumber(data.pendingReviewCount),
    approvedCount: readNumber(data.approvedCount),
    rejectedCount: readNumber(data.rejectedCount),
    criticalVacancies: readNumber(data.criticalVacancies),
  }
}

export function mapExitClearance(raw: unknown): HrExitClearance {
  const item = asRecord(raw)
  const employee = employeeRef(item.employeeId)
  const branch = branchOf(item.branchId)
  const admin = asRecord(item.adminSignOff)
  const finance = asRecord(item.financeSignOff)
  const pastor = asRecord(item.pastorRelease)
  return {
    id: readString(item._id, item.id),
    ...employee,
    branchId: branch.branchId,
    branchName: branch.branchName,
    reason: readString(item.reason),
    lastWorkingDate: readString(item.lastWorkingDate),
    status: readString(item.status) || "pending_admin",
    createdAt: readString(item.createdAt),
    adminSignOff: {
      isCompleted: readBoolean(admin.isCompleted),
      notes: readString(admin.notes),
      signedOffAt: readString(admin.signedOffAt),
      checklist: asArray(admin.checklist).map((entry) => {
        const row = asRecord(entry)
        return {
          key: readString(row.key),
          label: readString(row.label),
          isReturned: readBoolean(row.isReturned),
          itemDetails: readString(row.itemDetails),
        }
      }),
    },
    financeSignOff: {
      isCompleted: readBoolean(finance.isCompleted),
      outstandingLoanBalance: readNumber(finance.outstandingLoanBalance),
      unreturnedAssetsCost: readNumber(finance.unreturnedAssetsCost),
      loanDeductionApproved: readBoolean(finance.loanDeductionApproved),
      netFinalPay: readNumber(finance.netFinalPay),
      note: readString(finance.note),
      signedOffAt: readString(finance.signedOffAt),
      directorOverride: readBoolean(finance.directorOverride),
    },
    pastorRelease: {
      isCompleted: readBoolean(pastor.isCompleted),
      releasedAt: readString(pastor.releasedAt),
    },
  }
}

export function mapExitClearanceMetrics(raw: unknown): HrExitClearanceMetrics {
  const data = asRecord(raw)
  return {
    inProgressCount: readNumber(data.inProgressCount),
    pendingAdminCount: readNumber(data.pendingAdminCount),
    pendingFinanceCount: readNumber(data.pendingFinanceCount),
    pendingPastorCount: readNumber(data.pendingPastorCount),
    completedCount: readNumber(data.completedCount),
  }
}

export function mapDocument(raw: unknown): HrDocument {
  const item = asRecord(raw)
  return {
    id: readString(item._id, item.id),
    employeeId: readRefId(item.employeeId),
    title: readString(item.title),
    documentType: readString(item.documentType) || "other",
    fileUrl: readString(item.fileUrl),
    fileSize: readNumber(item.fileSize),
    mimeType: readString(item.mimeType),
    verificationStatus: readString(item.verificationStatus) || "pending",
    verifiedAt: readString(item.verifiedAt),
    flagReason: readString(item.flagReason),
    effectiveDate: readString(item.effectiveDate),
    expiryDate: readString(item.expiryDate),
    createdAt: readString(item.createdAt),
  }
}
