import { z } from "zod"

/**
 * Bank account creation/update validation.
 * Mirrors the form fields used in branchaccount-pastor `add-new-account` page.
 */
export const bankAccountSchema = z.object({
  bankName: z
    .string()
    .trim()
    .min(1, "Bank name is required."),
  accountName: z
    .string()
    .trim()
    .min(1, "Account name is required."),
  accountNumber: z
    .string()
    .trim()
    .min(1, "Account number is required.")
    .regex(/^[0-9]+$/, "Account number must contain digits only.")
    .min(6, "Account number is too short.")
    .max(20, "Account number is too long."),
  currency: z.enum(["NGN", "USD", "GBP", "EUR"]).default("NGN"),
  isDomiciliary: z.boolean().optional().default(false),
  chartOfAccountId: z.string().trim().optional(),
  branchId: z.string().trim().optional(),
})

export type BankAccountInput = z.infer<typeof bankAccountSchema>
