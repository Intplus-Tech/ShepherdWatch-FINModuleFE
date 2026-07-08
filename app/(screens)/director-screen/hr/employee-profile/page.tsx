"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { cn } from "@/lib/utils"

import { StatusBadge, btnRoseOutline } from "@/components/hr/profile/shared"
import GeneralInfoTab from "@/components/hr/profile/GeneralInfoTab"
import PayrollTab from "@/components/hr/profile/PayrollTab"
import LoansTab from "@/components/hr/profile/LoansTab"
import PerformanceTab from "@/components/hr/profile/PerformanceTab"
import LeaveTab from "@/components/hr/profile/LeaveTab"
import DocumentsTab from "@/components/hr/profile/DocumentsTab"

import LeaveDetailModal from "@/components/hr/profile/LeaveDetailModal"
import UploadDocumentModal from "@/components/hr/profile/UploadDocumentModal"
import LoanApplicationDetailModal from "@/components/hr/profile/LoanApplicationDetailModal"
import NewLoanApplicationModal from "@/components/hr/profile/NewLoanApplicationModal"
import DocumentPreviewModal from "@/components/hr/profile/DocumentPreviewModal"
import DeleteDocumentModal from "@/components/hr/profile/DeleteDocumentModal"

const TABS = [
  "GENERAL INFO",
  "PAYROLL",
  "LOANS",
  "PERFORMANCE",
  "LEAVE",
  "DOCUMENTS",
] as const

type Tab = (typeof TABS)[number]

export default function Page() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("GENERAL INFO")

  const [leaveOpen, setLeaveOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [loanDetailOpen, setLoanDetailOpen] = useState(false)
  const [newLoanOpen, setNewLoanOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/employee-directory"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Back + title */}
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-[24px] font-bold leading-none text-[#111827]">
              Employee Profile
            </h1>
          </div>

          {/* Identity row */}
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-[#EEF1F6] bg-white p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[16px] font-bold text-white">
                OD
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[18px] font-bold text-[#111827]">
                    Oluwaseun Daniels
                  </span>
                  <StatusBadge status="ACTIVE" />
                </div>
                <div className="mt-0.5 text-[13px] text-[#6B7280]">
                  Senior Accountant • Employee ID: SW-2024-089
                </div>
              </div>
            </div>
            <button className={btnRoseOutline}>Initiate Exit Process</button>
          </div>

          {/* Tab bar */}
          <div className="mb-6 border-b border-[#EEF1F6]">
            <nav className="-mb-px flex gap-6 overflow-x-auto">
              {TABS.map((tab) => {
                const active = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "whitespace-nowrap border-b-2 py-3 text-[12px] uppercase tracking-wider transition-colors",
                      active
                        ? "border-[#111827] font-bold text-[#111827]"
                        : "border-transparent font-semibold text-[#6B7280] hover:text-[#111827]"
                    )}
                  >
                    {tab}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Active tab */}
          {activeTab === "GENERAL INFO" && <GeneralInfoTab />}
          {activeTab === "PAYROLL" && <PayrollTab />}
          {activeTab === "LOANS" && (
            <LoansTab
              onNewLoan={() => setNewLoanOpen(true)}
              onViewLoan={() => setLoanDetailOpen(true)}
            />
          )}
          {activeTab === "PERFORMANCE" && <PerformanceTab />}
          {activeTab === "LEAVE" && (
            <LeaveTab onViewLeave={() => setLeaveOpen(true)} />
          )}
          {activeTab === "DOCUMENTS" && (
            <DocumentsTab
              onUpload={() => setUploadOpen(true)}
              onPreview={() => setPreviewOpen(true)}
              onDelete={() => setDeleteOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <LeaveDetailModal open={leaveOpen} onClose={() => setLeaveOpen(false)} />
      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
      <LoanApplicationDetailModal
        open={loanDetailOpen}
        onClose={() => setLoanDetailOpen(false)}
      />
      <NewLoanApplicationModal
        open={newLoanOpen}
        onClose={() => setNewLoanOpen(false)}
      />
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
      <DeleteDocumentModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}
