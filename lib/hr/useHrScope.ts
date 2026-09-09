"use client"

import { useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

/**
 * Branch scoping for the HR screens. Branch-level roles send their own
 * `branchId` on every HR call; director and super admin leave it off so the
 * backend returns the consolidated, all-branch view.
 */
const GLOBAL_ROLES = new Set(["super_admin", "director", "regional_director", "executive_director", "hr"])

export function useHrScope(overrideBranchId?: string) {
  const { user } = useAuth()

  return useMemo(() => {
    const role = String(user?.role ?? "").toLowerCase()
    const isGlobal = GLOBAL_ROLES.has(role)
    const ownBranchId = String(user?.branchId ?? user?.branch?.id ?? "")
    const branchId = overrideBranchId ?? (isGlobal ? "" : ownBranchId)

    return {
      role,
      isGlobal,
      /** "" when the caller should see every branch. */
      branchId,
      ownBranchId,
      branchName: String(user?.branch?.name ?? ""),
      userId: String(user?.id ?? ""),
    }
  }, [overrideBranchId, user])
}
