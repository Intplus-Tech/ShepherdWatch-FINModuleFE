"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Eye,
  FileText,
  History,
  PlusCircle,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import FinanceControllerShell from "@/components/finance-controller/FinanceControllerShell"
import InitiateSpecialRequestModal from "@/components/finance-controller/InitiateSpecialRequestModal"
import {
  INCOME_EXPENSE_TREND,
  RECENT_ACTIVITY,
} from "@/components/finance-controller/finance-data"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const CHART_HEIGHT = 190

const STAT_CARDS = [
  {
    label: "Total Income",
    value: 42_850_000,
    trend: "+10%",
    trendText: "vs last month",
    trendClass: "text-emerald-600",
    TrendIcon: TrendingUp,
    icon: Eye,
    iconClass: "bg-[#EEF2FF] text-[#3B5BDB]",
  },
  {
    label: "Total Expenses",
    value: 840_250_400,
    trend: "-5%",
    trendText: "vs last month",
    trendClass: "text-rose-600",
    TrendIcon: TrendingDown,
    icon: Receipt,
    iconClass: "bg-rose-100 text-rose-600",
  },
  {
    label: "Net Surplus",
    value: 8_840_250,
    trend: "",
    trendText: "Healthy Margin",
    trendClass: "text-emerald-600",
    TrendIcon: TrendingUp,
    icon: CircleDollarSign,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
] as const

export default function Page() {
  const [requestModalOpen, setRequestModalOpen] = useState(false)

  const maxValue = Math.max(
    ...INCOME_EXPENSE_TREND.flatMap((point) => [point.income, point.expenses])
  )
  const axisTicks = [50, 40, 30, 20, 10, 0]

  return (
    <FinanceControllerShell activeHref="/finance-controller/dashboard">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[22px] font-extrabold uppercase tracking-tight text-[#111827]">
            Finance Controller Dashboard
          </h1>
          <p className="mt-1.5 text-[13px] font-medium text-[#6B7280]">
            Global Overview — Current Fiscal Year
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon
            const TrendIcon = card.TrendIcon
            return (
              <div
                key={card.label}
                className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[12px] font-semibold text-[#6B7280]">{card.label}</span>
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full",
                      card.iconClass
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-3 text-[24px] font-extrabold leading-none text-[#111827]">
                  {formatCurrency(card.value, { maximumFractionDigits: 0 })}
                </div>
                <div className={cn("mt-2.5 flex items-center gap-1 text-[11px] font-semibold", card.trendClass)}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {card.trend ? <span>{card.trend}</span> : null}
                  <span className="font-medium text-[#9CA3AF]">{card.trendText}</span>
                </div>
              </div>
            )
          })}

          {/* Requests card */}
          <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold text-[#6B7280]">Requests</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F3FF] text-[#7C3AED]">
                <FileText className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3 text-[24px] font-extrabold leading-none text-[#111827]">3/5</div>
            <Link
              href="/finance-controller/requests"
              className="mt-2.5 inline-block text-[11px] font-semibold text-[#3B5BDB] hover:underline"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          {/* Income vs Expense chart */}
          <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#111827]">
                <BarChart3 className="h-4 w-4 text-[#3B5BDB]" />
                Income vs Expense
              </h2>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-[#111827]">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#111827]" />
                  Income
                </span>
                <span className="flex items-center gap-2 text-[12px] font-semibold text-[#6B7280]">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#6B7FD7]" />
                  Expenses
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {/* Y axis */}
              <div
                className="flex shrink-0 flex-col justify-between text-right text-[10px] font-medium text-[#9CA3AF]"
                style={{ height: CHART_HEIGHT }}
              >
                {axisTicks.map((tick) => (
                  <span key={tick}>{tick}M</span>
                ))}
              </div>

              <div className="min-w-0 flex-1 overflow-x-auto">
                <div
                  className="flex min-w-[520px] items-end gap-3 border-b border-l border-[#EEF1F6] pl-2"
                  style={{ height: CHART_HEIGHT }}
                >
                  {INCOME_EXPENSE_TREND.map((point) => {
                    const incomeH = Math.round((point.income / maxValue) * (CHART_HEIGHT - 20))
                    const expenseH = Math.round((point.expenses / maxValue) * (CHART_HEIGHT - 20))
                    return (
                      <div key={point.month} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex w-full items-end justify-center gap-[3px]">
                          <div
                            className={cn(
                              "w-[9px] rounded-t-[2px]",
                              point.projected ? "bg-[#C7D2FE]" : "bg-[#111827]"
                            )}
                            style={{ height: `${Math.max(4, incomeH)}px` }}
                            title={`${point.month} income: ${formatCurrency(point.income, { maximumFractionDigits: 0 })}`}
                          />
                          <div
                            className={cn(
                              "w-[9px] rounded-t-[2px]",
                              point.projected ? "bg-[#DBEAFE]" : "bg-[#6B7FD7]"
                            )}
                            style={{ height: `${Math.max(4, expenseH)}px` }}
                            title={`${point.month} expenses: ${formatCurrency(point.expenses, { maximumFractionDigits: 0 })}`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-2 flex min-w-[520px] gap-3 pl-2">
                  {INCOME_EXPENSE_TREND.map((point) => (
                    <span
                      key={point.month}
                      className="flex-1 text-center text-[10px] font-semibold text-[#9CA3AF]"
                    >
                      {point.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-6 text-right text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Data last refreshed: just now (live connection)
            </p>
          </div>

          {/* Right rail */}
          <div className="flex flex-col gap-6">
            {/* Quick actions */}
            <div className="rounded-[12px] border border-[#EEF1F6] bg-[#F5F7FF] p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#111827]">
                <Sparkles className="h-4 w-4 text-[#3B5BDB]" />
                Quick Actions
              </h2>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/finance-controller/reports?period=weekly"
                  className="flex items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#3B5BDB]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6] text-[#4B5563]">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-[#111827]">
                      Generate Weekly Report
                    </span>
                    <span className="block text-[11px] font-medium text-[#9CA3AF]">
                      Automated PDF summary
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                </Link>

                <Link
                  href="/finance-controller/reports?period=monthly"
                  className="flex items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#3B5BDB]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6] text-[#4B5563]">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-[#111827]">
                      Generate Monthly Report
                    </span>
                    <span className="block text-[11px] font-medium text-[#9CA3AF]">
                      Comprehensive board pack
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                </Link>

                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  className="flex items-center gap-3 rounded-[10px] bg-[#111827] p-4 text-left text-white transition-colors hover:bg-[#1F2937]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-white/10">
                    <PlusCircle className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-bold">Initiate Budget Request</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-white/70" />
                </button>
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#111827]">
                  <History className="h-4 w-4 text-[#6B7280]" />
                  Recent Activity
                </h2>
                <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-[#6B7280]">
                  LIVE
                </span>
              </div>

              <ul className="mt-4 flex flex-col gap-5">
                {RECENT_ACTIVITY.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                    <div className="min-w-0 flex-1 border-l border-[#EEF1F6] pl-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[13px] font-bold text-[#111827]">{item.branch}</span>
                        <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#3B5BDB]">
                          {item.timeLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] font-medium text-[#6B7280]">
                        {item.description}{" "}
                        <span className="font-bold text-[#111827]">
                          {formatCurrency(item.amount, { maximumFractionDigits: 0 })}
                        </span>
                      </p>
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-[4px] px-2 py-0.5 text-[10px] font-extrabold tracking-wide",
                          item.tagClass
                        )}
                      >
                        {item.tag}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {requestModalOpen ? (
        <InitiateSpecialRequestModal
          open={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
        />
      ) : null}
    </FinanceControllerShell>
  )
}
