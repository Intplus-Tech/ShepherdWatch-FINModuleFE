"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useBranchId } from "@/components/hooks/hr/useBranchId"
import { useCreateJobRequisition } from "@/components/hooks/hr/useHrJobRequisitions"
import { JOB_REQUISITION_PRIORITY_LABELS } from "@/lib/hr/normalize"
import { JOB_REQUISITION_PRIORITIES, type JobRequisitionPriority } from "@/lib/hr/types"
import { cn } from "@/lib/utils"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
const inputCls =
  "mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
const fieldCls = `${inputCls} h-[42px]`

const DEPARTMENTS = [
  "Youth Ministry",
  "Operations & Finance",
  "Facility Management",
  "Creative Arts",
  "Pastoral Care",
  "Administration",
]

export default function BranchLeadNewRoleRequisitionModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const branchId = useBranchId()
  const createRequisition = useCreateJobRequisition()

  const [roleTitle, setRoleTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [salary, setSalary] = useState("")
  const [priority, setPriority] = useState<JobRequisitionPriority>("normal")
  const [startDate, setStartDate] = useState("")
  const [justification, setJustification] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setRoleTitle("")
    setDepartment("")
    setSalary("")
    setPriority("normal")
    setStartDate("")
    setJustification("")
    setFormError(null)
    createRequisition.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSubmit() {
    setFormError(null)

    const salarySuggested = Number(salary.replace(/[^0-9.]/g, ""))

    if (roleTitle.trim().length < 2) {
      setFormError("Enter the role title.")
      return
    }
    if (!department) {
      setFormError("Choose a department.")
      return
    }
    if (!Number.isFinite(salarySuggested) || salarySuggested <= 0) {
      setFormError("Enter a suggested salary greater than zero.")
      return
    }
    if (!startDate) {
      setFormError("Set an expected start date.")
      return
    }
    if (justification.trim().length < 5) {
      setFormError("Give a justification of at least five characters.")
      return
    }
    if (!branchId) {
      setFormError("Your account has no branch assigned, so this can't be submitted.")
      return
    }

    try {
      await createRequisition.mutateAsync({
        roleTitle: roleTitle.trim(),
        department,
        branchId,
        salarySuggested,
        priority,
        expectedStartDate: new Date(startDate).toISOString(),
        justification: justification.trim(),
      })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error =
    formError ?? (createRequisition.error ? hrErrorMessage(createRequisition.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">New Role Requisition</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Submit a staffing request for approval by the Regional Director.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex max-h-[68vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Role title */}
        <div>
          <label className={labelCls}>Role Title</label>
          <input
            className={fieldCls}
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g. Associate Pastor for Community Outreach"
            disabled={createRequisition.isPending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Department</label>
            <select
              className={fieldCls}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={createRequisition.isPending}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Salary Suggested</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                ₦
              </span>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                inputMode="decimal"
                placeholder="500,000"
                disabled={createRequisition.isPending}
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-7 pr-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Priority Level</label>
            <div className="mt-1.5 flex items-center gap-4">
              {JOB_REQUISITION_PRIORITIES.map((p) => (
                <label key={p} className="flex items-center gap-2 text-[13px]">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    disabled={createRequisition.isPending}
                    className={cn("h-4 w-4 accent-[#2563EB]")}
                  />
                  {JOB_REQUISITION_PRIORITY_LABELS[p]}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Expected Start Date</label>
            <input
              type="date"
              className={fieldCls}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={createRequisition.isPending}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Justification / Reason for Hire</label>
          <textarea
            rows={4}
            className={`${inputCls} py-2.5`}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Briefly describe the necessity for this role and its impact on the branch mission..."
            disabled={createRequisition.isPending}
          />
        </div>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={createRequisition.isPending}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createRequisition.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {createRequisition.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Submit to Director
        </button>
      </div>
    </ModalShell>
  )
}
