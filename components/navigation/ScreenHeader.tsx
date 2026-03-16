import { Bell, ChevronDown, Download, Filter, Search } from "lucide-react"

export default function ScreenHeader({
  title,
  subtitle,
  rightSlot,
}: {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-[18px] font-semibold text-[#111827]">{title}</h1>
        {subtitle ? (
          <p className="text-[11px] text-[#9CA3AF]">{subtitle}</p>
        ) : null}
      </div>

      {rightSlot ?? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#6B7280]">
            <Search className="h-4 w-4" />
            Search
          </div>
          <button className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#6B7280]">
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#6B7280]">
            This Month
            <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-2 rounded-[10px] bg-[#3B5BDB] px-3 py-2 text-[11px] text-white">
            <Download className="h-4 w-4" />
            Export
          </button>
          <div className="h-8 w-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
            <Bell className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  )
}
