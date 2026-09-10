import { API_V1 } from "@/lib/api";
import { useState, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

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
  // Callers pass `initialProps` as an inline object literal, so it is a new
  // reference every render. Read it from a ref instead of depending on it here:
  // as a `useCallback` dep it changed the callback identity on every render and
  // re-fired any effect listing the callback, looping requests forever.
  const initialPropsRef = useRef(initialProps)
  initialPropsRef.current = initialProps
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bankData, setBankData] = useState<BankBalancesData | null>(null)

  const fetchBankBalances = useCallback(
    async (props: UseBankBalancesProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialPropsRef.current, ...props }
        const branchId = mergedProps.branchId ?? user?.branchId
        const qs = new URLSearchParams()
        if (branchId) qs.set("branchId", branchId)

        const res = await fetch(`${API_V1}/dashboard/bank-balances?${qs.toString()}`)
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
    [user?.branchId]
  )

  return { loading, error, bankData, fetchBankBalances }
}
