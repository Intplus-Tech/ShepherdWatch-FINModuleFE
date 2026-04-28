"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Inter } from "next/font/google"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  List,
  Wrench,
  Database,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Check,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

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
  notes?: string
}

export default function LogisticsRepairsPage() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceRecord[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [scheduleRecords, setScheduleRecords] = useState<MaintenanceRecord[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [completingRecord, setCompletingRecord] = useState<MaintenanceRecord | null>(null)
  const [completeForm, setCompleteForm] = useState({ cost: "", notes: "" })
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [completeSaving, setCompleteSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    serviceType: "",
    description: "",
    provider: "",
    cost: "",
    scheduledDate: "",
    notes: "",
  })
  const [editError, setEditError] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  const branchId = useMemo(
    () => user?.branchId ?? user?.branch?.id ?? "",
    [user]
  )

  const formatCurrency = (value: number, currency?: string) => {
    const cur = currency && ["NGN", "USD", "GBP", "EUR"].includes(currency) ? currency : "NGN"
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getAssetName = (record: MaintenanceRecord) => {
    if (record?.assetId && typeof record.assetId === "object") {
      return record.assetId?.name
    }
    return undefined
  }

  const formatDateParam = (value: Date) => {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const day = String(value.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    let isMounted = true

    const fetchTasks = async () => {
      if (!branchId) {
        setMaintenanceTasks([])
        setTasksError("Branch is required to load maintenance tasks.")
        return
      }

      try {
        setTasksLoading(true)
        setTasksError(null)
        const params = new URLSearchParams({
          branchId,
          page: "1",
          limit: "100",
          sort: "scheduledDate",
          order: "asc",
        })

        const response = await fetch(`/api/v1/maintenance?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load maintenance tasks.")
        }

        const records = payload?.data ?? payload?.items ?? []
        const list = Array.isArray(records) ? records : []
        const filtered = list.filter((record: MaintenanceRecord) => {
          const status = String(record?.status ?? "").toLowerCase()
          return status === "scheduled" || status === "in_progress" || status === "overdue"
        })

        if (isMounted) {
          setMaintenanceTasks(filtered)
          setSelectedIds(new Set())
        }
      } catch (error) {
        if (isMounted) {
          setMaintenanceTasks([])
          setTasksError(error instanceof Error ? error.message : "Unable to load maintenance tasks.")
        }
      } finally {
        if (isMounted) {
          setTasksLoading(false)
        }
      }
    }

    fetchTasks()

    return () => {
      isMounted = false
    }
  }, [branchId])

  const currentMonthStart = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }, [])

  const currentMonthEnd = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
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
        const params = new URLSearchParams({
          branchId,
          startDate: formatDateParam(currentMonthStart),
          endDate: formatDateParam(currentMonthEnd),
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
  }, [branchId, currentMonthStart, currentMonthEnd])

  // Sub-component for priority badges
  const PriorityBadge = ({ priority }: { priority: string }) => {
    let colorClasses = ""
    switch (priority) {
      case "High":
        colorClasses = "bg-[#FEF2F2] text-[#EF4444]" // Red
        break
      case "Medium":
        colorClasses = "bg-[#FFF7ED] text-[#F97316]" // Orange
        break
      case "Low":
        colorClasses = "bg-[#ECFDF5] text-[#10B981]" // Green
        break
      default:
        colorClasses = "bg-[#F3F4F6] text-[#6B7280]" // Gray
    }
    return (
      <span className={`text-[10px] font-[800] uppercase tracking-wider px-2 py-0.5 rounded-[4px] ${colorClasses}`}>
        {priority}
      </span>
    )
  }

  const selectedCount = selectedIds.size
  const totalSelectedCost = maintenanceTasks
    .filter((task) => selectedIds.has(String(task?._id ?? task?.id ?? "")))
    .reduce((acc, curr) => acc + (Number(curr?.cost) || 0), 0)

  const tasksForDisplay = maintenanceTasks.map((task) => {
    const status = String(task?.status ?? "scheduled").toLowerCase()
    const priority = status === "overdue" ? "High" : status === "in_progress" ? "Medium" : "Low"
    const subtitleParts = []
    if (task?.serviceType) subtitleParts.push(task.serviceType)
    if (task?.scheduledDate) {
      subtitleParts.push(
        new Date(task.scheduledDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      )
    }
    return {
      id: String(task?._id ?? task?.id ?? ""),
      taskTitle: getAssetName(task) ?? task?.description ?? "Maintenance Task",
      subtitle: subtitleParts.join(" • ") || "Scheduled Maintenance",
      category: task?.serviceType ? task.serviceType.replace("_", " ") : "Maintenance",
      priority,
      cost: task?.cost !== undefined && task?.cost !== null ? formatCurrency(task.cost, task.currency) : "N/A",
      status: status === "in_progress" ? "Authorizing" : "- Pending",
      rawStatus: status,
    }
  })

  const pendingCount = maintenanceTasks.length
  const totalEstimatedCost = maintenanceTasks.reduce(
    (acc, task) => acc + (Number(task?.cost) || 0),
    0
  )

  const upcomingCount = maintenanceTasks.filter((task) => {
    if (!task?.scheduledDate) return false
    const date = new Date(task.scheduledDate)
    if (Number.isNaN(date.getTime())) return false
    const diff = date.getTime() - new Date().setHours(0, 0, 0, 0)
    return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000
  }).length

  const monthLabel = useMemo(() => {
    return currentMonthStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  }, [currentMonthStart])

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (error) {
      console.error("Logout failed", error)
      router.replace("/login")
    }
  }

  const calendarDays = useMemo(() => {
    const daysInMonth = currentMonthEnd.getDate()
    const startDay = (currentMonthStart.getDay() + 6) % 7
    const scheduledSet = new Set<number>()
    scheduleRecords.forEach((record) => {
      if (!record?.scheduledDate) return
      const date = new Date(record.scheduledDate)
      if (date.getMonth() !== currentMonthStart.getMonth() || date.getFullYear() !== currentMonthStart.getFullYear()) {
        return
      }
      scheduledSet.add(date.getDate())
    })

    return {
      startDay,
      days: Array.from({ length: daysInMonth }).map((_, index) => {
        const day = index + 1
        return {
          day,
          isToday: (() => {
            const now = new Date()
            return (
              now.getDate() === day &&
              now.getMonth() === currentMonthStart.getMonth() &&
              now.getFullYear() === currentMonthStart.getFullYear()
            )
          })(),
          hasDot: scheduledSet.has(day),
        }
      }),
    }
  }, [currentMonthStart, currentMonthEnd, scheduleRecords])

  const upcomingThisWeek = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    return scheduleRecords
      .filter((record) => {
        if (!record?.scheduledDate) return false
        const date = new Date(record.scheduledDate)
        return date >= start && date <= end
      })
      .sort((a, b) => {
        const aDate = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
        const bDate = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
        return aDate - bDate
      })
      .slice(0, 3)
  }, [scheduleRecords])

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const openEdit = (recordId: string) => {
    const record = maintenanceTasks.find(
      (task) => String(task?._id ?? task?.id ?? "") === recordId
    )
    if (!record) return
    setEditingRecord(record)
    setEditError(null)
    setEditForm({
      serviceType: record?.serviceType ?? "",
      description: record?.description ?? "",
      provider: record?.provider ?? "",
      cost: record?.cost !== undefined && record?.cost !== null ? String(record.cost) : "",
      scheduledDate: record?.scheduledDate ? record.scheduledDate.slice(0, 10) : "",
      notes: record?.notes ?? "",
    })
  }

  const closeEdit = () => {
    setEditingRecord(null)
    setEditError(null)
    setEditForm({
      serviceType: "",
      description: "",
      provider: "",
      cost: "",
      scheduledDate: "",
      notes: "",
    })
  }

  const openComplete = (recordId: string) => {
    const record = maintenanceTasks.find(
      (task) => String(task?._id ?? task?.id ?? "") === recordId
    )
    if (!record) return
    setCompletingRecord(record)
    setCompleteError(null)
    setCompleteForm({
      cost: record?.cost !== undefined && record?.cost !== null ? String(record.cost) : "",
      notes: record?.notes ?? "",
    })
  }

  const closeComplete = () => {
    setCompletingRecord(null)
    setCompleteError(null)
    setCompleteForm({ cost: "", notes: "" })
  }

  const handleCompleteSave = async () => {
    if (!completingRecord) return
    setCompleteError(null)
    setCompleteSaving(true)

    try {
      const recordId = String(completingRecord?._id ?? completingRecord?.id ?? "")
      if (!recordId) {
        throw new Error("Maintenance record ID is missing.")
      }

      const payload: Record<string, unknown> = {}
      if (completeForm.cost) payload.cost = Number(completeForm.cost)
      if (completeForm.notes) payload.notes = completeForm.notes

      const response = await fetch(`/api/v1/maintenance/${recordId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.message ?? "Unable to complete maintenance record.")
      }

      setMaintenanceTasks((prev) =>
        prev.filter((task) => String(task?._id ?? task?.id ?? "") !== recordId)
      )
      closeComplete()
    } catch (error) {
      setCompleteError(error instanceof Error ? error.message : "Unable to complete maintenance record.")
    } finally {
      setCompleteSaving(false)
    }
  }

  const handleEditSave = async () => {
    if (!editingRecord) return
    setEditError(null)
    setEditSaving(true)

    try {
      const payload: Record<string, unknown> = {}
      if (editForm.serviceType) payload.serviceType = editForm.serviceType
      if (editForm.description) payload.description = editForm.description
      if (editForm.provider) payload.provider = editForm.provider
      if (editForm.cost) payload.cost = Number(editForm.cost)
      if (editForm.scheduledDate) payload.scheduledDate = editForm.scheduledDate
      if (editForm.notes) payload.notes = editForm.notes

      const recordId = String(editingRecord?._id ?? editingRecord?.id ?? "")
      if (!recordId) {
        throw new Error("Maintenance record ID is missing.")
      }

      const response = await fetch(`/api/v1/maintenance/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.message ?? "Unable to update maintenance record.")
      }

      const updated = result?.data ?? {}
      setMaintenanceTasks((prev) =>
        prev.map((task) => {
          if (String(task?._id ?? task?.id ?? "") !== recordId) return task
          return { ...task, ...payload, ...updated }
        })
      )

      closeEdit()
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Unable to update maintenance record.")
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <div className={`flex flex-col xl:flex-row min-h-[100dvh] bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
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
        
        <div className="py-6 flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* Logo Container */}
          <div className="flex items-center gap-3 pb-8 px-6">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="text-[17px] font-[800] text-[#2563EB] leading-tight tracking-tight">ShepherdWatch</div>
              <div className="text-[11.5px] text-[#6B7280] font-medium tracking-wide">Admin&apos;s View</div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1.5 mt-2 px-3">
            {[
              { label: "Dashboard", href: "/branch-admin/dashboard", icon: LayoutDashboard },
              { label: "Requisitions", href: "/branch-admin/requisitions", icon: List },
              { label: "Logistics & Repairs", href: "/branch-admin/logistics-repair", icon: Wrench },
              { label: "Assets", href: "/branch-admin/asset", icon: Database },
            ].map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between rounded-[8px] px-4 py-3 text-[14px] font-[700] cursor-pointer transition-colors ${isActive ? "bg-[#EEF2FF] text-[#2563EB]" : "text-[#4B5563] hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-5 w-5 stroke-[2] ${isActive ? "text-[#2563EB]" : "text-[#6B7280]"}`} />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* System Section */}
          <div className="px-3 mt-4">
            <div className="text-[11px] font-[800] text-[#9CA3AF] tracking-widest uppercase mb-3 px-4">System</div>
            <div className="space-y-1">
              <Link href="/branch-admin/settings" className="flex items-center gap-3.5 rounded-[8px] px-4 py-3 cursor-pointer text-[14px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 stroke-[2] text-[#6B7280]" />
                Settings
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto px-3 mb-2">
            <div className="pt-6 border-t border-[#EEF1F6] flex flex-col gap-4 px-4">
              <div className="flex items-center gap-3.5 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-200 flex items-center justify-center">
                  <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
                </div>
                <div>
                  <div className="text-[14px] font-[800] text-[#111827] leading-tight mb-0.5">{user?.name || user?.email || "User"}</div>
                  <div className="text-[12px] font-medium text-[#9CA3AF] leading-tight">
                    {user?.role ? String(user.role).replace(/_/g, " ") : "Branch Officer"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-[8px] py-2.5 px-2 -mx-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-[calc(100%+16px)] text-left"
              >
                <LogOut className="h-4.5 w-4.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
        {/* Top Header */}
        <header className="h-[64px] sm:h-[73px] bg-white border-b border-[#EEF1F6] flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#4B5563]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[18px] font-[900] text-[#111827] tracking-tight hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-end">
            <div className="relative w-full max-w-[180px] sm:max-w-[240px] md:max-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2.5} />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#6B7280] relative">
              <Bell className="h-5 w-5" strokeWidth={2} />
              <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></div>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-[40px] pt-3 sm:pt-4 pb-10 sm:pb-12 overflow-y-auto w-full">
          <div className="mx-auto w-full max-w-[1440px] flex flex-col gap-6 lg:gap-8">

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-[650px]">
                <h1 
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    fontSize: "23.49px",
                    lineHeight: "28.19px",
                    letterSpacing: "-0.59px",
                    verticalAlign: "middle"
                  }}
                >
                  Logistics & Repairs
                </h1>
                <p className="text-[14px] sm:text-[15px] text-[#6B7280] font-[500] leading-relaxed">
                  Manage ongoing maintenance tasks and recurring expenses.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-end w-full sm:w-auto md:ml-auto md:justify-end">
                <button className="h-[40px] sm:h-[44px] px-4 sm:px-5 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center gap-2 text-[12.5px] sm:text-[14px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm shrink-0 w-full sm:w-[210px]">
                  <Download className="h-4 w-4 text-[#6B7280]" strokeWidth={2.5} />
                  Export Report
                </button>
                <button className="h-[40px] sm:h-[44px] px-4 sm:px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center gap-2 text-[12.5px] sm:text-[14px] font-[800] text-white transition-colors shadow-sm shrink-0 w-full sm:w-[210px]">
                  <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                  New Maintenance Request
                </button>
              </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-[700] text-[#6B7280]">Pending Repairs</span>
                  <div className="h-7 w-7 rounded-[6px] bg-[#FFF7ED] flex items-center justify-center">
                    <Wrench className="h-3.5 w-3.5 text-[#F97316]" strokeWidth={2.5}/>
                  </div>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "18.79px",
                    lineHeight: "25.06px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  {pendingCount}
                </div>
                <div className="text-[12px] font-[600] text-[#9CA3AF] mt-1">
                  Active scheduled and in-progress tasks
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-[700] text-[#6B7280]">Total Estimated Cost</span>
                  <div className="h-7 w-7 rounded-[6px] bg-[#EFF6FF] flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-[#2563EB]" strokeWidth={2.5}/>
                  </div>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "18.79px",
                    lineHeight: "25.06px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  {formatCurrency(totalEstimatedCost, "NGN")}
                </div>
                <div className="text-[12px] font-[600] text-[#9CA3AF] mt-1">
                  Across {pendingCount} pending tasks
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-[700] text-[#6B7280]">Upcoming Bills</span>
                  <div className="h-7 w-7 rounded-[6px] bg-[#F3E8FF] flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-[#A855F7]" strokeWidth={2.5}/>
                  </div>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "18.79px",
                    lineHeight: "25.06px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  {upcomingCount}
                </div>
                <div className="text-[12px] font-[600] text-[#9CA3AF] mt-1">Due in next 30 days</div>
              </div>
            </div>

            {/* Split Main Area */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
              
              {/* Left Column (Table) */}
              <div className="w-full lg:flex-[2] min-w-0">
                <div className="bg-white rounded-[16px] border border-[#EEF1F6] shadow-sm flex flex-col relative overflow-hidden pb-[70px]">
                  
                  {/* Table Header / Toolbar */}
                  <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#EEF1F6]">
                    <h2 className="text-[16px] font-[900] text-[#111827] tracking-tight self-start sm:self-auto">Pending Maintenance Tasks</h2>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto self-end sm:self-auto group">
                      <div className="relative w-full sm:w-[240px]">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2.5} />
                        <input
                          type="search"
                          placeholder="Search tasks..."
                          className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 text-[13px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
                        />
                      </div>
                      <button className="h-[38px] w-[38px] rounded-[8px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors shrink-0">
                        <Filter className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Cards (xs only) */}
                  <div className="sm:hidden divide-y divide-[#EEF1F6]">
                    {tasksLoading && (
                      <div className="p-4 sm:p-5 text-[12px] font-[600] text-[#6B7280]">Loading maintenance tasks...</div>
                    )}
                    {!tasksLoading && tasksError && (
                      <div className="p-4 sm:p-5 text-[12px] font-[600] text-[#EF4444]">{tasksError}</div>
                    )}
                    {!tasksLoading && !tasksError && tasksForDisplay.length === 0 && (
                      <div className="p-4 sm:p-5 text-[12px] font-[600] text-[#6B7280]">No pending maintenance tasks.</div>
                    )}
                    {tasksForDisplay.map((task) => (
                      <div key={task.id} className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[13.5px] font-[800] text-[#111827]">{task.taskTitle}</div>
                            <div className="text-[12px] font-[500] text-[#9CA3AF]">{task.subtitle}</div>
                          </div>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-[12px] font-[600] text-[#4B5563]">{task.category}</div>
                          <div className="text-[13px] font-[800] text-[#111827]">{task.cost}</div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          {task.status === "Authorizing" ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFF7ED] rounded-[4px]">
                              <span className="text-[10px] font-[800] uppercase tracking-wider text-[#F97316]">Authorizing</span>
                            </div>
                          ) : (
                            <div className="text-[12px] font-[600] text-[#9CA3AF]">{task.status}</div>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openComplete(task.id)}
                              className="text-[10px] font-[800] uppercase tracking-wider px-2 py-1 rounded-[6px] bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => openEdit(task.id)}
                              className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1 rounded-md hover:bg-gray-100"
                            >
                              <MoreVertical className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table (sm and up) */}
                  <div className="hidden sm:block w-full overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead>
                        <tr className="border-b border-[#EEF1F6] bg-[#F9FAFB]/50">
                          <th className="py-4 px-6 w-[5%]">
                            <div className="h-4 w-4 rounded-[4px] border-2 border-[#D1D5DB] flex items-center justify-center cursor-pointer">
                            </div>
                          </th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[35%]">TASK DETAILS</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%]">CATEGORY</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%]">PRIORITY</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%]">EST. COST</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[10%]">STATUS</th>
                          <th className="py-4 px-6 w-[5%]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEF1F6]">
                        {tasksLoading && (
                          <tr>
                            <td colSpan={7} className="py-6 px-6 text-[12px] font-[600] text-[#6B7280]">
                              Loading maintenance tasks...
                            </td>
                          </tr>
                        )}
                        {!tasksLoading && tasksError && (
                          <tr>
                            <td colSpan={7} className="py-6 px-6 text-[12px] font-[600] text-[#EF4444]">
                              {tasksError}
                            </td>
                          </tr>
                        )}
                        {!tasksLoading && !tasksError && tasksForDisplay.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-6 px-6 text-[12px] font-[600] text-[#6B7280]">
                              No pending maintenance tasks.
                            </td>
                          </tr>
                        )}
                        {tasksForDisplay.map((task) => (
                          <tr key={task.id} className={`group transition-colors ${selectedIds.has(task.id) ? 'bg-[#EFF6FF]/40' : 'hover:bg-[#F8FAFC]'}`}>
                            <td className="py-4 px-6">
                              <div
                                onClick={() => toggleSelected(task.id)}
                                className={`h-4 w-4 rounded-[4px] border-2 flex items-center justify-center cursor-pointer transition-colors ${
                                  selectedIds.has(task.id) ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#D1D5DB] bg-white'
                                }`}
                              >
                                {selectedIds.has(task.id) && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex flex-col gap-0.5">
                                <div className="text-[13.5px] font-[800] text-[#111827]">{task.taskTitle}</div>
                                <div className="text-[12px] font-[500] text-[#9CA3AF]">{task.subtitle}</div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-[13px] font-[600] text-[#4B5563]">{task.category}</div>
                            </td>
                            <td className="py-4 px-2">
                              <PriorityBadge priority={task.priority} />
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-[13.5px] font-[800] text-[#111827]">{task.cost}</div>
                            </td>
                            <td className="py-4 px-2">
                              {task.status === "Authorizing" ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFF7ED] rounded-[4px]">
                                  <span className="text-[10px] font-[800] uppercase tracking-wider text-[#F97316]">Authorizing</span>
                                </div>
                              ) : (
                                <div className="text-[13px] font-[600] text-[#9CA3AF]">{task.status}</div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openComplete(task.id)}
                                  className="text-[10px] font-[800] uppercase tracking-wider px-2 py-1 rounded-[6px] bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => openEdit(task.id)}
                                  className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1 rounded-md hover:bg-gray-100"
                                >
                                  <MoreVertical className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Floating Action Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#EEF1F6] flex items-center justify-between px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[12px] font-[800] flex items-center justify-center">
                        {selectedCount}
                      </div>
                      <div className="text-[13px] font-[600] text-[#4B5563]">
                        Items Selected <span className="mx-1 text-[#D1D5DB]">|</span> Total: <span className="font-[900] text-[#111827]">{formatCurrency(totalSelectedCost, "NGN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="h-[36px] px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[#4B5563] text-[13px] font-[700] hover:bg-gray-50 transition-colors">
                        Reject
                      </button>
                      <button className="h-[36px] px-5 rounded-[6px] bg-[#2563EB] text-white text-[13px] font-[800] flex items-center gap-2 hover:bg-[#1D4ED8] transition-colors shadow-sm">
                        Create Batch Requisition
                        <ChevronRight className="h-4 w-4 -mr-1" strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column (Calendar/Expenses) */}
              <div className="w-full lg:flex-[1] min-w-0">
                <div className="bg-white rounded-[16px] border border-[#EEF1F6] shadow-sm p-5 md:p-6 flex flex-col w-full h-full">
                  
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[15px] font-[900] text-[#111827]">Recurring Expenses</h2>
                    <div className="flex items-center gap-3 text-[13px] font-[700] text-[#4B5563]">
                      <ChevronLeft className="h-4 w-4 text-[#9CA3AF] cursor-pointer hover:text-[#4B5563]" strokeWidth={2.5} />
                      {monthLabel}
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] cursor-pointer hover:text-[#4B5563]" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="w-full">
                    {/* Days of Week */}
                    <div className="grid grid-cols-7 mb-2">
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                        <div key={day} className="text-center text-[10px] font-[800] uppercase text-[#9CA3AF] py-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Dates */}
                    <div className="grid grid-cols-7 gap-y-2">
                      {Array.from({ length: calendarDays.startDay }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="aspect-square flex flex-col items-center justify-center relative"></div>
                      ))}
                      {calendarDays.days.map((item) => (
                        <div key={item.day} className="aspect-square flex flex-col items-center justify-center relative p-0.5">
                          <div
                            className={`h-full w-full rounded-[8px] flex items-center justify-center text-[12px] font-[700] cursor-pointer transition-colors ${
                              item.isToday ? "bg-[#2563EB] text-white shadow-md" : "text-[#4B5563] hover:bg-gray-50"
                            }`}
                          >
                            {item.day}
                          </div>
                          {item.hasDot && !item.isToday && (
                            <div className="absolute bottom-1 h-1 w-1 rounded-full bg-[#10B981]"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-[#EEF1F6] my-6"></div>

                  <h3 className="text-[11px] font-[800] uppercase text-[#9CA3AF] tracking-wider mb-4">Upcoming This Week</h3>
                  {scheduleLoading && (
                    <div className="text-[12px] font-[600] text-[#6B7280]">Loading schedule...</div>
                  )}
                  {!scheduleLoading && scheduleError && (
                    <div className="text-[12px] font-[600] text-[#EF4444]">{scheduleError}</div>
                  )}
                  {!scheduleLoading && !scheduleError && upcomingThisWeek.length === 0 && (
                    <div className="text-[12px] font-[600] text-[#6B7280]">No upcoming maintenance this week.</div>
                  )}
                  {!scheduleLoading && !scheduleError && upcomingThisWeek.map((item, index) => {
                    const date = item?.scheduledDate ? new Date(item.scheduledDate) : null
                    const month = date ? date.toLocaleDateString("en-GB", { month: "short" }) : "--"
                    const day = date ? date.toLocaleDateString("en-GB", { day: "2-digit" }) : "--"
                    const dueSoon = date ? date.getTime() <= new Date().getTime() + 2 * 24 * 60 * 60 * 1000 : false
                    return (
                      <div key={item?._id ?? item?.id ?? `upcoming-${index}`} className={`flex justify-between items-start ${index < upcomingThisWeek.length - 1 ? "mb-5 pb-5 border-b border-[#F3F4F6]" : ""}`}>
                        <div className="flex gap-4">
                          <div className={`flex flex-col items-center justify-center h-10 w-10 rounded-[8px] border shrink-0 ${dueSoon ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#EF4444]" : "bg-[#F8FAFC] border-[#E5E7EB] text-[#6B7280]"}`}>
                            <span className="text-[10px] font-[800] uppercase leading-none mb-0.5">{month}</span>
                            <span className="text-[14px] font-[900] leading-none">{day}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="text-[13.5px] font-[800] text-[#111827]">{getAssetName(item) ?? item?.description ?? "Maintenance Task"}</div>
                            <div className="text-[12px] font-[600] text-[#6B7280]">
                              {item?.cost !== undefined && item?.cost !== null ? formatCurrency(item.cost, item.currency) : "Cost unavailable"}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[9px] font-[800] uppercase tracking-wider px-2 py-0.5 rounded-[4px] mt-1 shrink-0 ${dueSoon ? "text-[#EF4444] bg-[#FEF2F2]" : "text-[#2563EB] bg-[#EFF6FF]"}`}>
                          {dueSoon ? "Due" : "Upcoming"}
                        </span>
                      </div>
                    )
                  })}

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] bg-white rounded-[16px] shadow-2xl border border-[#EEF1F6] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[15px] font-[900] text-[#111827]">Update Maintenance Record</div>
                <div className="text-[12px] text-[#6B7280] font-[600]">
                  {getAssetName(editingRecord) ?? editingRecord.description ?? "Maintenance Task"}
                </div>
              </div>
              <button
                onClick={closeEdit}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#4B5563] hover:bg-gray-100"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Service Type</label>
                <select
                  value={editForm.serviceType}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, serviceType: e.target.value }))}
                  className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                >
                  <option value="">Select type</option>
                  <option value="routine">Routine</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                  <option value="replacement">Replacement</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Scheduled Date</label>
                <input
                  type="date"
                  value={editForm.scheduledDate}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                  className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Provider</label>
                <input
                  value={editForm.provider}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, provider: e.target.value }))}
                  className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                  placeholder="Service provider"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Estimated Cost</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.cost}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, cost: e.target.value }))}
                  className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Description</label>
              <input
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                placeholder="Maintenance description"
              />
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Notes</label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-[600] text-[#111827]"
                placeholder="Add any notes for this update"
              />
            </div>

            {editError && <div className="mt-3 text-[12px] font-[600] text-[#EF4444]">{editError}</div>}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={closeEdit}
                className="h-[38px] px-4 rounded-[8px] border border-[#E5E7EB] bg-white text-[#4B5563] text-[13px] font-[700] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="h-[38px] px-5 rounded-[8px] bg-[#2563EB] text-white text-[13px] font-[800] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {completingRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] bg-white rounded-[16px] shadow-2xl border border-[#EEF1F6] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[15px] font-[900] text-[#111827]">Complete Maintenance</div>
                <div className="text-[12px] text-[#6B7280] font-[600]">
                  {getAssetName(completingRecord) ?? completingRecord.description ?? "Maintenance Task"}
                </div>
              </div>
              <button
                onClick={closeComplete}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#4B5563] hover:bg-gray-100"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Final Cost</label>
                <input
                  type="number"
                  min="0"
                  value={completeForm.cost}
                  onChange={(e) => setCompleteForm((prev) => ({ ...prev, cost: e.target.value }))}
                  className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Status</label>
                <div className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] px-3 text-[13px] font-[700] text-[#16A34A] flex items-center">
                  COMPLETED
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wide">Completion Notes</label>
              <textarea
                value={completeForm.notes}
                onChange={(e) => setCompleteForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="min-h-[90px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-[600] text-[#111827]"
                placeholder="Add completion notes"
              />
            </div>

            {completeError && <div className="mt-3 text-[12px] font-[600] text-[#EF4444]">{completeError}</div>}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={closeComplete}
                className="h-[38px] px-4 rounded-[8px] border border-[#E5E7EB] bg-white text-[#4B5563] text-[13px] font-[700] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSave}
                disabled={completeSaving}
                className="h-[38px] px-5 rounded-[8px] bg-[#16A34A] text-white text-[13px] font-[800] hover:bg-[#15803D] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {completeSaving ? "Completing..." : "Mark Completed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


