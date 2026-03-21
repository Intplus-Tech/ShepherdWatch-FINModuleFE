import { Bell, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BranchAccountantHeader({
  title,
  subtitle,
  rightSlot,
}: {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-[18px] font-semibold text-[#111827]">{title}</h1>
        {subtitle ? <p className="text-[11px] text-[#9CA3AF] mt-1">{subtitle}</p> : null}
      </div>
      {rightSlot ?? (
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-[240px] items-center gap-2 rounded-lg bg-gray-50 px-3 text-[#6B7280] border border-gray-100 focus-within:ring-1 focus-within:ring-blue-100">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-gray-400 text-gray-800"
            />
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-[#6B7280] hover:bg-gray-50 transition-colors">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-[10px] top-[10px] h-[6px] w-[6px] rounded-full bg-[#EF4444] border hover:border-white"></span>
          </button>
        </div>
      )}
    </div>
  )
}
