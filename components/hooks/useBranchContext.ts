"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { API_V1 } from "@/lib/api"
import { useAuth } from "@/components/auth/AuthProvider"

export type BranchOption = { id: string; name: string }

/** A reference field as the API sends it: a bare id or a populated object. */
function idOf(value: unknown): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const rec = value as Record<string, unknown>
    return String(rec._id ?? rec.id ?? "")
  }
  return ""
}

/**
 * The branch a screen should act on.
 *
 * The session only carries a branch id when the backend put one on the user
 * record or in the access token, and for several roles it does neither — which
 * used to leave screens stuck on "Branch context is required". So when the
 * session has nothing, fall back to the branches the signed-in user can see:
 * a single branch is selected outright, and several are offered as a picker.
 */
export function useBranchContext() {
  const { user } = useAuth()
  const sessionBranchId = useMemo(
    () => idOf(user?.branchId ?? user?.branch?.id ?? user?.tenantId ?? user?.tenant?.id ?? "").trim(),
    [user]
  )
  const userId = String(user?.id ?? "")

  const [branches, setBranches] = useState<BranchOption[]>([])
  const [chosenBranchId, setChosenBranchId] = useState("")
  const [loading, setLoading] = useState(!sessionBranchId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadBranches = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_V1}/branches?page=1&limit=100`, { credentials: "include" })
        const payload = await response.json().catch(() => null)
        if (!response.ok) throw new Error(payload?.message ?? "Unable to load branches.")

        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.data)
              ? payload.data.data
              : Array.isArray(payload?.data?.content)
                ? payload.data.content
                : Array.isArray(payload?.data?.items)
                  ? payload.data.items
                  : Array.isArray(payload?.items)
                    ? payload.items
                    : []

        const toOption = (item: Record<string, unknown>): BranchOption => ({
          id: String(item?.id ?? item?._id ?? ""),
          name: String(item?.name ?? item?.branchName ?? item?.title ?? "Untitled branch"),
        })
        const all: BranchOption[] = list.map(toOption).filter((option: BranchOption) => option.id)

        // The branch record says who its accountant and lead pastor are. When
        // the session carries no branch, that is how this user's branch is found.
        const assigned: BranchOption[] = userId
          ? list
              .filter((item: Record<string, unknown>) =>
                [item?.assignedAccountantId, item?.leadPastorId, item?.accountantId, item?.pastorId, item?.adminId]
                  .map(idOf)
                  .includes(userId)
              )
              .map(toOption)
              .filter((option: BranchOption) => option.id)
          : []

        if (!active) return
        const options = assigned.length > 0 ? assigned : all
        setBranches(options)
        setChosenBranchId((prev) => prev || sessionBranchId || (options.length === 1 ? options[0].id : ""))
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load branches.")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBranches()
    return () => {
      active = false
    }
  }, [sessionBranchId, userId])

  const branchId = chosenBranchId || sessionBranchId
  const selectBranch = useCallback((id: string) => setChosenBranchId(id), [])

  return {
    branchId,
    branches,
    /** True when the user has to pick before the screen can act. */
    needsSelection: !branchId && branches.length > 1,
    loading,
    error,
    selectBranch,
  }
}
