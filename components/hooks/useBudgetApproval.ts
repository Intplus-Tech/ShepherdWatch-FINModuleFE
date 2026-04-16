import { useCallback, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type BudgetApprovalStatus = "approved" | "rejected" | "revision"

export function useBudgetApproval() {
  const { user } = useAuth()
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [approveSuccess, setApproveSuccess] = useState(false)

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const processApprovalAction = useCallback(async (id: string, status: BudgetApprovalStatus) => {
    if (!id || !user) {
      setApproveError("Missing budget ID or authorization.")
      return false
    }

    setApproving(true)
    setApproveError(null)
    setApproveSuccess(false)
    
    try {
      const response = await fetch(`/api/core/financial/budgets/${id}/approve`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      })
      
      const resData = await response.json().catch(() => null)
      
      if (!response.ok) {
        throw new Error(resData?.message || "Failed to update budget status.")
      }

      setApproveSuccess(true)
      return true
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "An error occurred while updating the status.")
      return false
    } finally {
      setApproving(false)
    }
  }, [user])

  return { approving, approveError, approveSuccess, processApprovalAction, setApproveError, setApproveSuccess }
}
