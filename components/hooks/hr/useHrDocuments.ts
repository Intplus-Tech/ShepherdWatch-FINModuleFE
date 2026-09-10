import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fieldOf, hrDelete, hrGet, hrPost } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type { EmployeeDocument, EmployeeDocumentType } from "@/lib/hr/types"

/** Personnel document vault for one employee. */
export function useEmployeeDocuments(employeeId: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.documentsByEmployee(employeeId ?? ""),
    queryFn: () => hrGet<EmployeeDocument[]>(`/documents/employee/${employeeId}`),
    enabled: Boolean(employeeId),
  })
}

function useDocumentMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (_data, variables) => {
      const employeeId = fieldOf(variables, "employeeId")
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: hrKeys.documentsByEmployee(employeeId) })
      }
      queryClient.invalidateQueries({ queryKey: hrKeys.documents() })
      // Uploads and verifications move the profile integrity score.
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() })
    },
  })
}

export type UploadDocumentInput = {
  employeeId: string
  documentType: EmployeeDocumentType
  title: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  effectiveDate?: string
  expiryDate?: string
}

/**
 * Register an already-uploaded file against an employee.
 *
 * The backend takes a URL, not bytes — push the file through the existing
 * upload flow (`useFileUpload`) first and pass the resulting `fileUrl` here.
 */
export function useUploadEmployeeDocument() {
  return useDocumentMutation((input: UploadDocumentInput) =>
    hrPost<EmployeeDocument>("/documents", input),
  )
}

export function useVerifyEmployeeDocument() {
  return useDocumentMutation(({ id }: { id: string; employeeId?: string }) =>
    hrPost<EmployeeDocument>(`/documents/${id}/verify`),
  )
}

export function useFlagEmployeeDocument() {
  return useDocumentMutation(
    ({ id, flagReason }: { id: string; flagReason: string; employeeId?: string }) =>
      hrPost<EmployeeDocument>(`/documents/${id}/flag`, { flagReason }),
  )
}

export function useDeleteEmployeeDocument() {
  return useDocumentMutation(({ id }: { id: string; employeeId?: string }) =>
    hrDelete<{ _id: string }>(`/documents/${id}`),
  )
}
