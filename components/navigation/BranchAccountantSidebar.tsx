import Image from "next/image"
import Link from "next/link"
import { LayoutDashboard, ShieldCheck, Wallet, Settings, HelpCircle, ArrowRightLeft, Database } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
  { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },
  { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
  { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database },
  { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
]

export default function BranchAccountantSidebar({ activeHref }: { activeHref?: string }) {
  return (
    <aside className="w-full lg:w-[240px] border-b lg:border-b-0 lg:border-r border-[#EEF1F6] bg-white px-5 py-6">
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
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-colors",
                isActive ? "bg-[#E9EEFF] text-[#3B5BDB] font-semibold" : "text-[#6B7280]"
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
