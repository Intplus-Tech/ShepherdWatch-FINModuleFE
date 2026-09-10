"use client"

import { useMemo } from "react"

import { useAuth } from "@/components/auth/AuthProvider"

/**
 * The signed-in user's branch id.
 *
 * Most HR reads infer the branch from the bearer token server-side, but the
 * write endpoints validate an explicit `branchId` in the body (and payroll
 * wants it in the query), so forms need it locally. `branchId` can arrive as a
 * populated object on some session shapes, hence the narrowing.
 */
export function useBranchId(): string {
  const { user } = useAuth()

  return useMemo(() => {
    const raw = (user as { branchId?: unknown } | null)?.branchId
    if (typeof raw === "string") return raw
    if (raw && typeof raw === "object") {
      const record = raw as { _id?: string; id?: string }
      return record._id ?? record.id ?? ""
    }
    return ""
  }, [user])
}
