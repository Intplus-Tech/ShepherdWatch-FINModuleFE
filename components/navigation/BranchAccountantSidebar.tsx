"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, ShieldCheck, Wallet, Settings, HelpCircle, ArrowRightLeft, Database, LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/AuthProvider"

const navItems = [
  { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
  { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },
  { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
  { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database },
  { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
]

type Props = {
  activeHref?: string
  /** When provided, renders a mobile-drawer-style sidebar (slides in on small screens, sticky on xl). */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function BranchAccountantSidebar({ activeHref, mobileOpen, onMobileClose }: Props) {
  const router = useRouter()
  const { logout } = useAuth()
  const drawerMode = typeof mobileOpen === "boolean"

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
        "w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed xl:sticky top-0 z-50 transition-transform duration-300 ease-in-out px-5 py-6",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"
      )
    : "w-full lg:w-60 border-b lg:border-b-0 lg:border-r border-[#EEF1F6] bg-white px-5 py-6"

  return (
    <aside className={asideClass}>
      {drawerMode && (
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close menu"
          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors z-10"
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

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeHref ? item.href === activeHref : item.label === "Dashboard"
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
      </nav>

      <div className="mt-8 space-y-3 text-[12px] text-[#6B7280]">
        <div className="flex items-center gap-3">
          <Settings className="h-4 w-4" />
          Settings
        </div>
        <div className="flex items-center gap-3">
          <HelpCircle className="h-4 w-4" />
          Help Center
        </div>
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
        <div className="text-[11px]">
          <div className="font-semibold text-[#111827]">Alex Morgan</div>
          <div className="text-[#9CA3AF]">Accountant</div>
        </div>
      </div>
    </aside>
  )
}
