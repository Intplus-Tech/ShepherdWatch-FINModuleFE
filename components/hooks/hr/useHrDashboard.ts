import { useQuery } from "@tanstack/react-query"

import { hrGet } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type {
  AccountantDashboard,
  AdminDashboard,
  DirectorOverview,
  PastorDashboard,
} from "@/lib/hr/types"

/**
 * Role-scoped HR dashboards.
 *
 * Each endpoint is role-gated on the backend (`authorizeRoles`) and derives its
 * branch from the caller's token, so none of these take a branchId.
 */

export function useAccountantHrDashboard() {
  return useQuery({
    queryKey: hrKeys.dashboard("accountant"),
    queryFn: () => hrGet<AccountantDashboard>("/dashboard/accountant"),
  })
}

export function useAdminHrDashboard() {
  return useQuery({
    queryKey: hrKeys.dashboard("admin"),
    queryFn: () => hrGet<AdminDashboard>("/dashboard/admin"),
  })
}

export function usePastorHrDashboard() {
  return useQuery({
    queryKey: hrKeys.dashboard("pastor"),
    queryFn: () => hrGet<PastorDashboard>("/dashboard/pastor"),
  })
}

export function useDirectorHrOverview() {
  return useQuery({
    queryKey: hrKeys.dashboard("director"),
    queryFn: () => hrGet<DirectorOverview>("/dashboard/director"),
  })
}
