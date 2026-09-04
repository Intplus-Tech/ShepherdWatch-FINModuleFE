"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronDown, Church, Download, Globe, Printer, TrendingUp } from "lucide-react"
import FinanceControllerShell from "@/components/finance-controller/FinanceControllerShell"
import { CONSOLIDATED_REPORT } from "@/components/finance-controller/finance-data"
import { ATTENDANCE_REGIONS } from "@/components/attendance/attendance-data"
import { downloadCsv, sectionsToCsv } from "@/lib/export-csv"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const PERIODS = ["Weekly", "Monthly", "Quarterly", "Annual"] as const
type Period = (typeof PERIODS)[number]

const MONTHS = ["October 2024", "September 2024", "August 2024", "July 2024"]

export default function Page() {
  const [period, setPeriod] = useState<Period>("Monthly")
  const [month, setMonth] = useState(MONTHS[0])
  const [region, setRegion] = useState("All Regions")

  const totalIncome = useMemo(
    () => CONSOLIDATED_REPORT.income.reduce((sum, row) => sum + row.amount, 0),
    []
  )
  const totalExpenses = useMemo(
    () => CONSOLIDATED_REPORT.expenses.reduce((sum, row) => sum + row.amount, 0),
    []
  )
  const netSurplus = totalIncome - totalExpenses

  const handleExport = () => {
    const csv = sectionsToCsv([
      {
        title: `Consolidated Financial Statement — ${month} (${region}, ${period})`,
        rows: [
          ...CONSOLIDATED_REPORT.income.map((row) => ({
            Section: "Income",
            Line: row.label,
            Amount: row.amount,
          })),
          { Section: "Income", Line: "Total Income", Amount: totalIncome },
          ...CONSOLIDATED_REPORT.expenses.map((row) => ({
            Section: "Expenses",
            Line: row.label,
            Amount: row.amount,
          })),
          { Section: "Expenses", Line: "Total Expenses", Amount: totalExpenses },
          { Section: "Summary", Line: "Net Surplus", Amount: netSurplus },
        ],
      },
    ])
    downloadCsv(`consolidated-report_${month.replace(/\s+/g, "-").toLowerCase()}.csv`, csv)
  }

  const selectCls =
    "h-[38px] appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-9 pr-9 text-[12.5px] font-semibold text-[#4B5563] outline-none focus:border-[#2563EB]"

  return (
    <FinanceControllerShell activeHref="/finance-controller/reports" topbarTitle="Dashboard">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-[30px] font-extrabold leading-tight text-[#111827]">
              Consolidated Reporting
            </h1>
            <p className="mt-2 max-w-xl text-[13px] font-medium text-[#6B7280]">
              Generate, review, and export comprehensive financial statements across all global regions
              and ministries.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#4B5563] hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-[40px] items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-[#2f4cc2]"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex flex-wrap rounded-[10px] bg-[#EEF2FF] p-1">
            {PERIODS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                className={cn(
                  "rounded-[8px] px-5 py-2 text-[12.5px] font-semibold transition-colors",
                  period === option ? "bg-[#3B5BDB] text-white shadow-sm" : "text-[#4B5563]"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                aria-label="Reporting period"
                className={selectCls}
              >
                {MONTHS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>

            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                aria-label="Region"
                className={selectCls}
              >
                {ATTENDANCE_REGIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>
        </div>

        {/* Statement */}
        <div className="mt-6 w-full rounded-[14px] border border-[#EEF1F6] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-col items-center border-b border-[#EEF1F6] pb-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3B5BDB]">
              <Church className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-[20px] font-extrabold tracking-wide text-[#111827]">
              {CONSOLIDATED_REPORT.organisation}
            </h2>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">
              Consolidated Financial Statement
            </p>
            <p className="mt-1 text-[12px] font-medium text-[#6B7280]">
              {CONSOLIDATED_REPORT.periodLabel} · {region} · {period}
            </p>
          </div>

          {/* Income */}
          <section className="mt-8">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Income Summary
            </h3>
            <dl className="mt-4 flex flex-col">
              {CONSOLIDATED_REPORT.income.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-[#F3F4F6] py-3"
                >
                  <dt className="text-[13px] font-medium text-[#4B5563]">{row.label}</dt>
                  <dd className="text-[13px] font-bold text-[#111827]">
                    {formatCurrency(row.amount, { maximumFractionDigits: 0 })}
                  </dd>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between rounded-[8px] bg-[#EEF2FF] px-4 py-3">
                <dt className="text-[13px] font-bold text-[#111827]">Total Income</dt>
                <dd className="text-[14px] font-extrabold text-[#3B5BDB]">
                  {formatCurrency(totalIncome, { maximumFractionDigits: 0 })}
                </dd>
              </div>
            </dl>
          </section>

          {/* Expenses */}
          <section className="mt-8">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Expense Summary
            </h3>
            <dl className="mt-4 flex flex-col">
              {CONSOLIDATED_REPORT.expenses.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-[#F3F4F6] py-3"
                >
                  <dt className="text-[13px] font-medium text-[#4B5563]">{row.label}</dt>
                  <dd className="text-[13px] font-bold text-[#111827]">
                    {formatCurrency(row.amount, { maximumFractionDigits: 0 })}
                  </dd>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between rounded-[8px] bg-[#EEF2FF] px-4 py-3">
                <dt className="text-[13px] font-bold text-[#111827]">Total Expenses</dt>
                <dd className="text-[14px] font-extrabold text-amber-600">
                  {formatCurrency(totalExpenses, { maximumFractionDigits: 0 })}
                </dd>
              </div>
            </dl>
          </section>

          {/* Net surplus */}
          <div className="mt-8 flex flex-col justify-between gap-4 rounded-[12px] bg-[#111827] px-6 py-5 text-white sm:flex-row sm:items-center">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/50">
                Net Surplus
              </div>
              <div className="mt-1.5 text-[22px] font-extrabold leading-none">
                {formatCurrency(netSurplus, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                <TrendingUp className="h-3.5 w-3.5" />
                {CONSOLIDATED_REPORT.surplusChangeLabel}
              </span>
              <div className="mt-2 text-[11px] font-medium text-white/60">
                {CONSOLIDATED_REPORT.marginLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FinanceControllerShell>
  )
}
