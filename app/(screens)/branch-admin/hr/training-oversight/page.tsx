"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  Menu,
  ChevronLeft,
  AlertTriangle,
  Download,
  Share2,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { cn } from "@/lib/utils"

const cardCls = "rounded-xl border border-[#EEF1F6] bg-white p-5"
const tileLabelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"

const TILES: { label: string; value: string; note?: string }[] = [
  { label: "Completion Date", value: "Oct 12, 2023" },
  { label: "Renewal Date", value: "Oct 12, 2024", note: "⚠ Expiring in 5 months" },
  { label: "Compliance Score", value: "100%" },
]

export default function Page() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/training-management"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-[15px] font-bold text-[#111827]">Training</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="h-10 w-64 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm"
                placeholder="Search requisitions..."
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#111827]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: Certification detail */}
            <div className={cn(cardCls, "lg:col-span-2")}>
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[16px] font-bold text-[#2563EB]">
                  SJ
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[24px] font-bold text-[#111827]">Child Safety Protocol</h1>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      ● CERTIFIED
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    Assigned to: Sarah Jenkins • Youth Ministry Director
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TILES.map((tile) => (
                  <div
                    key={tile.label}
                    className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4"
                  >
                    <p className={tileLabelCls}>{tile.label}</p>
                    <p className="mt-2 text-[16px] font-bold text-[#111827]">{tile.value}</p>
                    {tile.note && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <AlertTriangle className="h-3 w-3" />
                        {tile.note.replace("⚠ ", "")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Official Certification */}
            <div className="lg:col-span-1 rounded-xl bg-[#111827] p-6 text-white">
              <h2 className="text-[16px] font-bold">Official Certification</h2>
              <p className="mt-3 text-[13px] leading-relaxed text-white/70">
                This record confirms that Sarah Jenkins has met all institutional requirements for
                Child Safety and Protection as of the last assessment.
              </p>

              <button
                type="button"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-[12px] font-semibold text-[#111827] hover:bg-white/90"
              >
                <Download className="h-4 w-4" />
                Download Certificate (PDF)
              </button>
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/25 bg-transparent px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
                Share Record
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
