"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftRight,
  Folder,
  GitBranch,
  LayoutGrid,
  Scale,
  Settings,
  Users,
  UsersRound,
  WalletCards,
  LogOut,
  Link2,
  Briefcase,
  ChevronDown,
  CalendarCheck,
  GraduationCap,
  Banknote,
  DoorOpen,
  ClipboardList,
  Church,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/AuthProvider"

export type SidebarItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export type SidebarUser = {
  name: string
  role: string
  avatarSrc?: string
}

type NavGroup = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: SidebarItem[]
}

// Two independently-collapsible sections. The shared items (Budgeting, Compliance,
// Asset, Branch Management, Users, Settings) point at the existing director screens.
const NAV_GROUPS: NavGroup[] = [
  {
    label: "FINANCIAL ACCOUNTING",
    icon: Link2,
    items: [
      { label: "Dashboard", href: "/director-screen/dashboard", icon: LayoutGrid },
      { label: "Transactions", href: "/director-screen/transaction", icon: ArrowLeftRight },
      { label: "Budgeting", href: "/director-screen/budgeting", icon: WalletCards },
      { label: "Compliance", href: "/director-screen/compliance", icon: Scale },
      { label: "Asset", href: "/director-screen/assets", icon: Folder },
      { label: "Branch Management", href: "/director-screen/branch-management", icon: GitBranch },
      { label: "Users", href: "/director-screen/users", icon: Users },
      { label: "Settings", href: "/director-screen/settings", icon: Settings },
    ],
  },
  {
    label: "HUMAN RESOURCES & ADMIN",
    icon: Briefcase,
    items: [
      { label: "Dashboard", href: "/director-screen/hr/dashboard", icon: LayoutGrid },
      { label: "Job Requisition", href: "/director-screen/hr/requisition-approvals", icon: ClipboardList },
      { label: "Employee Directory", href: "/director-screen/hr/employee-directory", icon: UsersRound },
      { label: "Payroll Overview", href: "/director-screen/hr/payroll-approval", icon: WalletCards },
      { label: "Leave & Attendance", href: "/director-screen/hr/leave-attendance", icon: CalendarCheck, badge: "12" },
      { label: "Service Attendance", href: "/director-screen/hr/service-attendance", icon: Church },
      { label: "Training Management", href: "/director-screen/hr/training-management", icon: GraduationCap },
      { label: "Employee Loans", href: "/director-screen/hr/employee-loans", icon: Banknote, badge: "12" },
      { label: "Exit Clearance Oversight", href: "/director-screen/hr/exit-clearance", icon: DoorOpen },
    ],
  },
]

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  director: "Director",
  regional_director: "Regional Director",
  executive_director: "Executive Director",
  global_director: "Global Director",
  branch_admin: "Branch Officer",
  branch_accountant: "Branch Accountant",
  accountant: "Branch Accountant",
  branch_pastor: "Branch Pastor",
  lead_pastor: "Lead Pastor",
  regional_pastor: "Regional Pastor",
  pastor: "Pastor",
  hr: "HR",
  employee: "Employee",
}

function formatRoleLabel(role?: string | null): string {
  if (!role) return ""
  const key = String(role).trim().toLowerCase()
  if (ROLE_LABELS[key]) return ROLE_LABELS[key]
  return key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

// Module-level so the collapsed/expanded state survives client-side navigation.
// SidebarNav re-mounts on every page, but this module stays loaded, so a section
// the user collapsed stays collapsed when they open another page.
let persistedOpenGroups: Record<string, boolean> | null = null

export default function SidebarNav({
  activeHref = "/director-screen/dashboard",
  user,
  className,
}: Readonly<{
  items?: SidebarItem[]
  activeHref?: string
  user?: SidebarUser
  className?: string
}>) {
  const { logout, user: authUser } = useAuth()
  const router = useRouter()

  // Both sections start expanded; each can be collapsed independently. The state
  // is seeded from the module-level cache so it persists across page navigation.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () =>
      persistedOpenGroups ??
      NAV_GROUPS.reduce((acc, group) => ({ ...acc, [group.label]: true }), {} as Record<string, boolean>)
  )

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] }
      persistedOpenGroups = next
      return next
    })

  const resolvedName =
    user?.name ??
    ([authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ").trim() ||
      authUser?.name ||
      authUser?.email ||
      "")
  const resolvedAvatar = user?.avatarSrc ?? authUser?.avatar ?? "/images/Beared%20Guy02-min%201.jpg"
  // Show a real person's name (fall back to a proper name instead of the generic
  // "Super Admin User"), and label the role as the Director's View.
  const displayName =
    resolvedName && !/^super\s*admin/i.test(resolvedName) && resolvedName !== "User"
      ? resolvedName
      : "Rev. Thomas M."
  const resolvedUser: SidebarUser = {
    name: displayName,
    role: "Director's View",
    avatarSrc: resolvedAvatar,
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }

  return (
    <aside
      className={cn(
        "w-65 min-h-screen bg-[#FAFBFF] border-r border-[#EEF1F6] px-6 pt-6 pb-5 hidden xl:flex flex-col",
        className
      )}
    >
      <div className="flex flex-col gap-1 pb-5">
        <div className="flex items-center gap-2">
          <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={22} height={22} />
          <div className="text-[13px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
        </div>
        <span className="text-[10px] font-medium text-[#3B5BDB] ml-7">Director&apos;s View</span>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {NAV_GROUPS.map((group) => {
            const GroupIcon = group.icon
            const isOpen = openGroups[group.label]
            return (
              <div key={group.label} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-white"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#111827] text-white">
                      <GroupIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#111827]">
                      {group.label}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-[#9CA3AF] transition-transform",
                      !isOpen && "-rotate-90"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = item.href === activeHref
                      return (
                        <Link
                          key={`${group.label}-${item.label}`}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors",
                            isActive
                              ? "bg-[#3B5BDB] text-white shadow-sm"
                              : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                          )}
                        >
                          <Icon className="h-4.5 w-4.5 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge ? (
                            <span
                              className={cn(
                                "ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                isActive ? "bg-white/25 text-white" : "bg-[#EEF2FF] text-[#3B5BDB]"
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-[#EEF1F6] pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0">
              {resolvedUser.avatarSrc ? (
                <Image src={resolvedUser.avatarSrc} alt={resolvedUser.name} width={40} height={40} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#111827]">{resolvedUser.name}</span>
              <span className="text-[11px] font-medium text-[#6B7280]">{resolvedUser.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-[8px] px-4 py-2.5 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
