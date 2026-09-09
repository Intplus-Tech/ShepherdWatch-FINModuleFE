"use client"

import { useCallback } from "react"
import { hrDelete, hrGet, hrPost, payloadData, payloadList } from "@/lib/hr/client"
import { mapDocument } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import type { HrDocument } from "@/lib/hr/types"

export function useHrDocuments(
  employeeId: string,
  filters: { documentType?: string; verificationStatus?: string } = {}
) {
  const documentType = filters.documentType ?? ""
  const verificationStatus = filters.verificationStatus ?? ""

  const result = useHrQuery<HrDocument[]>(
    employeeId
      ? async () => {
          const payload = await hrGet(`/documents/employee/${employeeId}`, {
            documentType,
            verificationStatus,
          })
          return payloadList(payload).map(mapDocument).filter((document) => document.id)
        }
      : null,
    [employeeId, documentType, verificationStatus],
    []
  )

  return { documents: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export type UploadDocumentInput = {
  employeeId: string
  documentType: string
  title: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  effectiveDate?: string
  expiryDate?: string
}

export function useDocumentMutations() {
  const uploadDocument = useCallback(
    async (input: UploadDocumentInput) => mapDocument(payloadData(await hrPost("/documents", input))),
    []
  )

  const verifyDocument = useCallback(
    async (id: string) => mapDocument(payloadData(await hrPost(`/documents/${id}/verify`))),
    []
  )

  const flagDocument = useCallback(
    async (id: string, flagReason: string) =>
      mapDocument(payloadData(await hrPost(`/documents/${id}/flag`, { flagReason }))),
    []
  )

  const deleteDocument = useCallback(async (id: string) => {
    await hrDelete(`/documents/${id}`)
  }, [])

  return { uploadDocument, verifyDocument, flagDocument, deleteDocument }
}
