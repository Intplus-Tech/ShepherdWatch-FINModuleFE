import { useCallback, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export interface BudgetPayload {
  title?: string
  totalAmount?: number
  category?: "operational" | "capital" | "project"
  notes?: string
}

export function useBudgetUpdate() {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const updateBudget = useCallback(async (id: string, payload: BudgetPayload) => {
    if (!id || !user) {
      setError("Missing budget ID or authorization.")
      return false
    }

    setUpdating(true)
    setError(null)
    setSuccess(false)
    
    try {
      const response = await fetch(`/api/core/financial/budgets/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      
      const resData = await response.json().catch(() => null)
      
      if (!response.ok) {
        throw new Error(resData?.message || "Failed to update budget.")
      }

      setSuccess(true)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred updating the budget.")
      return false
    } finally {
      setUpdating(false)
    }
  }, [user])

  return { updating, error, success, updateBudget, setError, setSuccess }
}


