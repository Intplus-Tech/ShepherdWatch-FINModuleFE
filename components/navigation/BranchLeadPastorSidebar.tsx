"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Wallet,
  Archive,
  BarChart3,
  Settings,
  ChevronDown,
  FileText,
  Users,
  UsersRound,
  LogOut,
  Link2,
  Briefcase,
  Clock,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Banknote,
  DoorOpen,
  Church,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

// Module-level so the collapsed/expanded state of each section survives
// client-side navigation (the sidebar re-mounts per page).
let persistedGroups: { financial: boolean; hr: boolean } | null = null

const HR_ITEMS = [
  { label: "Dashboard", href: "/branchlead-pastor/hr/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/branchlead-pastor/hr/attendance", icon: Clock },
  { label: "Service Attendance", href: "/branchlead-pastor/hr/service-attendance", icon: Church },
  { label: "Leave", href: "/branchlead-pastor/hr/leave", icon: CalendarDays },
  { label: "Job Requisition", href: "/branchlead-pastor/hr/job-requisition", icon: ClipboardList },
  { label: "Employee Directory", href: "/branchlead-pastor/hr/employee-directory", icon: UsersRound },
  { label: "Training Management", href: "/branchlead-pastor/hr/training-management", icon: GraduationCap },
  { label: "Employee Loans", href: "/branchlead-pastor/hr/employee-loans", icon: Banknote },
  { label: "Exit Clearance Oversight", href: "/branchlead-pastor/hr/exit-clearance", icon: DoorOpen },
]

export default function BranchLeadPastorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const isFinanceActive = pathname?.includes("/financial-management")
  const [isFinancialSubOpen, setIsFinancialSubOpen] = useState(
    isFinanceActive || pathname?.includes("/requisition")
  )

  const [groups, setGroups] = useState<{ financial: boolean; hr: boolean }>(
    () => persistedGroups ?? { financial: true, hr: true }
  )
  const toggleGroup = (key: "financial" | "hr") =>
    setGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      persistedGroups = next
      return next
    })

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }

  const displayName = user?.name || user?.email || "Alex Morgan"
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor"
  const avatarUrl = user?.avatar || "/images/Beared%20Guy02-min%201.jpg"

  const itemCls = (active?: boolean) =>
    cn(
      "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
      active
        ? "bg-[#EFF6FF] text-[#2563EB]"
        : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
    )

  return (
    <aside className="hidden lg:flex w-[260px] h-screen sticky top-0 border-r border-[#EEF1F6] bg-white flex-col shrink-0 overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-8">
        <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={26} height={26} />
        <div>
          <div className="text-[15px] font-bold text-[#111827] leading-tight">ShepherdWatch</div>
          <div className="text-[11px] font-medium text-[#6B7280]">Lead Pastor&apos;s View</div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-3">
        {/* FINANCIAL ACCOUNTING group */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => toggleGroup("financial")}
            className="flex w-full items-center justify-between rounded-[8px] px-2 py-2 transition-colors hover:bg-gray-50"
            aria-expanded={groups.financial}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#111827] text-white">
                <Link2 className="h-3.5 w-3.5" />
              </span>
              <span className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">
                Financial Accounting
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[#9CA3AF] transition-transform",
                !groups.financial && "-rotate-90"
              )}
            />
          </button>

          {groups.financial && (
            <div className="space-y-1">
              <Link href="/branchlead-pastor/dashboard" className={itemCls(pathname === "/branchlead-pastor/dashboard")}>
                <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
                Dashboard
              </Link>

              <div>
                <button
                  onClick={() => setIsFinancialSubOpen(!isFinancialSubOpen)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
                    isFinanceActive ? "text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={cn("h-5 w-5", isFinanceActive ? "text-[#2563EB]" : "text-[#6B7280]")} strokeWidth={2} />
                    Financial Management
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isFinancialSubOpen ? "rotate-180" : "")} />
                </button>

                {isFinancialSubOpen && (
                  <div className="mt-1 flex flex-col space-y-1 pl-11 pr-2 relative">
                    <div className="absolute left-[21px] top-0 bottom-2 w-px bg-[#E5E7EB]"></div>
                    <Link
                      href="/branchlead-pastor/financial-management/income-tracking"
                      className={cn(
                        "rounded-[6px] px-3 py-2 text-[12px] font-semibold transition-colors relative",
                        pathname?.includes("/income-tracking") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50"
                      )}
                    >
                      Income Tracking
                    </Link>
                    <Link
                      href="/branchlead-pastor/financial-management/expense-tracking"
                      className={cn(
                        "rounded-[6px] px-3 py-2 text-[12px] font-semibold transition-colors relative",
                        pathname?.includes("/expense-tracking") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50"
                      )}
                    >
                      Expense Tracking
                    </Link>
                    <Link
                      href="/branchlead-pastor/financial-management/requisition"
                      className={cn(
                        "rounded-[6px] px-3 py-2 text-[12px] font-semibold transition-colors relative",
                        pathname?.includes("/requisition") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50"
                      )}
                    >
                      Requisition
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/branchlead-pastor/assets"
                className={itemCls(
                  pathname?.includes("/assets") || pathname?.includes("/asset-register") || pathname?.includes("/depreciation")
                )}
              >
                <Archive className="h-5 w-5" strokeWidth={2} />
                Assets
              </Link>

              <Link href="/branchlead-pastor/budget" className={itemCls(pathname?.includes("/budget"))}>
                <Wallet className="h-5 w-5" strokeWidth={2} />
                Budget
              </Link>

              <Link
                href="/branchlead-pastor/compliance-remittance"
                className={itemCls(pathname?.includes("/compliance-remittance"))}
              >
                <BarChart3 className="h-5 w-5" strokeWidth={2} />
                Compliance &amp; Remittance
              </Link>

              <Link
                href="/branchlead-pastor/users"
                className={itemCls(
                  (pathname?.includes("/users") || pathname?.includes("/invite-users")) && !pathname?.includes("/hr/")
                )}
              >
                <Users className="h-5 w-5" strokeWidth={2} />
                Users
              </Link>
            </div>
          )}
        </div>

        {/* HUMAN RESOURCES & ADMIN group */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => toggleGroup("hr")}
            className="flex w-full items-center justify-between rounded-[8px] px-2 py-2 transition-colors hover:bg-gray-50"
            aria-expanded={groups.hr}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#111827] text-white">
                <Briefcase className="h-3.5 w-3.5" />
              </span>
              <span className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">
                Human Resources &amp; Admin
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[#9CA3AF] transition-transform",
                !groups.hr && "-rotate-90"
              )}
            />
          </button>

          {groups.hr && (
            <div className="space-y-1">
              {HR_ITEMS.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} className={itemCls(active)}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom section — unchanged */}
      <div className="mt-auto px-4 pb-6 pt-4 border-t border-[#EEF1F6]">
        <div className="space-y-1 mb-6">
          <Link
            href="/branchlead-pastor/settings"
            className={cn(
              "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
              pathname?.includes("/settings") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-[8px] px-3 py-2.5 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-[#111827] truncate">{displayName}</div>
            <div className="text-[11px] font-medium text-[#6B7280] truncate">{roleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
