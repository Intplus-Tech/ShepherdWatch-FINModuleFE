import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeftRight,
  Folder,
  GitBranch,
  LayoutGrid,
  Scale,
  Settings,
  Users,
  WalletCards,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SidebarItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export type SidebarUser = {
  name: string
  role: string
  avatarSrc?: string
}

const defaultItems: SidebarItem[] = [
  { label: "Dashboard", href: "/director-screen/dashboard", icon: LayoutGrid },
  { label: "Transactions", href: "/director-screen/transaction", icon: ArrowLeftRight },
  { label: "Budgeting", href: "/director-screen/budgeting", icon: WalletCards },
  { label: "Compliance", href: "/director-screen/compliance", icon: Scale },
  { label: "Asset", href: "/director-screen/assets", icon: Folder },
  { label: "Branch Management", href: "/director-screen/branch-management", icon: GitBranch },
  { label: "Users", href: "/director-screen/users", icon: Users },
  { label: "Settings", href: "/director-screen/settings", icon: Settings },
]

export default function SidebarNav({
  items = defaultItems,
  activeHref = "/director-screen/dashboard",
  user = { name: "Rev. Thomas M.", role: "Director", avatarSrc: "/images/Beared%20Guy02-min%201.jpg" },
  className,
}: {
  items?: SidebarItem[]
  activeHref?: string
  user?: SidebarUser
  className?: string
}) {
  return (
    <aside
      className={cn(
        "w-[260px] min-h-screen bg-[#FAFBFF] border-r border-[#EEF1F6] px-6 pt-6 pb-5 flex flex-col",
        className
      )}
    >
      <div className="flex flex-col gap-1 pb-5">
        <div className="flex items-center gap-2">
          <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={22} height={22} />
          <div className="text-[13px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
        </div>
        <span className="text-[10px] font-medium text-[#3B5BDB] ml-7">Super Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.href === activeHref
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-[#3B5BDB] text-white shadow-sm"
                    : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            )}
          )}
        </div>
      </nav>

      <div className="mt-auto border-t border-[#EEF1F6] pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0">
            {user.avatarSrc ? (
              <Image src={user.avatarSrc} alt={user.name} width={40} height={40} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[#111827]">{user.name}</span>
            <span className="text-[11px] font-medium text-[#6B7280]">{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
