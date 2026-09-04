"use client"

import { useMemo, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, Download, Search, Wallet } from "lucide-react"
import FinanceControllerShell from "@/components/finance-controller/FinanceControllerShell"
import { MY_TRANSACTIONS, type MyTransaction } from "@/components/finance-controller/finance-data"
import { downloadCsv, sectionsToCsv } from "@/lib/export-csv"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const TABS = ["All", "Credit", "Debit"] as const
type Tab = (typeof TABS)[number]

const STATUS_STYLES: Record<MyTransaction["status"], string> = {
  Posted: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Draft: "bg-slate-100 text-slate-600",
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("All")
  const [search, setSearch] = useState("")

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return MY_TRANSACTIONS.filter((row) => {
      if (tab === "Credit" && row.direction !== "credit") return false
      if (tab === "Debit" && row.direction !== "debit") return false
      if (!term) return true
      return (
        row.description.toLowerCase().includes(term) ||
        row.txnId.toLowerCase().includes(term) ||
        row.category.toLowerCase().includes(term)
      )
    })
  }, [search, tab])

  const credits = MY_TRANSACTIONS.filter((row) => row.direction === "credit").reduce(
    (sum, row) => sum + row.amount,
    0
  )
  const debits = MY_TRANSACTIONS.filter((row) => row.direction === "debit").reduce(
    (sum, row) => sum + row.amount,
    0
  )

  const handleExport = () => {
    const csv = sectionsToCsv([
      {
        title: "My Transactions",
        rows: rows.map((row) => ({
          Date: row.date,
          "Txn ID": row.txnId,
          Description: row.description,
          Account: row.account,
          Category: row.category,
          Direction: row.direction,
          Amount: row.amount,
          Status: row.status,
        })),
      },
    ])
    downloadCsv("my-transactions.csv", csv)
  }

  const stats = [
    {
      label: "Entries Recorded",
      value: String(MY_TRANSACTIONS.length),
      icon: Wallet,
      iconClass: "bg-[#EEF2FF] text-[#3B5BDB]",
      valueClass: "text-[#111827]",
    },
    {
      label: "Total Credits",
      value: formatCurrency(credits, { maximumFractionDigits: 0 }),
      icon: ArrowDownLeft,
      iconClass: "bg-emerald-100 text-emerald-600",
      valueClass: "text-emerald-600",
    },
    {
      label: "Total Debits",
      value: formatCurrency(debits, { maximumFractionDigits: 0 }),
      icon: ArrowUpRight,
      iconClass: "bg-rose-100 text-rose-600",
      valueClass: "text-rose-600",
    },
  ]

  return (
    <FinanceControllerShell
      activeHref="/finance-controller/transaction/my-transactions"
      topbarTitle="My Transactions"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight text-[#111827]">My Transactions</h1>
            <p className="mt-1.5 text-[13px] font-medium text-[#6B7280]">
              Entries you recorded or submitted for posting.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-[40px] shrink-0 items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-[#2f4cc2]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-start justify-between gap-4 rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"
              >
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    {stat.label}
                  </div>
                  <div className={cn("mt-2.5 text-[22px] font-extrabold leading-none", stat.valueClass)}>
                    {stat.value}
                  </div>
                </div>
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", stat.iconClass)}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-[8px] bg-[#F3F4F6] p-1">
              {TABS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTab(option)}
                  className={cn(
                    "rounded-[6px] px-4 py-1.5 text-[12.5px] font-semibold transition-colors",
                    tab === option ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280]"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-[320px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by description or amount..."
                className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#EEF1F6] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Transaction ID</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#F3F4F6] text-[13px] last:border-b-0">
                    <td className="px-5 py-4 text-[#4B5563]">{row.date}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-[4px] bg-[#EEF2FF] px-2 py-1 text-[11px] font-bold text-[#3B5BDB]">
                        {row.txnId}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#111827]">{row.description}</td>
                    <td className="px-5 py-4 text-[#6B7280]">{row.account}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563]">
                        {row.category}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-5 py-4 text-right font-bold",
                        row.direction === "credit" ? "text-emerald-600" : "text-[#111827]"
                      )}
                    >
                      {row.direction === "credit" ? "+" : "−"}
                      {formatCurrency(row.amount, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                          STATUS_STYLES[row.status]
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-[#9CA3AF]">
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#EEF1F6] px-5 py-4">
            <p className="text-[12px] font-medium text-[#6B7280]">
              Showing <span className="font-bold text-[#111827]">{rows.length}</span> of{" "}
              <span className="font-bold text-[#111827]">{MY_TRANSACTIONS.length}</span> entries
            </p>
          </div>
        </div>
      </div>
    </FinanceControllerShell>
  )
}
