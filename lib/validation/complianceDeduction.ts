import { z } from "zod"

/**
 * Statutory compliance deduction validation.
 * Mirrors the form fields used in branchaccount-pastor `compliance-remittance` page.
 */
export const complianceDeductionSchema = z.object({
  type: z.string().trim().min(1, "Deduction type is required."),
  employeeProfileId: z
    .string()
    .trim()
    .min(1, "Employee profile ID is required."),
  period: z
    .string()
    .trim()
    .min(1, "Period is required. Use format YYYY-MM.")
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Period must use the format YYYY-MM."),
  amount: z
    .number({ message: "Amount must be a number." })
    .finite("Amount must be a finite number.")
    .positive("Amount must be greater than 0."),
  branchId: z.string().trim().optional(),
})

export const complianceDeductionUpdateSchema = z.object({
  amount: z
    .number({ message: "Amount must be a number." })
    .finite("Amount must be a finite number.")
    .positive("Amount must be greater than 0."),
  period: z
    .string()
    .trim()
    .min(1, "Period is required.")
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Period must use the format YYYY-MM."),
})

export type ComplianceDeductionInput = z.infer<typeof complianceDeductionSchema>
export type ComplianceDeductionUpdateInput = z.infer<typeof complianceDeductionUpdateSchema>
