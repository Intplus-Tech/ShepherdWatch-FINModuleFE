"use client"

import { API_V1 } from "@/lib/api";
import { useEffect, useRef, useState } from "react"
import { Building, Check, ChevronDown, Globe, Loader2 } from "lucide-react"

export type BranchOption = {
  _id: string
  name: string
  branchType?: string
  status?: string
}

export default function BranchesDropdown({
  value = "",
  label,
  onChange,
  includeAllOption = true,
  className = "",
}: {
  value?: string
  label?: string
  onChange?: (branchId: string, branchName: string) => void
  includeAllOption?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [branches, setBranches] = useState<BranchOption[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const fetchBranches = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_V1}/branches?page=1&limit=100`, { credentials: "include" })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load branches")
      }
      const rows = Array.isArray(data) ? data
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.data?.data) ? data.data.data
        : Array.isArray(data?.data?.content) ? data.data.content
        : Array.isArray(data?.data?.items) ? data.data.items
        : Array.isArray(data?.content) ? data.content
        : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.branches) ? data.branches
        : [];
      setBranches(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load branches")
    } finally {
      setLoading(false)
    }
  }

  // Preload on mount so options are ready immediately
  useEffect(() => {
    void fetchBranches()
  }, [])

  const handleToggle = () => {
    setOpen((prev) => !prev)
  }

  const selectedBranch = branches.find((b) => b._id === value)
  const displayLabel = label ?? (value ? selectedBranch?.name ?? "Selected Branch" : "All Branches (Consolidated)")

  const handleSelect = (branchId: string, branchName: string) => {
    if (onChange) {
      onChange(branchId, branchName)
    }
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors"
      >
        {value ? (
          <Building className="h-4 w-4 text-[#3B5BDB]" />
        ) : (
          <Globe className="h-4 w-4 text-[#3B5BDB]" />
        )}
        <span className="max-w-[160px] truncate text-[#111827] font-semibold">{displayLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#6B7280] ml-1 transition-transform ${open ? "rotate-180 text-[#3B5BDB]" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 sm:right-0 sm:left-auto z-50 mt-2 w-[280px] rounded-[10px] border border-[#EEF1F6] bg-white shadow-xl p-2 animate-in fade-in-50 zoom-in-95">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] border-b border-[#F1F5F9] mb-1">
            Select Branch View
          </div>
          {includeAllOption && (
            <button
              type="button"
              onClick={() => handleSelect("", "All Branches (Consolidated)")}
              className={`flex w-full items-center justify-between gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] transition-colors ${
                !value ? "bg-[#EEF2FF] text-[#3B5BDB] font-bold" : "text-[#374151] hover:bg-[#F8FAFC]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#3B5BDB]" />
                <div>
                  <div>All Branches</div>
                  <div className="text-[10px] text-[#6B7280] font-normal">Consolidated Overview</div>
                </div>
              </div>
              {!value && <Check className="h-4 w-4 text-[#3B5BDB]" />}
            </button>
          )}

          {loading && branches.length === 0 ? (
            <div className="flex items-center gap-2 py-3 px-3 text-[12px] text-[#6B7280]">
              <Loader2 className="h-4 w-4 animate-spin text-[#3B5BDB]" /> Loading branches...
            </div>
          ) : error && branches.length === 0 ? (
            <div className="py-2 px-3 text-[12px] text-rose-600">{error}</div>
          ) : branches.length === 0 ? (
            <div className="py-2 px-3 text-[12px] text-[#6B7280]">No branches found.</div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto mt-1 space-y-0.5">
              {branches.map((branch) => {
                const isSelected = value === branch._id
                return (
                  <button
                    type="button"
                    key={branch._id}
                    onClick={() => handleSelect(branch._id, branch.name)}
                    className={`flex w-full items-center justify-between gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] transition-colors ${
                      isSelected ? "bg-[#EEF2FF] text-[#3B5BDB] font-bold" : "text-[#374151] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building className={`h-4 w-4 shrink-0 ${isSelected ? "text-[#3B5BDB]" : "text-[#9CA3AF]"}`} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{branch.name}</div>
                        <div className="text-[10px] text-[#9CA3AF] font-normal truncate">
                          {branch.branchType ?? "Branch"} • {branch.status ?? "active"}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-[#3B5BDB]" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

