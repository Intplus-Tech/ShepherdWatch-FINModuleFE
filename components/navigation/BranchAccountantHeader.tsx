import { Bell, ChevronDown } from "lucide-react"
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
        <div className="text-[10px] text-[#9CA3AF]">Dashboard</div>
        <h1 className="text-[14px] font-semibold text-[#111827]">{title}</h1>
        {subtitle ? <p className="text-[9px] text-[#9CA3AF]">{subtitle}</p> : null}
      </div>
      {rightSlot ?? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
            January 2024
            <ChevronDown className="h-3 w-3" />
          </Button>
          <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
            <Bell className="h-3.5 w-3.5" />
          </div>
        </div>
      )}
    </div>
  )
}
