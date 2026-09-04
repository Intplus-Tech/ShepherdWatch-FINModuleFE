"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Database, Download, Search } from "lucide-react"
import FinanceControllerShell from "@/components/finance-controller/FinanceControllerShell"
import {
  GLOBAL_TRANSACTIONS,
  TOTAL_CREDITS_YTD,
  TOTAL_DEBITS_YTD,
  TOTAL_GLOBAL_RECORDS,
  TRANSACTION_BRANCHES,
  TRANSACTION_CATEGORIES,
} from "@/components/finance-controller/finance-data"
import { downloadCsv, sectionsToCsv } from "@/lib/export-csv"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const MONTHS = ["Oct 2024", "Sep 2024", "Aug 2024", "Jul 2024"]
const PAGE_SIZE = 5

export default function Page() {
  const [search, setSearch] = useState("")
  const [branch, setBranch] = useState("All Branches")
  const [category, setCategory] = useState("All Categories")
  const [month, setMonth] = useState(MONTHS[0])
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return GLOBAL_TRANSACTIONS.filter((row) => {
      if (branch !== "All Branches" && row.branch !== branch) return false
      if (category !== "All Categories" && row.category !== category) return false
      if (!term) return true
      return (
        row.description.toLowerCase().includes(term) ||
        row.txnId.toLowerCase().includes(term) ||
        row.branch.toLowerCase().includes(term)
      )
    })
  }, [branch, category, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const handleExport = () => {
    const csv = sectionsToCsv([
      {
        title: `Global Transactions — ${month}`,
        rows: filtered.map((row) => ({
          Date: row.date,
          "Txn ID": row.txnId,
          Branch: row.branch,
          Description: row.description,
          Category: row.category,
          "Debit (N)": row.debit || "",
          "Credit (N)": row.credit || "",
        })),
      },
    ])
    downloadCsv(`global-transactions_${month.replace(/\s+/g, "-").toLowerCase()}.csv`, csv)
  }

  const selectCls =
    "h-[38px] appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-3.5 pr-9 text-[12.5px] font-semibold text-[#4B5563] outline-none focus:border-[#2563EB]"

  return (
    <FinanceControllerShell
      activeHref="/finance-controller/transaction/global-transactions"
      topbarTitle="Global Transactions"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Hero */}
        <div className="rounded-[14px] border border-[#E0E7FF] bg-[#F5F7FF] p-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-[36px] font-extrabold leading-[1.1] text-[#111827]">
                Global
                <br />
                Transactions
              </h1>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5563] shadow-sm">
                <Database className="h-3.5 w-3.5 text-[#3B5BDB]" />
                {formatNumber(TOTAL_GLOBAL_RECORDS, { maximumFractionDigits: 0 })} Total Records
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[12px] bg-white p-5 shadow-sm">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                  Total Debits (YTD)
                </div>
                <div className="mt-2 text-[22px] font-extrabold leading-none text-rose-600">
                  <span className="mr-1 text-[14px] font-bold text-[#9CA3AF]">₦</span>
                  {formatNumber(TOTAL_DEBITS_YTD, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="rounded-[12px] bg-white p-5 shadow-sm">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                  Total Credits (YTD)
                </div>
                <div className="mt-2 text-[22px] font-extrabold leading-none text-emerald-600">
                  <span className="mr-1 text-[14px] font-bold text-[#9CA3AF]">₦</span>
                  {formatNumber(TOTAL_CREDITS_YTD, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[300px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search Payee or ID..."
                className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={branch}
                  onChange={(event) => {
                    setBranch(event.target.value)
                    setPage(1)
                  }}
                  aria-label="Filter by branch"
                  className={selectCls}
                >
                  {TRANSACTION_BRANCHES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>

              <div className="relative">
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value)
                    setPage(1)
                  }}
                  aria-label="Filter by category"
                  className={selectCls}
                >
                  {TRANSACTION_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <select
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  aria-label="Filter by month"
                  className={cn(selectCls, "pl-9")}
                >
                  {MONTHS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>

              <button
                type="button"
                onClick={handleExport}
                className="inline-flex h-[38px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12.5px] font-semibold text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#EEF1F6] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Txn ID</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Debit (₦)</th>
                  <th className="px-5 py-3 text-right">Credit (₦)</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn("text-[13px]", index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white")}
                  >
                    <td className="px-5 py-4 font-medium text-[#9CA3AF]">{pageStart + index + 1}</td>
                    <td className="px-5 py-4 text-[#4B5563]">{row.date}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-[4px] bg-[#EEF2FF] px-2 py-1 text-[11px] font-bold text-[#3B5BDB]">
                        {row.txnId}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#111827]">{row.branch}</td>
                    <td className="px-5 py-4 text-[#4B5563]">{row.description}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563]">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-[#111827]">
                      {row.debit ? formatNumber(row.debit, { maximumFractionDigits: 0 }) : "-"}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-emerald-600">
                      {row.credit ? formatNumber(row.credit, { maximumFractionDigits: 0 }) : "-"}
                    </td>
                  </tr>
                ))}

                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-[13px] text-[#9CA3AF]">
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#EEF1F6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] font-medium text-[#6B7280]">
              Showing{" "}
              <span className="font-bold text-[#111827]">
                {filtered.length === 0 ? 0 : pageStart + 1} to {pageStart + visible.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#111827]">
                {formatNumber(TOTAL_GLOBAL_RECORDS, { maximumFractionDigits: 0 })}
              </span>{" "}
              results
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#4B5563] disabled:opacity-40 hover:bg-[#F8FAFC]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[1, 2, 3].map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(Math.min(pageNumber, totalPages))}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-semibold",
                    currentPage === pageNumber
                      ? "bg-[#111827] text-white"
                      : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"
                  )}
                >
                  {pageNumber}
                </button>
              ))}
              <span className="px-1 text-[12px] text-[#9CA3AF]">…</span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
              >
                50
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#4B5563] disabled:opacity-40 hover:bg-[#F8FAFC]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </FinanceControllerShell>
  )
}
