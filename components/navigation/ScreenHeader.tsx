import { Building, Calendar, ChevronDown, Download } from "lucide-react"

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
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div className="pt-1">
        <h1 className="text-[24px] leading-none font-bold text-[#111827]">{title}</h1>
        {subtitle ? (
          <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">{subtitle}</p>
        ) : null}
      </div>

      {rightSlot ?? (
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
            <Building className="h-4 w-4 text-[#6B7280]" />
            All Branches
            <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
          </button>

          <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
            <Calendar className="h-4 w-4 text-[#6B7280]" />
            This Month
            <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
          </button>

          <div className="flex items-center rounded-md border border-[#E5E7EB] bg-white p-0.5 shadow-sm">
            <button className="rounded px-3 py-1.5 text-[11px] font-bold bg-[#3B5BDB] text-white">NGN</button>
            <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">USD</button>
            <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">EUR</button>
          </div>

          <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      )}
    </div>
  )
}
