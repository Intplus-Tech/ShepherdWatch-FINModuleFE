"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Shared currency switcher. Lets a user toggle the active display currency.
 * Available everywhere (all roles) so the currency can be changed at any time.
 */
export const CURRENCIES = ["NGN", "USD", "EUR", "GBP", "CAD"] as const
export type CurrencyCode = (typeof CURRENCIES)[number]

export default function CurrencySwitcher({
  className,
  defaultCurrency = "NGN",
  onChange,
}: {
  className?: string
  defaultCurrency?: CurrencyCode
  onChange?: (currency: CurrencyCode) => void
}) {
  const [active, setActive] = useState<CurrencyCode>(defaultCurrency)

  return (
    <div
      className={cn(
        "flex items-center rounded-md border border-[#E5E7EB] bg-white p-0.5 shadow-sm",
        className
      )}
    >
      {CURRENCIES.map((currency) => (
        <button
          key={currency}
          type="button"
          onClick={() => {
            setActive(currency)
            onChange?.(currency)
          }}
          className={cn(
            "rounded px-2.5 py-1.5 text-[11px] font-bold transition-colors",
            active === currency
              ? "bg-[#3B5BDB] text-white"
              : "text-[#9CA3AF] hover:text-[#4B5563]"
          )}
        >
          {currency}
        </button>
      ))}
    </div>
  )
}
