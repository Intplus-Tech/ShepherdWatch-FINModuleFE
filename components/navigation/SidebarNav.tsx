import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeftRight,
  Folder,
  GitBranch,
  LayoutDashboard,
  Scale,
  Settings,
  Users,
  Wallet,
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
  { label: "Dashboard", href: "/director-screen/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/director-screen/transaction", icon: ArrowLeftRight },
  { label: "Budgeting", href: "/director-screen/budgeting", icon: Wallet },
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
        "w-[220px] min-h-screen bg-white border border-[#EEF1F6] rounded-[6px] px-4 py-5 flex flex-col",
        className
      )}
    >
      <div className="flex items-center gap-2 pb-5">
        <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={22} height={22} />
        <div>
          <div className="text-[12px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
          <div className="text-[9px] text-[#9CA3AF]">Super Admin</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.href === activeHref
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-[11px] text-[#6B7280] transition-colors",
                isActive && "bg-[#E9EEFF] text-[#3B5BDB] font-medium"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <div className="h-7 w-7 rounded-full overflow-hidden bg-[#E8EDFF]">
          {user.avatarSrc ? (
            <Image src={user.avatarSrc} alt={user.name} width={28} height={28} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="text-[9px]">
          <div className="font-semibold text-[#111827]">{user.name}</div>
          <div className="text-[#9CA3AF]">{user.role}</div>
        </div>
      </div>
    </aside>
  )
}
