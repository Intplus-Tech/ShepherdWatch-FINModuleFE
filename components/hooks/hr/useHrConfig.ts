import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { hrGet, hrPatch } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type { GlobalHrConfig } from "@/lib/hr/types"

/**
 * Organisation-wide HR settings.
 *
 * Reads are open to any authenticated user because branch screens display the
 * allocation they budget against; the write is director-only server-side.
 */
export function useHrConfig() {
  return useQuery({
    queryKey: hrKeys.config(),
    queryFn: () => hrGet<GlobalHrConfig>("/config"),
    // Settings change rarely and are read by several screens at once.
    staleTime: 5 * 60 * 1000,
  })
}

export type UpdateTrainingConfigInput = {
  annualAllocation?: number
  currency?: string
  branchAllocations?: { branchId: string; annualAllocation: number }[]
}

export function useUpdateTrainingConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateTrainingConfigInput) =>
      hrPatch<GlobalHrConfig>("/config/training", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.config() })
      // The budget overview is computed from this allocation.
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings() })
    },
  })
}
