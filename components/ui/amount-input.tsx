"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Formats a raw string into a thousands-separated amount as the user types,
 * e.g. "5000" -> "5,000", "1000000" -> "1,000,000", "1234.5" -> "1,234.5".
 * Keeps a single decimal point (max 2 decimals). Strips leading zeros.
 */
export function formatAmount(raw: string): string {
  const cleaned = String(raw).replace(/[^\d.]/g, "")
  const firstDot = cleaned.indexOf(".")
  let intPart = firstDot >= 0 ? cleaned.slice(0, firstDot) : cleaned
  const decPart = firstDot >= 0 ? cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2) : null
  intPart = intPart.replace(/^0+(?=\d)/, "")
  const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  if (decPart !== null) return `${intWithCommas || "0"}.${decPart}`
  return intWithCommas
}

/** Strip commas to get the raw numeric value. */
export function parseAmount(formatted: string): number {
  const n = Number(String(formatted).replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

type AmountInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  value: string
  onValueChange: (formatted: string) => void
}

/**
 * Controlled amount input that live-formats with thousands commas. Store the
 * formatted string in state; call `parseAmount(value)` when submitting.
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput({ value, onValueChange, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onValueChange(formatAmount(e.target.value))}
        className={cn(className)}
        {...props}
      />
    )
  }
)
