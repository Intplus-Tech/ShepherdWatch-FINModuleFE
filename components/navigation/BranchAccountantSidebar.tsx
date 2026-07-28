"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Wallet,
  Settings,
  ArrowRightLeft,
  Database,
  LogOut,
  X,
  ChevronDown,
  Link2,
  Briefcase,
  Clock,
  UsersRound,
  Banknote,
  DoorOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/AuthProvider"

// Module-level so each section's collapsed/expanded state survives navigation.
let persistedGroups: { financial: boolean; hr: boolean } | null = null

const HR_ITEMS = [
  { label: "Dashboard", href: "/branchaccount-pastor/hr/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/branchaccount-pastor/hr/attendance", icon: Clock },
  { label: "Employee Directory", href: "/branchaccount-pastor/hr/employee-directory", icon: UsersRound },
  { label: "Employee Loans", href: "/branchaccount-pastor/hr/employee-loans", icon: Banknote },
  { label: "Exit Clearance Oversight", href: "/branchaccount-pastor/hr/exit-clearance", icon: DoorOpen },
]

const ROLE_LABELS: Record<string, string> = {
  accountant: "Accountant",
  branch_accountant: "Branch Accountant",
}

function formatRoleLabel(role?: string | null): string {
  if (!role) return "Accountant"
  const key = String(role).trim().toLowerCase()
  if (ROLE_LABELS[key]) return ROLE_LABELS[key]
  return key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const navItems = [
  { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
  { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },
  { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
  { label: "Assets", href: "/branchaccount-pastor/asset", icon: Database },
  // Compliance temporarily hidden for now (kept for later re-enable):
  // { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
]

type Props = {
  activeHref?: string
  /** When provided, renders a mobile-drawer-style sidebar (slides in on small screens, sticky on xl). */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function BranchAccountantSidebar({ activeHref, mobileOpen, onMobileClose }: Props) {
  const router = useRouter()
  const { logout, user } = useAuth()
  const drawerMode = typeof mobileOpen === "boolean"

  const [groups, setGroups] = useState<{ financial: boolean; hr: boolean }>(
    () => persistedGroups ?? { financial: true, hr: true }
  )
  const toggleGroup = (key: "financial" | "hr") =>
    setGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      persistedGroups = next
      return next
    })

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.email ||
    "User"
  const roleLabel = formatRoleLabel(user?.role)

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }

  const asideClass = drawerMode
    ? cn(
        "w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed lg:sticky top-0 z-50 lg:overflow-y-auto transition-transform duration-300 ease-in-out px-3 py-6",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      )
    : "w-full lg:w-[260px] shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-[#EEF1F6] bg-white px-3 py-6"

  return (
    <aside className={asideClass}>
      {drawerMode && (
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close menu"
          className="lg:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors z-10"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      )}
      <div className="flex items-center gap-3 pb-8">
        <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={26} height={26} />
        <div>
          <div className="text-[14px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
          <div className="text-[10px] text-[#9CA3AF]">Accountant View</div>
        </div>
      </div>

      <nav className="space-y-4">
        {/* FINANCIAL ACCOUNTING group */}
        <div className="space-y-1.5">
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
              className={cn("h-4 w-4 text-[#9CA3AF] transition-transform", !groups.financial && "-rotate-90")}
            />
          </button>

          {groups.financial && (
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isAssetGroup = item.label === "Assets"
                const isActive = activeHref
                  ? isAssetGroup
                    ? /\/(asset|asset-register|depreciation|maintenance)(\/|$)/.test(activeHref)
                    : item.href === activeHref
                  : item.label === "Dashboard"
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => onMobileClose?.()}
                    className={cn(
                      "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-colors",
                      isActive ? "bg-[#E9EEFF] text-[#3B5BDB] font-semibold" : "text-[#6B7280] hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* HUMAN RESOURCING group */}
        <div className="space-y-1.5">
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
                Human Resourcing
              </span>
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-[#9CA3AF] transition-transform", !groups.hr && "-rotate-90")}
            />
          </button>

          {groups.hr && (
            <div className="space-y-1.5">
              {HR_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = item.href === activeHref
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => onMobileClose?.()}
                    className={cn(
                      "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-colors",
                      isActive ? "bg-[#E9EEFF] text-[#3B5BDB] font-semibold" : "text-[#6B7280] hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="mt-8 space-y-3 text-[12px] text-[#6B7280]">
        <Link
          href="/branchaccount-pastor/settings"
          onClick={() => onMobileClose?.()}
          className="flex items-center gap-3 w-full py-1 hover:text-[#111827] transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-[8px] px-0 py-1 text-[12px] text-rose-600 hover:text-rose-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="mt-10 flex items-center gap-3 pt-4">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-[#E8EDFF]">
          <Image
            src="/images/Beared%20Guy02-min%201.jpg"
            alt="Alex"
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="text-[11px] min-w-0">
          <div className="font-semibold text-[#111827] truncate">{displayName}</div>
          <div className="text-[#9CA3AF] truncate">{roleLabel}</div>
        </div>
      </div>
    </aside>
  )
}
