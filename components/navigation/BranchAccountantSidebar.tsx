import Image from "next/image"
import Link from "next/link"
import { BarChart3, LayoutDashboard, ShieldCheck, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
  { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
  { label: "Compliance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
  { label: "Reports", href: "/branchaccount-pastor/transaction", icon: BarChart3 },
]

export default function BranchAccountantSidebar({ activeHref }: { activeHref?: string }) {
  return (
    <aside className="w-full lg:w-[220px] border-b lg:border-b-0 lg:border-r border-[#EEF1F6] bg-white px-4 py-5">
      <div className="flex items-center gap-2 pb-5">
        <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={22} height={22} />
        <div>
          <div className="text-[12px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
          <div className="text-[9px] text-[#9CA3AF]">Accountant View</div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeHref ? item.href === activeHref : item.label === "Dashboard"
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-[11px] transition-colors",
                isActive ? "bg-[#E9EEFF] text-[#3B5BDB] font-medium" : "text-[#6B7280]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )}
        )}
      </nav>

      <div className="mt-6 space-y-2 text-[10px] text-[#6B7280]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          Settings
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          Help Center
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 pt-4">
        <div className="h-7 w-7 rounded-full overflow-hidden bg-[#E8EDFF]">
          <Image
            src="/images/Beared%20Guy02-min%201.jpg"
            alt="Alex"
            width={28}
            height={28}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="text-[9px]">
          <div className="font-semibold text-[#111827]">Alex Morgan</div>
          <div className="text-[#9CA3AF]">Accountant</div>
        </div>
      </div>
    </aside>
  )
}
