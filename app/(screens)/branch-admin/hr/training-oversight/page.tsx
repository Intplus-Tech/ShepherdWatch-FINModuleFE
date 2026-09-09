"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { useHrTrainingRecord } from "@/components/hooks/useHrTrainings"
import { useToast } from "@/components/ui/toast"
import { TRAINING_RECORD_LABELS, formatDate, initials, statusLabel } from "@/lib/hr/display"
import { cn } from "@/lib/utils"

const cardCls = "rounded-xl border border-[#EEF1F6] bg-white p-5"
const tileLabelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TrainingOversightScreen />
    </Suspense>
  )
}

function TrainingOversightScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = searchParams.get("recordId") ?? ""
  const [mobileOpen, setMobileOpen] = useState(false)

  const { pushToast } = useToast()
  const { record, loading, error } = useHrTrainingRecord(recordId)

  const certified = record?.status === "certified"

  const tiles = [
    { label: "Completion Date", value: formatDate(record?.issuedAt ?? "") },
    {
      label: "Renewal Date",
      value: formatDate(record?.renewalDue ?? ""),
      note: record?.renewalDue ? "Renewal scheduled" : undefined,
    },
    { label: "Score", value: record?.score ? `${record.score}%` : "—" },
  ]

  const handleDownload = () => {
    if (!record?.certificateUrl) {
      pushToast("No certificate has been issued for this record yet", "info")
      return
    }
    window.open(record.certificateUrl, "_blank", "noopener,noreferrer")
  }

  const handleShare = async () => {
    if (!record?.certificateUrl) {
      pushToast("No certificate has been issued for this record yet", "info")
      return
    }
    try {
      await navigator.clipboard.writeText(record.certificateUrl)
      pushToast("Certificate link copied", "success")
    } catch {
      pushToast("Could not copy the link", "error")
    }
  }

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
                  {initials(record?.employeeName ?? "")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[24px] font-bold text-[#111827]">
                      {record?.trainingTitle || (loading ? "Loading…" : "Training Record")}
                    </h1>
                    {record ? (
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                          certified
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        ● {statusLabel(TRAINING_RECORD_LABELS, record.status)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    {record
                      ? `Assigned to: ${record.employeeName || "Staff"}`
                      : error || (recordId ? "" : "Open a participant record from the registry.")}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4"
                  >
                    <p className={tileLabelCls}>{tile.label}</p>
                    <p className="mt-2 text-[16px] font-bold text-[#111827]">{tile.value}</p>
                    {tile.note && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <AlertTriangle className="h-3 w-3" />
                        {tile.note}
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
                {certified
                  ? `This record confirms that ${record?.employeeName || "the staff member"} has met all institutional requirements for ${record?.trainingTitle || "this training"}.`
                  : "A certificate is issued once the participant is marked certified."}
              </p>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!record?.certificateUrl}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-[12px] font-semibold text-[#111827] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Download Certificate (PDF)
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={!record?.certificateUrl}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/25 bg-transparent px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
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
