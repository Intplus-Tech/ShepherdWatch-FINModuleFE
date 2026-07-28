"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  FilePlus2,
  Wrench,
  Database,
  Settings,
  LogOut,
  X,
  ChevronDown,
  Link2,
  Briefcase,
  Clock,
  CalendarDays,
  ClipboardList,
  UsersRound,
  GraduationCap,
  Banknote,
  DoorOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/AuthProvider"

// Module-level so each section's collapsed/expanded state survives navigation.
let persistedGroups: { financial: boolean; hr: boolean } | null = null

const FINANCIAL_ITEMS = [
  { label: "Dashboard", href: "/branch-admin/dashboard", icon: LayoutDashboard },
  { label: "Requisitions", href: "/branch-admin/requisitions", icon: FilePlus2 },
  { label: "Logistics & Repairs", href: "/branch-admin/logistics-repair", icon: Wrench },
  { label: "Assets", href: "/branch-admin/asset", icon: Database },
]

const HR_ITEMS = [
  { label: "Dashboard", href: "/branch-admin/hr/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/branch-admin/hr/attendance", icon: Clock },
  { label: "Leave", href: "/branch-admin/hr/leave", icon: CalendarDays },
  { label: "Job Requisition", href: "/branch-admin/hr/job-requisition", icon: ClipboardList },
  { label: "Employee Directory", href: "/branch-admin/hr/employee-directory", icon: UsersRound },
  { label: "Training Management", href: "/branch-admin/hr/training-management", icon: GraduationCap },
  { label: "Employee Loans", href: "/branch-admin/hr/employee-loans", icon: Banknote },
  { label: "Exit Clearance Oversight", href: "/branch-admin/hr/exit-clearance", icon: DoorOpen },
]

type Props = {
  activeHref?: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function BranchAdminSidebar({ activeHref, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()

  const [groups, setGroups] = useState<{ financial: boolean; hr: boolean }>(
    () => persistedGroups ?? { financial: true, hr: true }
  )
  const toggleGroup = (key: "financial" | "hr") =>
    setGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      persistedGroups = next
      return next
    })

  const current = activeHref ?? pathname ?? ""

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.name ||
    "Alex Morgan"
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Branch Officer"

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }

  const itemCls = (active: boolean) =>
    cn(
      "flex items-center gap-3.5 rounded-[8px] px-4 py-3 text-[14px] font-[700] transition-colors",
      active ? "bg-[#EEF2FF] text-[#2563EB]" : "text-[#4B5563] hover:bg-gray-50"
    )

  const renderItems = (items: typeof FINANCIAL_ITEMS) =>
    items.map((item) => {
      const Icon = item.icon
      const active = current === item.href
      return (
        <Link key={item.href} href={item.href} onClick={() => onMobileClose?.()} className={itemCls(active)}>
          <Icon className={cn("h-5 w-5", active ? "text-[#2563EB]" : "text-[#6B7280]")} strokeWidth={2} />
          {item.label}
        </Link>
      )
    })

  const groupHeader = (key: "financial" | "hr", label: string, GroupIcon: typeof Link2) => (
    <button
      type="button"
      onClick={() => toggleGroup(key)}
      className="flex w-full items-center justify-between rounded-[8px] px-2 py-2 transition-colors hover:bg-gray-50"
      aria-expanded={groups[key]}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#111827] text-white">
          <GroupIcon className="h-3.5 w-3.5" />
        </span>
        <span className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">
          {label}
        </span>
      </span>
      <ChevronDown className={cn("h-4 w-4 text-[#9CA3AF] transition-transform", !groups[key] && "-rotate-90")} />
    </button>
  )

  return (
    <aside
      className={cn(
        "w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed lg:sticky top-0 z-50 transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <button
        onClick={() => onMobileClose?.()}
        className="lg:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors z-10"
        aria-label="Close menu"
      >
        <X className="h-4.5 w-4.5" />
      </button>

      <div className="py-6 flex flex-col h-full overflow-y-auto no-scrollbar">
        {/* Logo */}
        <div className="flex items-center gap-3 pb-8 px-6">
          <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
          <div className="flex flex-col justify-center">
            <div className="text-[17px] font-[800] text-[#2563EB] leading-tight tracking-tight">ShepherdWatch</div>
            <div className="text-[11.5px] text-[#6B7280] font-medium tracking-wide">Admin&apos;s View</div>
          </div>
        </div>

        {/* Navigation groups */}
        <nav className="space-y-4 px-3">
          <div className="space-y-1.5">
            {groupHeader("financial", "Financial Accounting", Link2)}
            {groups.financial && <div className="space-y-1.5">{renderItems(FINANCIAL_ITEMS)}</div>}
          </div>
          <div className="space-y-1.5">
            {groupHeader("hr", "Human Resourcing", Briefcase)}
            {groups.hr && <div className="space-y-1.5">{renderItems(HR_ITEMS)}</div>}
          </div>
        </nav>

        {/* System Section */}
        <div className="px-3 mt-4">
          <div className="text-[11px] font-[800] text-[#9CA3AF] tracking-widest uppercase mb-3 px-4">System</div>
          <div className="space-y-1">
            <Link
              href="/branch-admin/settings"
              onClick={() => onMobileClose?.()}
              className="flex items-center gap-3.5 rounded-[8px] px-4 py-3 text-[14px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-5 w-5 stroke-[2] text-[#6B7280]" />
              Settings
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto px-3 mb-2">
          <div className="pt-6 border-t border-[#EEF1F6] flex flex-col gap-4 px-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-[8px] py-2.5 px-2 -mx-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-[calc(100%+16px)] text-left"
            >
              <LogOut className="h-4.5 w-4.5" />
              Logout
            </button>

            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-[800] text-[#111827] leading-tight mb-0.5">{displayName}</div>
                <div className="text-[12px] font-medium text-[#9CA3AF] leading-tight">{roleLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
