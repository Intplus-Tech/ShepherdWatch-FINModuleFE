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
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export default function BranchLeadPastorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const isFinanceActive = pathname?.includes("/financial-management")
  const [isFinancialOpen, setIsFinancialOpen] = useState(isFinanceActive || pathname?.includes("/requisition"))

  useEffect(() => {
    if (isFinanceActive || pathname?.includes("/requisition")) {
      setIsFinancialOpen(true)
    }
  }, [isFinanceActive, pathname])

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

  return (
    <aside className="hidden lg:flex w-[260px] h-screen border-r border-[#EEF1F6] bg-white flex-col shrink-0 overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-8">
        <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={26} height={26} />
        <div>
          <div className="text-[15px] font-bold text-[#111827] leading-tight">ShepherdWatch</div>
          <div className="text-[11px] font-medium text-[#6B7280]">Lead Pastor's View</div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <Link
          href="/branchlead-pastor/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
            pathname === "/branchlead-pastor/dashboard" ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
          )}
        >
          <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
          Dashboard
        </Link>

        <div>
          <button
            onClick={() => setIsFinancialOpen(!isFinancialOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
              isFinanceActive ? "text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className={cn("h-5 w-5", isFinanceActive ? "text-[#2563EB]" : "text-[#6B7280]")} strokeWidth={2} />
              Financial Management
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isFinancialOpen ? "rotate-180" : "")} />
          </button>
          
          {isFinancialOpen && (
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
          className={cn(
            "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors mt-1",
            pathname?.includes("/assets") || pathname?.includes("/asset-register") || pathname?.includes("/depreciation") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
          )}
        >
          <Archive className="h-5 w-5" strokeWidth={2} />
          Assets
        </Link>

        <Link
          href="/branchlead-pastor/budget"
          className={cn(
            "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
            pathname?.includes("/budget") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
          )}
        >
          <Wallet className="h-5 w-5" strokeWidth={2} />
          Budget
        </Link>

        <Link
          href="/branchlead-pastor/compliance-remittance"
          className={cn(
            "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
            pathname?.includes("/compliance-remittance") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
          )}
        >
          <BarChart3 className="h-5 w-5" strokeWidth={2} />
          Compliance & Remittance
        </Link>

        <Link
          href="/branchlead-pastor/users"
          className={cn(
            "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
            pathname?.includes("/users") || pathname?.includes("/invite-users") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
          )}
        >
          <Users className="h-5 w-5" strokeWidth={2} />
          Users
        </Link>
      </nav>

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
