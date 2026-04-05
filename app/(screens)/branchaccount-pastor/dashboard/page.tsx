"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import {
  Building2,
  Clock,
  FileText,
  Activity,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wrench,
  Package,
  Receipt,
  Landmark,
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  Settings,
  HelpCircle,
  Menu,
  X,
"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import {
  Building2,
  Clock,
  FileText,
  Activity,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wrench,
  Package,
  Receipt,
  Landmark,
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Bell,
  ArrowRightLeft,
  Database,
  Sprout,
  Gift,
  Lightbulb,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useTransactions } from "@/components/hooks/useTransactions"
import { useRequisitions } from "@/components/hooks/useRequisitions"

const bankAccounts = [
  { 
    name: "Zenith Bank", 
    initials: "ZB", 
    initialsBg: "bg-blue-100 text-blue-600", 
    type: "Main Operations", 
    balance: "₦2,500,000", 
    lastRecon: "2 days ago", 
    reconColor: "bg-emerald-50 text-emerald-600" 
  },
  { 
    name: "Access Bank", 
    initials: "AB", 
    initialsBg: "bg-orange-100 text-orange-600", 
    type: "Savings", 
    balance: "₦1,250,000", 
    lastRecon: "5 days ago", 
    reconColor: "bg-amber-50 text-amber-600" 
  },
  { 
    name: "Enubis MfB", 
    initials: "EF", 
    initialsBg: "bg-indigo-100 text-indigo-600", 
    type: "Domiciliary (£)", 
    balance: "₦500,000", 
    lastRecon: "Today", 
    reconColor: "bg-emerald-50 text-emerald-600" 
  },
]

const incomeFeeds = [
  { 
    title: "Sunday Offering", 
    sub: "Main Hall - 1st Service", 
    amount: "+₦45,000", 
    icon: Receipt,
    iconBg: "bg-gray-100 text-gray-500"
  },
  {
    title: "Building Fund",
    sub: "Main Hall - 2nd Service",
    amount: "+₦25,000",
    icon: Sprout,
    iconBg: "bg-gray-100 text-gray-500",
  },
  {
    title: "Special Donation",
    sub: "Anonymous - For Admin",
    amount: "+₦14,000",
    icon: Gift,
    iconBg: "bg-blue-50 text-blue-500",
  },
]

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const { transactions: unverifiedTransactions } = useTransactions({ status: "UNVERIFIED" })
  const { requisitions, refresh, loading: reqLoading } = useRequisitions({
    currentStatus: "PENDING_ACCOUNTANT",
    tenantId: user?.tenantId ?? user?.tenant?.id ?? "",
  })

  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null)

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const handleApprove = async (id: string) => {
    setIsApproving(id)
    setApproveError(null)
    setApproveSuccess(null)
    try {
      const res = await fetch(`/api/core/financial/requisitions/${id}/approve-accountant`, {
        method: "POST",
        headers: {
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to approve requisition")
      }
      setApproveSuccess("Requisition sent for override review.")
      refresh()
    } catch (err: any) {
      setApproveError(err.message ?? "Failed to approve requisition")
    } finally {
      setIsApproving(null)
    }
  }

  const pendingExpensesList = useMemo(() => {
    return requisitions.map((req) => ({
      id: req.id,
      title: req.justification || "Requisition",
      sub: req.requestedBy ? `Requested by ${req.requestedBy}` : "Pending Approval",
      subColor: "text-gray-500",
      amount: new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
      }).format(req.amount || 0),
      action: "Approve",
      actionColor: "text-blue-600",
      icon: FileText,
      iconBg: "bg-blue-50 text-blue-500",
      rawId: req.id
    }))
  }, [requisitions])

  const pendingExpenses = pendingExpensesList

  const statCards = useMemo(() => [
    { 
      title: "Cash in Bank", 
      value: "₦4.25M", 
      meta: "+2.4% vs last month", 
      metaColor: "text-emerald-500", 
      icon: Building2, 
      iconBg: "bg-blue-50", 
      iconColor: "text-blue-600",
      hasArrowUp: true 
    },
    { 
      title: "Unverified Transactions", 
      value: `${unverifiedTransactions.length} items`, 
      meta: "Requires action shortly", 
      metaColor: "text-gray-500", 
      icon: Clock, 
      iconBg: "bg-amber-50", 
      iconColor: "text-amber-500" 
    },
    { 
      title: "Pending Requisitions", 
      value: `${requisitions.length} requests`, 
      meta: "Awaiting Approval", 
      metaColor: "text-amber-500", 
      icon: FileText, 
      iconBg: "bg-blue-50", 
      iconColor: "text-blue-600" 
    },
    { 
      title: "Budget Health", 
      value: "78%", 
      meta: "Healthy Utilization", 
      metaColor: "text-gray-500", 
      icon: Activity, 
      iconBg: "bg-emerald-50", 
      iconColor: "text-emerald-500" 
    },
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <ArrowUpFromLine className="h-4 w-4 text-rose-500" />
                    <h3 className="text-[13px] sm:text-[14px] font-semibold text-gray-900">Pending Expenses</h3>
                  </div>
                  <div className="text-[12px] sm:text-[13px] font-medium text-rose-500">
                    Total: ₦135,000
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex-1 space-y-5">
                  {(approveError || approveSuccess) && (
                    <div className={`rounded-[8px] border px-3 py-2 text-[12px] font-medium ${approveError ? "border-rose-200 bg-rose-50 text-rose-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                      {approveError ?? approveSuccess}
                    </div>
                  )}
                  {pendingExpenses.map((expense, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${expense.iconBg}`}>
                          <expense.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{expense.title}</p>
                          <p className={`text-[12px] font-medium ${expense.subColor}`}>{expense.sub}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-gray-900">{expense.amount}</p>
                        <button
                          onClick={() => handleApprove(expense.rawId)}
                          disabled={isApproving === expense.rawId}
                          className={`text-[12px] font-medium hover:opacity-80 ${expense.actionColor} disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          {isApproving === expense.rawId ? "Approving..." : expense.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-4 text-center">
                  <button className="text-[12px] sm:text-[13px] font-medium text-blue-600 hover:text-blue-700">
                    Batch Approve (3)
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
