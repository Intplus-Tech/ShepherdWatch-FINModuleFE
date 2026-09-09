"use client"

import { useMemo, useState } from "react"
import { Plus, Eye, Download, Trash2, ShieldCheck } from "lucide-react"
import {
  SectionCard,
  CardHeading,
  StatCard,
  StatusBadge,
  Th,
  Td,
  btnDark,
} from "./shared"
import { cn } from "@/lib/utils"
import { useHrDocuments, useDocumentMutations } from "@/components/hooks/useHrDocuments"
import { useToast } from "@/components/ui/toast"
import { DOCUMENT_TYPE_LABELS, formatDate, statusLabel } from "@/lib/hr/display"
import type { HrDocument } from "@/lib/hr/types"

/** Vault categories map onto the API's documentType enum. */
const CATEGORIES = [
  { label: "All Documents", value: "" },
  { label: "Employment Contracts", value: "contract" },
  { label: "Identification & KYC", value: "id_proof" },
  { label: "Educational Certificates", value: "academic_credential" },
  { label: "Professional Certifications", value: "certification" },
  { label: "Medical Clearance", value: "medical_clearance" },
  { label: "Background Checks", value: "background_check" },
  { label: "Miscellaneous", value: "other" },
]

function fileSize(bytes: number): string {
  if (!bytes) return "—"
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(Math.round(bytes / 1024), 1)} KB`
}

export default function DocumentsTab({
  employeeId,
  onUpload,
  onPreview,
  onDelete,
}: {
  employeeId: string
  onUpload: () => void
  onPreview: (document: HrDocument) => void
  onDelete: (document: HrDocument) => void
}) {
  const [selected, setSelected] = useState("")
  const { pushToast } = useToast()
  const { documents, loading, error, refresh } = useHrDocuments(employeeId)
  const { verifyDocument } = useDocumentMutations()
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      selected
        ? documents.filter((document) => String(document.documentType) === selected)
        : documents,
    [documents, selected]
  )

  const counts = useMemo(() => {
    const totals = new Map<string, number>()
    for (const document of documents) {
      const key = String(document.documentType)
      totals.set(key, (totals.get(key) ?? 0) + 1)
    }
    return totals
  }, [documents])

  const pendingCount = documents.filter(
    (document) => document.verificationStatus === "pending"
  ).length

  const recentCount = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    return documents.filter((document) => {
      const filed = new Date(document.createdAt).getTime()
      return Number.isFinite(filed) && filed >= cutoff
    }).length
  }, [documents])

  const handleVerify = async (document: HrDocument) => {
    setVerifyingId(document.id)
    try {
      await verifyDocument(document.id)
      pushToast(`${document.title} verified`, "success")
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to verify this document", "error")
    } finally {
      setVerifyingId(null)
    }
  }

  const openFile = (document: HrDocument) => {
    if (!document.fileUrl) {
      pushToast("This document has no file attached", "info")
      return
    }
    window.open(document.fileUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total Documents" value={String(documents.length)} />
        <StatCard label="Pending Verification" value={String(pendingCount)} />
        <StatCard label="Recent Uploads (30d)" value={String(recentCount)} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Categories */}
        <SectionCard className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <CardHeading>Categories</CardHeading>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            {CATEGORIES.map((category) => {
              const active = selected === category.value
              const count = category.value
                ? counts.get(category.value) ?? 0
                : documents.length
              return (
                <button
                  key={category.label}
                  onClick={() => setSelected(category.value)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium",
                    active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-[#F8FAFC]"
                  )}
                >
                  <span>{category.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      active ? "bg-[#3B5BDB] text-white" : "bg-[#F1F5F9] text-[#6B7280]"
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </SectionCard>

        {/* Document list */}
        <SectionCard className="p-0 lg:col-span-3">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#6B7280]">
                Showing {rows.length} of {documents.length} documents
              </span>
            </div>
            <button className={btnDark} onClick={onUpload}>
              <Plus className="h-4 w-4" />
              Upload New Document
            </button>
          </div>
          <div className="overflow-x-auto border-t border-[#EEF1F6]">
            <table className="w-full">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <Th>Document Name</Th>
                  <Th>Type</Th>
                  <Th>Uploaded</Th>
                  <Th>Size</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {rows.map((document) => (
                  <tr key={document.id}>
                    <Td>
                      <div className="font-semibold text-[#111827]">{document.title}</div>
                      {document.flagReason ? (
                        <div className="text-[12px] text-rose-600">{document.flagReason}</div>
                      ) : null}
                    </Td>
                    <Td className="text-[#4B5563]">
                      {statusLabel(DOCUMENT_TYPE_LABELS, document.documentType)}
                    </Td>
                    <Td className="text-[#4B5563]">{formatDate(document.createdAt)}</Td>
                    <Td className="text-[#4B5563]">{fileSize(document.fileSize)}</Td>
                    <Td>
                      <StatusBadge status={String(document.verificationStatus).toUpperCase()} />
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2 text-[#9CA3AF]">
                        <button
                          aria-label="Preview"
                          onClick={() => onPreview(document)}
                          className="hover:text-[#3B5BDB]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          aria-label="Download"
                          onClick={() => openFile(document)}
                          className="hover:text-[#3B5BDB]"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {document.verificationStatus !== "verified" ? (
                          <button
                            aria-label="Verify"
                            disabled={verifyingId === document.id}
                            onClick={() => handleVerify(document)}
                            className="hover:text-emerald-600 disabled:opacity-40"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button
                          aria-label="Delete"
                          onClick={() => onDelete(document)}
                          className="hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}

                {!loading && rows.length === 0 ? (
                  <tr>
                    <Td className="text-[#9CA3AF]">
                      {error || "No documents filed in this category."}
                    </Td>
                    <Td> </Td>
                    <Td> </Td>
                    <Td> </Td>
                    <Td> </Td>
                    <Td> </Td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
