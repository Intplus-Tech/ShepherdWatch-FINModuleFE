import { Download } from "lucide-react"

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

      {/* Branches + Month filters are intentionally only on the dashboard.
          Other screens keep just the currency switcher and Export. */}
      {rightSlot ?? (
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      )}
    </div>
  )
}
