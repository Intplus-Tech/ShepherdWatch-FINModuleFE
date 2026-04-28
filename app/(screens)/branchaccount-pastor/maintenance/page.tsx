"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  Database,
  ShieldCheck,
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Bell,
  ArrowLeft,
  AlertTriangle,
  Wrench,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

type UrgentAlert = {
  id: string
  title: string
  meta: string
  daysOverdue: number
}

type EventColorType = "blue-light" | "blue-solid" | "yellow" | "green" | "red"
type CalendarEvent = { title: string; sub?: string; colorType: EventColorType }

type MaintenanceRecord = {
  _id?: string
  id?: string
  assetId?: string | { _id?: string; name?: string }
  branchId?: string | { _id?: string; name?: string }
  serviceType?: string
  description?: string
  provider?: string
  cost?: number
  currency?: string
  status?: string
  scheduledDate?: string
  completedDate?: string
}

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alertsError, setAlertsError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [historyRecords, setHistoryRecords] = useState<MaintenanceRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historySummary, setHistorySummary] = useState<{ totalCost: number; count: number } | null>(null)
  const [scheduleRecords, setScheduleRecords] = useState<MaintenanceRecord[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const branchId = useMemo(
    () => user?.branchId ?? user?.branch?.id ?? "",
    [user]
  )

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return
    setDeletingId(taskId)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/v1/core/financial/maintenance-tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete maintenance task.")
      }
      setUrgentAlerts((prev) => prev.filter((alert) => alert.id !== taskId))
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete maintenance task.")
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchHistory = async () => {
      if (!branchId) {
        setHistoryRecords([])
        setHistoryError("Branch is required to load maintenance history.")
        return
      }

      try {
        setHistoryLoading(true)
        setHistoryError(null)
        const end = new Date()
        const start = new Date(end)
        start.setMonth(end.getMonth() - 11)
        start.setDate(1)

        const params = new URLSearchParams({
          branchId,
          startDate: formatDateParam(start),
          endDate: formatDateParam(end),
          page: "1",
          limit: "50",
        })

        const response = await fetch(`/api/v1/maintenance/history?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load maintenance history.")
        }

        const payloadData = payload?.data ?? {}
        const records = payloadData?.data ?? payloadData?.items ?? payload?.data ?? []
        const list = Array.isArray(records) ? records : []
        const summary = payloadData?.summary ?? payload?.summary ?? null

        if (isMounted) {
          setHistoryRecords(list)
          setHistorySummary(
            summary && typeof summary?.totalCost === "number" && typeof summary?.count === "number"
              ? summary
              : null
          )
        }
      } catch (error) {
        if (isMounted) {
          setHistoryRecords([])
          setHistorySummary(null)
          setHistoryError(error instanceof Error ? error.message : "Unable to load maintenance history.")
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [branchId])

  useEffect(() => {
    let isMounted = true

    const fetchAlerts = async () => {
      if (!branchId) {
        setUrgentAlerts([])
        setAlertsError("Branch is required to load maintenance alerts.")
        return
      }

      try {
        setAlertsLoading(true)
        setAlertsError(null)
        const params = new URLSearchParams({ branchId })

        const response = await fetch(`/api/v1/maintenance/alerts?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load maintenance alerts.")
        }

        const records = payload?.data ?? payload?.items ?? []
        const list = Array.isArray(records) ? records : []
        const today = new Date()
        const mapped = list.map((record: MaintenanceRecord, index: number) => {
          const scheduled = record?.scheduledDate ? new Date(record.scheduledDate) : null
          const diffDays = scheduled
            ? Math.max(0, Math.floor((today.getTime() - scheduled.getTime()) / 86400000))
            : 0
          const { assetName, branchName } = getRecordNames(record)
          return {
            id: String(record?._id ?? record?.id ?? `alert-${index}`),
            title: assetName ?? record?.description ?? "Maintenance Alert",
            meta: branchName ?? record?.serviceType ?? "Overdue maintenance",
            daysOverdue: diffDays,
          } as UrgentAlert
        })

        if (isMounted) {
          setUrgentAlerts(mapped)
        }
      } catch (error) {
        if (isMounted) {
          setUrgentAlerts([])
          setAlertsError(error instanceof Error ? error.message : "Unable to load maintenance alerts.")
        }
      } finally {
        if (isMounted) {
          setAlertsLoading(false)
        }
      }
    }

    fetchAlerts()

    return () => {
      isMounted = false
    }
  }, [branchId])

  const formatDateParam = (value: Date) => {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const day = String(value.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getEventStyles = (colorType: EventColorType) => {
    switch (colorType) {
      case "blue-light":
        return "bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]"
      case "blue-solid":
        return "bg-[#2563EB] border border-[#2563EB] text-white"
      case "yellow":
        return "bg-[#FEF9C3] border border-[#FEF08A] text-[#D97706]"
      case "green":
        return "bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]"
      case "red":
        return "bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (value: number, currency?: string) => {
    const cur = currency && ["NGN", "USD", "GBP", "EUR"].includes(currency) ? currency : "NGN"
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getRecordNames = (record: MaintenanceRecord) => {
    const assetName = typeof record.assetId === "object" ? record.assetId?.name : undefined
    const branchName = typeof record.branchId === "object" ? record.branchId?.name : undefined
    return { assetName, branchName }
  }

  const weekStart = useMemo(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = (day + 6) % 7
    const start = new Date(today)
    start.setDate(today.getDate() - diff)
    start.setHours(0, 0, 0, 0)
    return start
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchSchedule = async () => {
      if (!branchId) {
        setScheduleRecords([])
        setScheduleError("Branch is required to load maintenance schedule.")
        return
      }

      try {
        setScheduleLoading(true)
        setScheduleError(null)

        const end = new Date(weekStart)
        end.setDate(weekStart.getDate() + 6)

        const params = new URLSearchParams({
          branchId,
          startDate: formatDateParam(weekStart),
          endDate: formatDateParam(end),
        })

        const response = await fetch(`/api/v1/maintenance/schedule?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load maintenance schedule.")
        }

        const records = payload?.data ?? payload?.items ?? []
        const list = Array.isArray(records) ? records : []

        if (isMounted) {
          setScheduleRecords(list)
        }
      } catch (error) {
        if (isMounted) {
          setScheduleRecords([])
          setScheduleError(error instanceof Error ? error.message : "Unable to load maintenance schedule.")
        }
      } finally {
        if (isMounted) {
          setScheduleLoading(false)
        }
      }
    }

    fetchSchedule()

    return () => {
      isMounted = false
    }
  }, [branchId, weekStart])

  const calendarDays = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      const label = date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
      })
      const isToday = new Date().toDateString() === date.toDateString()
      const events: CalendarEvent[] = scheduleRecords
        .filter((record) => {
          if (!record?.scheduledDate) return false
          const recordDate = new Date(record.scheduledDate)
          return recordDate.toDateString() === date.toDateString()
        })
        .map((record) => {
          const status = String(record?.status ?? "").toLowerCase()
          const colorType: EventColorType =
            status === "completed"
              ? "green"
              : status === "overdue"
                ? "red"
                : status === "in_progress"
                  ? "blue-solid"
                  : "blue-light"
          const { assetName, branchName } = getRecordNames(record)
          return {
            title: assetName ?? record?.description ?? "Maintenance Task",
            sub: branchName ?? record?.provider ?? record?.serviceType,
            colorType,
          }
        })
      return { label, isToday, events }
    })
    return days
  }, [scheduleRecords, weekStart])

  const weekRangeLabel = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    return `Week ${weekStart.toLocaleDateString("en-GB", { month: "short", day: "2-digit" })} - ${end.toLocaleDateString("en-GB", { month: "short", day: "2-digit" })}`
  }, [weekStart])

  const scheduleHeaderLabel = useMemo(() => {
    const current = weekStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    return `${current} Schedule`
  }, [weekStart])

  const completedMaintenance = useMemo(() => {
    return historyRecords.map((record) => ({
      date: record?.completedDate
        ? new Date(record.completedDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      asset: record?.description ?? "Maintenance Task",
      type: record?.serviceType ?? "Service",
      technician: record?.provider ?? "N/A",
      cost:
        record?.cost !== undefined && record?.cost !== null
          ? formatCurrency(record.cost, record.currency)
          : "N/A",
      status: record?.status ? String(record.status).toUpperCase() : "COMPLETED",
    }))
  }, [historyRecords])

  const completedTotal = useMemo(() => {
    if (historySummary?.totalCost) {
      return historySummary.totalCost
    }
    return historyRecords.reduce((sum, record) => sum + (Number(record?.cost) || 0), 0)
  }, [historyRecords, historySummary])

  return (
    <div className={`flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed xl:sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"}`}>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center gap-3 pb-8">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
            <div>
              <div className="text-[15px] font-bold text-[#3B5BDB] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#6B7280] font-medium mt-1 tracking-wide">Accountant&apos;s View</div>
            </div>
          </div>

          <nav className="space-y-1 flex-1 mt-2">
            {[
              { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
              { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },
              { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
              { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database, active: true },
              { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors ${item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-4.5 w-4.5 stroke-[2] ${item.active ? "text-[#3B5BDB]" : "text-[#6B7280]"}`} />
                    {item.label}
                  </div>
                </div>
              )
            })}
          </nav>

          <div className="mt-auto">
            <div className="space-y-1 border-t border-[#EEF1F6] pt-6 text-[13px] font-semibold text-[#4B5563]">
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <Settings className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                Settings
              </div>
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <HelpCircle className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                Help Center
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3.5 px-3.5 pb-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm flex items-center justify-center">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#111827]">Alex Morgan</div>
                <div className="text-[11px] text-[#9CA3AF] font-medium">Accountant</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
        {/* Top Header */}
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block text-[14px] font-semibold text-[#111827]">
              Dashboard
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-[320px] sm:max-w-none">
            <div className="relative flex-1 w-full sm:max-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search transactions..."
                className="h-[36px] sm:h-[38px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] pl-9 pr-3 text-[13px] text-[#4B5563] font-medium placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all"
              />
            </div>
            <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
              <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <span className="absolute right-2 sm:right-3 top-2 sm:top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Layout */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">

            {/* Back Button */}
            <button className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] transition-colors mb-4 text-[13px] font-semibold tracking-wide">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Header Section */}
            <header className="mb-6 sm:mb-8">
              <h1
                className="text-[26.21px] font-black text-[#111827] tracking-[-0.66px] leading-[32.76px] mb-1.5"
                style={{ fontFamily: "Inter, sans-serif", verticalAlign: "middle" }}
              >
                Maintenance Management Hub
              </h1>
              <p className="text-[14px] text-[#6B7280] font-medium tracking-tight">Oversee asset upkeep and service schedules for the branch.</p>
            </header>

            {/* Top Grid Area */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.85fr] gap-6 mb-8 items-start">
              
              {/* Left Column (Alerts & Tip) */}
              <div className="flex flex-col gap-6 w-full">
                
                {/* Urgent Alerts Card */}
                <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <AlertTriangle className="h-5 w-5 text-[#EF4444]" strokeWidth={2.5} />
                    <h3 className="text-[15px] font-[800] text-[#111827] tracking-tight">Urgent Alerts</h3>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    {alertsLoading && (
                      <div className="text-[12px] font-medium text-[#6B7280]">Loading overdue tasks...</div>
                    )}
                    {alertsError && (
                      <div className="text-[12px] font-medium text-[#EF4444]">{alertsError}</div>
                    )}
                    {deleteError && (
                      <div className="text-[12px] font-medium text-[#EF4444]">{deleteError}</div>
                    )}
                    {!alertsLoading && !alertsError && urgentAlerts.length === 0 && (
                      <div className="text-[12px] font-medium text-[#6B7280]">No overdue maintenance tasks.</div>
                    )}
                    {urgentAlerts.map((alert) => {
                      const severityLabel = alert.daysOverdue >= 14 ? "CRITICAL" : "OVERDUE"
                      return (
                        <div key={alert.id} className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] p-4 flex flex-col items-start gap-1">
                          <div className="text-[11px] font-[900] text-[#DC2626] uppercase tracking-widest">{severityLabel}</div>
                          <div className="text-[13.5px] font-[800] text-[#DC2626] leading-snug">{alert.title}</div>
                          <div className="text-[12px] font-medium text-[#9CA3AF]">{alert.meta}</div>
                          <div className="mt-1 flex w-full items-center justify-between text-[12px] font-[800] text-[#DC2626] uppercase tracking-wide">
                            <span>{alert.daysOverdue} Days</span>
                            <button
                              onClick={() => handleDeleteTask(alert.id)}
                              disabled={deletingId === alert.id}
                              className="text-[11px] font-[800] text-rose-600 hover:text-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {deletingId === alert.id ? "Deleting..." : "Delete Task"}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Maintenance Tip Card */}
                <div className="rounded-[16px] bg-[#EFF6FF] border border-[#BFDBFE] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Wrench className="h-[18px] w-[18px] text-[#2563EB]" strokeWidth={2.5} />
                    <h3 className="text-[14px] font-[800] text-[#1E3A8A] tracking-tight">Maintenance Tip</h3>
                  </div>
                  <p className="text-[13px] font-medium text-[#1E40AF] leading-relaxed">
                    Proactive maintenance can reduce overhead costs and extend asset life cycles to fulfill broader management programs.
                  </p>
                </div>

              </div>

              {/* Right Column (Schedule Calendar) */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col h-full min-h-[400px]">
                
                {/* Header & Legends */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="h-[18px] w-[18px] rounded-[4px] border-[1.5px] border-[#3B5BDB] flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-sm bg-[#3B5BDB]"></div>
                    </div>
                    <h2 className="text-[16px] font-[800] text-[#111827] tracking-tight">{scheduleHeaderLabel}</h2>
                  </div>
                  
                  <div className="flex items-center gap-3.5 sm:gap-5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#EF4444]"></span>
                      <span className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-wider">Overdue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#F59E0B]"></span>
                      <span className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-wider">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#10B981]"></span>
                      <span className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-wider">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Week Strip */}
                <div className="flex items-center justify-between mb-6 px-2">
                  <button className="h-8 w-8 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="text-[13.5px] font-[800] text-[#111827] tracking-tight">{weekRangeLabel}</div>
                  <button className="h-8 w-8 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-gray-100 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Schedule List */}
                <div className="lg:hidden space-y-3">
                  {calendarDays.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className={`rounded-[12px] border border-[#EEF1F6] p-4 ${
                        day.isToday ? "bg-[#EEF2FF] border-[#C7D2FE]" : "bg-white"
                      }`}
                    >
                      <div className={`text-[12px] font-[800] tracking-widest uppercase ${day.isToday ? "text-[#2563EB]" : "text-[#6B7280]"}`}>
                        {day.label} {day.isToday && <span className="ml-1">(Today)</span>}
                      </div>
                      <div className="mt-3 space-y-2">
                        {scheduleLoading && (
                          <div className="text-[12px] text-[#9CA3AF] font-medium">Loading schedule...</div>
                        )}
                        {!scheduleLoading && scheduleError && (
                          <div className="text-[12px] text-[#EF4444] font-medium">{scheduleError}</div>
                        )}
                        {!scheduleLoading && !scheduleError && day.events.length === 0 && (
                          <div className="text-[12px] text-[#9CA3AF] font-medium">No scheduled task</div>
                        )}
                        {day.events.map((ev, eIdx) => {
                          const styleClass = getEventStyles(ev.colorType)
                          return (
                            <div key={eIdx} className={`w-full rounded-[8px] p-2.5 flex flex-col justify-center ${styleClass}`}>
                              <div className="text-[12px] font-[800] leading-snug tracking-tight">{ev.title}</div>
                              {ev.sub && <div className="text-[11px] opacity-80 mt-0.5 leading-tight">{ev.sub}</div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:flex flex-1 w-full overflow-x-auto no-scrollbar">
                  <div className="min-w-[700px] h-full flex items-stretch border-t border-[#EEF1F6] pt-4">
                    {/* Render Columns */}
                    <div className="grid grid-cols-7 w-full h-full gap-0">
                      {calendarDays.map((day, dIdx) => (
                        <div 
                          key={dIdx} 
                          className={`flex flex-col h-full min-h-[200px] px-1.5 lg:px-2 border-r border-[#EEF1F6] last:border-r-0 ${
                            day.isToday ? "bg-[#EEF2FF] border border-[#BFDBFE] -my-2 py-2 rounded-[8px] relative z-10 shadow-sm" : ""
                          }`}
                        >
                          {/* Day Header */}
                          <div className={`text-[11px] font-[800] tracking-widest uppercase mb-4 text-center ${day.isToday ? "text-[#2563EB]" : "text-[#6B7280]"}`}>
                            {day.label} {day.isToday && <span className="block mt-0.5">(TODAY)</span>}
                          </div>
                          
                          {/* Day Cell Container */}
                          <div className="flex-1 flex flex-col gap-2 pb-2">
                            {day.events.map((ev, eIdx) => {
                              const styleClass = getEventStyles(ev.colorType)
                              return (
                                <div key={eIdx} className={`w-full rounded-[8px] p-2 sm:p-2.5 flex flex-col justify-center ${styleClass}`}>
                                  <div className="text-[11.5px] font-[800] leading-snug tracking-tight">{ev.title}</div>
                                  {ev.sub && <div className="text-[10px] opacity-80 mt-0.5 leading-tight">{ev.sub}</div>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Table Section */}
            <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                <h2 className="text-[17px] font-[800] text-[#111827] tracking-tight">Completed Maintenance</h2>
                <button className="text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors leading-none tracking-tight">
                  View All History
                </button>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-[#EEF1F6]/70">
                {historyLoading && (
                  <div className="p-5 sm:p-6 text-[12px] font-medium text-[#6B7280]">Loading maintenance history...</div>
                )}
                {!historyLoading && historyError && (
                  <div className="p-5 sm:p-6 text-[12px] font-medium text-[#EF4444]">{historyError}</div>
                )}
                {!historyLoading && !historyError && completedMaintenance.length === 0 && (
                  <div className="p-5 sm:p-6 text-[12px] font-medium text-[#6B7280]">No completed maintenance yet.</div>
                )}
                {completedMaintenance.map((row, idx) => (
                  <div key={idx} className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-bold text-[#6B7280]">{row.date}</div>
                        <div className="mt-1 text-[14px] font-[800] text-[#111827]">{row.asset}</div>
                        <div className="mt-1 text-[12.5px] font-medium text-[#6B7280]">{row.type}</div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-[800] uppercase tracking-wider bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                        {row.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[12px]">
                      <span className="font-medium text-[#2563EB]">{row.technician}</span>
                      <span className="text-[13px] font-[800] text-[#111827]">{row.cost}</span>
                    </div>
                  </div>
                ))}

                <div className="p-5 sm:p-6 bg-[#F8FAFC]">
                  <div className="text-[12px] font-[800] text-[#111827] tracking-tight">Total Maintenance Cost</div>
                  <div className="mt-2 text-[15px] font-[900] text-[#2563EB]">
                    {formatCurrency(completedTotal, "NGN")}
                  </div>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block w-full overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6]">
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest w-[14%]">DATE</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest w-[25%]">ASSET</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest">SERVICE TYPE</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest">TECHNICIAN / PROVIDER</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest text-right">COST</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest w-[12%] text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]/70">
                    {historyLoading && (
                      <tr>
                        <td colSpan={6} className="py-6 px-6 sm:px-8 text-[12px] font-medium text-[#6B7280]">
                          Loading maintenance history...
                        </td>
                      </tr>
                    )}
                    {!historyLoading && historyError && (
                      <tr>
                        <td colSpan={6} className="py-6 px-6 sm:px-8 text-[12px] font-medium text-[#EF4444]">
                          {historyError}
                        </td>
                      </tr>
                    )}
                    {!historyLoading && !historyError && completedMaintenance.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 px-6 sm:px-8 text-[12px] font-medium text-[#6B7280]">
                          No completed maintenance yet.
                        </td>
                      </tr>
                    )}
                    {completedMaintenance.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[12px] font-bold text-[#6B7280]">{row.date}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[13px] font-[800] text-[#111827]">{row.asset}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[12.5px] font-medium text-[#6B7280]">{row.type}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[12.5px] font-medium text-[#2563EB]">{row.technician}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-right">
                          <div className="text-[13px] font-[800] text-[#111827]">{row.cost}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-[800] uppercase tracking-wider bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Table Footer */}
                    <tr className="bg-[#F8FAFC]">
                      <td colSpan={4} className="py-6 px-6 sm:px-8 text-right">
                        <span className="text-[13px] font-[800] text-[#111827] tracking-tight">Total Maintenance Cost:</span>
                      </td>
                      <td colSpan={2} className="py-6 px-6 sm:px-8">
                        <span className="text-[15px] font-[900] text-[#2563EB]">
                          {formatCurrency(completedTotal, "NGN")}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}




