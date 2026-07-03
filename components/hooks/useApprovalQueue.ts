import { API_V1 } from "@/lib/api";
import { useState, useCallback } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export interface ApprovalQueueStatus {
  count: number
  totalAmount: number
}

export interface ApprovalQueueData {
  totalPending: number
  totalAmount: number
  byStatus?: {
    pending_pastor?: ApprovalQueueStatus
    pending_director?: ApprovalQueueStatus
  }
}

interface UseApprovalQueueProps {
  branchId?: string
}

export function useApprovalQueue(initialProps?: UseApprovalQueueProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queueData, setQueueData] = useState<ApprovalQueueData | null>(null)

  const fetchQueue = useCallback(
    async (props: UseApprovalQueueProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
        const branchId = mergedProps.branchId ?? user?.branchId
        const qs = new URLSearchParams()
        if (branchId) qs.set("branchId", branchId)

        const res = await fetch(`${API_V1}/dashboard/approval-queue?${qs.toString()}`)
        const payload = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(payload?.message || "Failed to fetch approval queue data")
        }
        
        setQueueData(payload?.data || null)
        return payload?.data as ApprovalQueueData
      } catch (err: any) {
        setError(err.message || "An error occurred fetching approval queue data")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [initialProps, user?.branchId]
  )

  return { loading, error, queueData, fetchQueue }
}
