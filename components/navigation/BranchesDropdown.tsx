"use client"

import { API_V1 } from "@/lib/api";

import { useEffect, useRef, useState } from "react"
import { Building, ChevronDown, Loader2 } from "lucide-react"

type Branch = {
  _id: string
  name: string
  branchType?: string
  status?: string
}

export default function BranchesDropdown({
  label = "All Branches",
  className = "",
}: {
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
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
      const res = await fetch(`${API_V1}/branches?page=1&limit=20`, { credentials: "include" })
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

  const handleToggle = async () => {
    const next = !open
    setOpen(next)
    if (next && branches.length === 0 && !loading) {
      await fetchBranches()
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
      >
        <Building className="h-4 w-4 text-[#6B7280]" />
        {label}
        <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-[260px] rounded-[10px] border border-[#E5E7EB] bg-white shadow-lg p-3">
          {loading ? (
            <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading branches...
            </div>
          ) : error ? (
            <div className="text-[12px] text-rose-600">{error}</div>
          ) : branches.length === 0 ? (
            <div className="text-[12px] text-[#6B7280]">No branches found.</div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto">
              {branches.map((branch) => (
                <div
                  key={branch._id}
                  className="flex flex-col gap-0.5 rounded-[8px] px-2 py-2 hover:bg-[#F8FAFC]"
                >
                  <div className="text-[12px] font-[700] text-[#111827]">{branch.name}</div>
                  <div className="text-[11px] text-[#9CA3AF]">
                    {branch.branchType ?? "branch"} • {branch.status ?? "unknown"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
