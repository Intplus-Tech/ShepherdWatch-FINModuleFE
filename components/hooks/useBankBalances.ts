import { useState, useCallback } from "react"

export interface BankAccount {
  accountName: string
  bankName: string
  accountNumber: string
  currency: string
  lastClosingBalance: number
  branchId?: {
    _id: string
    name: string
  }
}

export interface BankBalancesData {
  totalBalance: number
  accountCount: number
  accounts: BankAccount[]
}

interface UseBankBalancesProps {
  branchId?: string
}

export function useBankBalances(initialProps?: UseBankBalancesProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bankData, setBankData] = useState<BankBalancesData | null>(null)

  const fetchBankBalances = useCallback(
    async (props: UseBankBalancesProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
        const qs = new URLSearchParams()
        if (mergedProps.branchId) qs.set("branchId", mergedProps.branchId)

        const res = await fetch(`/api/core/dashboard/bank-balances?${qs.toString()}`)
        const payload = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(payload?.message || "Failed to fetch bank balances")
        }
        
        setBankData(payload?.data || null)
        return payload?.data as BankBalancesData
      } catch (err: any) {
        setError(err.message || "An error occurred fetching bank balances")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [initialProps]
  )

  return { loading, error, bankData, fetchBankBalances }
}
