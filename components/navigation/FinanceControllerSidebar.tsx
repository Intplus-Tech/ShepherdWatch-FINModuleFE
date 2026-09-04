"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeftRight,
  ChevronDown,
  FileText,
  LayoutGrid,
  LogOut,
  Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/AuthProvider"

const TRANSACTION_ITEMS = [
  { label: "My Transactions", href: "/finance-controller/transaction/my-transactions" },
  { label: "Global Transactions", href: "/finance-controller/transaction/global-transactions" },
]

const PRIMARY_ITEMS = [
  { label: "Dashboard", href: "/finance-controller/dashboard", icon: LayoutGrid },
  { label: "Request", href: "/finance-controller/requests", icon: Inbox },
  { label: "Reports", href: "/finance-controller/reports", icon: FileText },
]

export default function FinanceControllerSidebar({ activeHref }: { activeHref?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const current = activeHref ?? pathname ?? ""
  const [transactionsOpen, setTransactionsOpen] = useState(() => current.includes("/transaction"))

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.name || "Alex Morgan"
  const avatarUrl = user?.avatar || "/images/Beared%20Guy02-min%201.jpg"

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
      "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
      active ? "bg-[#3B5BDB] text-white shadow-sm" : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
    )

  return (
    <aside className="sticky top-0 hidden h-screen w-[230px] shrink-0 flex-col overflow-y-auto border-r border-[#EEF1F6] bg-[#FAFBFF] px-4 py-6 lg:flex">
      <div className="flex items-center gap-2 px-2 pb-8">
        <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={22} height={22} />
        <div>
          <div className="text-[13px] font-bold leading-none text-[#111827]">ShepherdWatch</div>
          <div className="mt-1 text-[10px] font-medium text-[#3B5BDB]">Admin&apos;s View</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        <Link href={PRIMARY_ITEMS[0].href} className={itemCls(current === PRIMARY_ITEMS[0].href)}>
          <LayoutGrid className="h-4 w-4 shrink-0" />
          {PRIMARY_ITEMS[0].label}
        </Link>

        {/* Transaction group with its two sub-views */}
        <div>
          <button
            type="button"
            onClick={() => setTransactionsOpen((prev) => !prev)}
            aria-expanded={transactionsOpen}
            className={cn(
              itemCls(current.includes("/transaction") && !transactionsOpen),
              "w-full justify-between"
            )}
          >
            <span className="flex items-center gap-3">
              <ArrowLeftRight className="h-4 w-4 shrink-0" />
              Transaction
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", !transactionsOpen && "-rotate-90")}
            />
          </button>

          {transactionsOpen ? (
            <div className="mt-1 flex flex-col gap-1 pl-6">
              {TRANSACTION_ITEMS.map((item) => {
                const active = current === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-[8px] px-3 py-2 text-[12.5px] font-medium transition-colors",
                      active
                        ? "bg-[#EEF2FF] text-[#3B5BDB]"
                        : "text-[#9CA3AF] hover:bg-white hover:text-[#111827]"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>

        {PRIMARY_ITEMS.slice(1).map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={itemCls(current === item.href)}>
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-[#EEF1F6] pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white shadow-sm">
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-bold text-[#111827]">{displayName}</div>
            <div className="text-[11px] font-medium text-[#9CA3AF]">Finance Controller</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-[13px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
