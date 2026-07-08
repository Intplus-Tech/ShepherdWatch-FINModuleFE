"use client"

import { useState } from "react"
import { Plus, Eye, Download, Trash2 } from "lucide-react"
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

const CATEGORIES = [
  { label: "All Documents", count: 12 },
  { label: "Employment Contracts", count: 3 },
  { label: "Identification & KYC", count: 2 },
  { label: "Educational Certificates", count: 4 },
  { label: "Professional Certifications", count: 2 },
  { label: "Miscellaneous", count: 1 },
]

type DocRow = {
  name: string
  meta: string
  type: string
  uploaded: string
  size: string
  status: string
  category: string
}

const DOCUMENTS: DocRow[] = [
  {
    name: "Employment Contract 2020.pdf",
    meta: "Version 1.0",
    type: "Contract",
    uploaded: "Jan 02, 2020",
    size: "1.2 MB",
    status: "VERIFIED",
    category: "Employment Contracts",
  },
  {
    name: "M.Sc Certificate - UNILAG.pdf",
    meta: "Masters Level",
    type: "Educational",
    uploaded: "Jan 15, 2020",
    size: "4.5 MB",
    status: "VERIFIED",
    category: "Educational Certificates",
  },
  {
    name: "ID Card - National ID.jpg",
    meta: "NIN-55621",
    type: "KYC",
    uploaded: "Jan 20, 2020",
    size: "0.8 MB",
    status: "VERIFIED",
    category: "Identification & KYC",
  },
  {
    name: "CIPM Membership Cert.pdf",
    meta: "",
    type: "Professional",
    uploaded: "Feb 01, 2020",
    size: "1.1 MB",
    status: "VERIFIED",
    category: "Professional Certifications",
  },
  {
    name: "Annual Appraisal - 2023.pdf",
    meta: "Performance Track",
    type: "Performance",
    uploaded: "Jan 10, 2024",
    size: "2.0 MB",
    status: "VERIFIED",
    category: "Miscellaneous",
  },
]

export default function DocumentsTab({
  onUpload,
  onPreview,
  onDelete,
}: {
  onUpload: () => void
  onPreview: () => void
  onDelete: () => void
}) {
  const [selected, setSelected] = useState("All Documents")

  const rows =
    selected === "All Documents"
      ? DOCUMENTS
      : DOCUMENTS.filter((d) => d.category === selected)

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total Documents" value="12" />
        <StatCard label="Pending Verification" value="2" />
        <StatCard label="Recent Uploads (30d)" value="4" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Categories */}
        <SectionCard className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <CardHeading>Categories</CardHeading>
            <button
              aria-label="Add category"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8FAFC]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            {CATEGORIES.map((c) => {
              const active = selected === c.label
              return (
                <button
                  key={c.label}
                  onClick={() => setSelected(c.label)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium",
                    active
                      ? "bg-[#EEF2FF] text-[#3B5BDB]"
                      : "text-[#4B5563] hover:bg-[#F8FAFC]"
                  )}
                >
                  <span>{c.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      active
                        ? "bg-[#3B5BDB] text-white"
                        : "bg-[#F1F5F9] text-[#6B7280]"
                    )}
                  >
                    {c.count}
                  </span>
                </button>
              )
            })}
          </div>
        </SectionCard>

        {/* Documents table */}
        <SectionCard className="p-0 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3">
              <select className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4B5563]">
                <option>All Types</option>
                <option>Contract</option>
                <option>Educational</option>
                <option>KYC</option>
                <option>Professional</option>
                <option>Performance</option>
              </select>
              <span className="text-[12px] text-[#6B7280]">
                Showing {rows.length} of 12 documents
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
                {rows.map((d) => (
                  <tr key={d.name}>
                    <Td>
                      <div className="font-semibold text-[#111827]">
                        {d.name}
                      </div>
                      {d.meta ? (
                        <div className="text-[12px] text-[#9CA3AF]">
                          {d.meta}
                        </div>
                      ) : null}
                    </Td>
                    <Td className="text-[#4B5563]">{d.type}</Td>
                    <Td className="text-[#4B5563]">{d.uploaded}</Td>
                    <Td className="text-[#4B5563]">{d.size}</Td>
                    <Td>
                      <StatusBadge status={d.status} />
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2 text-[#9CA3AF]">
                        <button
                          aria-label="Preview"
                          onClick={onPreview}
                          className="hover:text-[#3B5BDB]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          aria-label="Download"
                          className="hover:text-[#3B5BDB]"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          aria-label="Delete"
                          onClick={onDelete}
                          className="hover:text-rose-600"
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
          <div className="flex items-center justify-between border-t border-[#EEF1F6] px-5 py-3">
            <span className="text-[12px] text-[#6B7280]">Page 1 of 3</span>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]">
                Previous
              </button>
              <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]">
                Next
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
