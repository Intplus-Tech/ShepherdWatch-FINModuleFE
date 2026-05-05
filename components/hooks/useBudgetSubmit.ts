import { API_V1 } from "@/lib/api";
import { useCallback, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export function useBudgetSubmit() {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const submitBudget = useCallback(async (id: string) => {
    if (!id || !user) {
      setSubmitError("Missing budget ID or authorization.")
      return false
    }

    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      const response = await fetch(`${API_V1}/financial/budgets/${id}/submit`, {
        method: "PATCH",
        headers: {
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
      })
      
      const resData = await response.json().catch(() => null)
      
      if (!response.ok) {
        throw new Error(resData?.message || "Failed to submit budget.")
      }

      setSubmitSuccess(true)
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred submitting the budget.")
      return false
    } finally {
      setSubmitting(false)
    }
  }, [user])

  return { submitting, submitError, submitSuccess, submitBudget, setSubmitError, setSubmitSuccess }
}


