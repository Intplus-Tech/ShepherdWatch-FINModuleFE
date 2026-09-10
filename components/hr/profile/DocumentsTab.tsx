"use client"

import { useMemo, useState } from "react"
import { Download, Eye, FileText, ShieldCheck, Trash2 } from "lucide-react"
import {
  SectionCard,
  CardHeading,
  StatCard,
  StatusBadge,
  Th,
  Td,
  btnDark,
} from "./shared"
import { HrTableState, hrErrorMessage } from "@/components/hr/HrDataState"
import {
  useEmployeeDocuments,
  useVerifyEmployeeDocument,
} from "@/components/hooks/hr/useHrDocuments"
import { EMPLOYEE_DOCUMENT_STATUS_LABELS, lookup, titleCase } from "@/lib/hr/normalize"
import { EMPLOYEE_DOCUMENT_TYPES, type EmployeeDocument } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const ALL = "All Documents"

function fileSize(bytes: number | undefined): string {
  if (!bytes) return "—"
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export default function DocumentsTab({
  employeeId,
  onUpload,
  onPreview,
  onDelete,
}: {
  employeeId: string | null
  onUpload: () => void
  onPreview: (document: EmployeeDocument) => void
  onDelete: (document: EmployeeDocument) => void
}) {
  const [selected, setSelected] = useState<string>(ALL)
  const [actionError, setActionError] = useState<string | null>(null)

  const documents = useEmployeeDocuments(employeeId)
  const verify = useVerifyEmployeeDocument()

  const items = useMemo(() => documents.data ?? [], [documents.data])

  /** Counts per document type, so the sidebar reflects what is actually stored. */
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const doc of items) {
      counts.set(doc.documentType, (counts.get(doc.documentType) ?? 0) + 1)
    }
    return EMPLOYEE_DOCUMENT_TYPES.map((type) => ({
      key: type,
      label: titleCase(type),
      count: counts.get(type) ?? 0,
    }))
  }, [items])

  const rows = useMemo(
    () => (selected === ALL ? items : items.filter((doc) => doc.documentType === selected)),
    [items, selected],
  )

  const pending = items.filter((doc) => doc.status === "pending").length

  // Captured once per mount so the render stays pure and stable.
  const [now] = useState(() => Date.now())
  const recent = items.filter((doc) => {
    if (!doc.createdAt) return false
    return now - new Date(doc.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
  }).length

  async function handleVerify(doc: EmployeeDocument) {
    setActionError(null)
    try {
      await verify.mutateAsync({ id: doc._id, employeeId: employeeId ?? undefined })
    } catch (error) {
      setActionError(hrErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Total Documents"
          value={documents.isLoading ? "—" : String(items.length)}
        />
        <StatCard
          label="Pending Verification"
          value={documents.isLoading ? "—" : String(pending)}
        />
        <StatCard
          label="Recent Uploads (30d)"
          value={documents.isLoading ? "—" : String(recent)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Categories */}
        <SectionCard className="lg:col-span-1">
          <CardHeading>Categories</CardHeading>
          <div className="mt-4 flex flex-col gap-1">
            <button
              onClick={() => setSelected(ALL)}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-left text-[13px]",
                selected === ALL
                  ? "bg-[#EEF2FF] font-semibold text-[#3B5BDB]"
                  : "text-[#4B5563] hover:bg-[#F8FAFC]",
              )}
            >
              {ALL}
              <span className="text-[12px] text-[#9CA3AF]">{items.length}</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelected(category.key)}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-left text-[13px]",
                  selected === category.key
                    ? "bg-[#EEF2FF] font-semibold text-[#3B5BDB]"
                    : "text-[#4B5563] hover:bg-[#F8FAFC]",
                )}
              >
                {category.label}
                <span className="text-[12px] text-[#9CA3AF]">{category.count}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Document list */}
        <SectionCard className="p-0 lg:col-span-3">
          <div className="flex items-center justify-between px-5 py-4">
            <CardHeading>Document Vault</CardHeading>
            <button className={btnDark} onClick={onUpload} disabled={!employeeId}>
              Upload Document
            </button>
          </div>

          {actionError && (
            <p className="border-t border-[#EEF1F6] px-5 py-3 text-[12px] font-medium text-red-600">
              {actionError}
            </p>
          )}

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
                <HrTableState
                  colSpan={6}
                  isLoading={documents.isLoading}
                  error={documents.error}
                  isEmpty={rows.length === 0}
                  emptyTitle="No documents"
                  emptyDescription="Upload contracts, KYC and certificates to the vault."
                  onRetry={() => documents.refetch()}
                />

                {!documents.isLoading &&
                  !documents.error &&
                  rows.map((doc) => (
                    <tr key={doc._id}>
                      <Td className="font-semibold text-[#111827]">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                          {doc.title}
                        </span>
                        {doc.expiryDate && (
                          <span className="mt-0.5 block text-[11px] font-normal text-[#9CA3AF]">
                            Expires {formatDate(doc.expiryDate, "medium")}
                          </span>
                        )}
                      </Td>
                      <Td className="text-[#4B5563]">{titleCase(doc.documentType)}</Td>
                      <Td className="text-[#4B5563]">{formatDate(doc.createdAt, "medium")}</Td>
                      <Td className="text-[#4B5563]">{fileSize(doc.fileSize)}</Td>
                      <Td>
                        <StatusBadge
                          status={lookup(
                            EMPLOYEE_DOCUMENT_STATUS_LABELS,
                            doc.status,
                          ).toUpperCase()}
                        />
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <button
                            aria-label="Preview"
                            onClick={() => onPreview(doc)}
                            className="hover:text-[#3B5BDB]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Download"
                            className="hover:text-[#3B5BDB]"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          {doc.status === "pending" && (
                            <button
                              aria-label="Verify"
                              onClick={() => handleVerify(doc)}
                              disabled={verify.isPending}
                              className="hover:text-emerald-600 disabled:opacity-50"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            aria-label="Delete"
                            onClick={() => onDelete(doc)}
                            disabled={doc.isLocked}
                            className="hover:text-rose-600 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
