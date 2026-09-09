"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useJobRequisitionMutations } from "@/components/hooks/useHrJobRequisitions"
import { useHrScope } from "@/lib/hr/useHrScope"
import { useToast } from "@/components/ui/toast"
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

/** Radio labels map onto the API's priority enum. */
const PRIORITY_LEVELS = [
  { value: "medium", label: "Normal" },
  { value: "high", label: "Urgent" },
  { value: "critical", label: "Critical" },
]

/**
 * Files a job requisition for director review. Used by both the branch admin
 * and the branch pastor — the endpoint and the required fields are the same.
 */
export default function BranchAdminNewRoleRequisitionModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}) {
  const scope = useHrScope()
  const { pushToast } = useToast()
  const { createRequisition } = useJobRequisitionMutations()

  const [roleTitle, setRoleTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [salary, setSalary] = useState("")
  const [priority, setPriority] = useState("medium")
  const [expectedStartDate, setExpectedStartDate] = useState("")
  const [justification, setJustification] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setRoleTitle("")
    setDepartment("")
    setSalary("")
    setPriority("medium")
    setExpectedStartDate("")
    setJustification("")
    setError(null)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    setError(null)

    const branchId = scope.branchId || scope.ownBranchId
    if (!branchId) {
      setError("No branch is attached to your account, so this cannot be filed.")
      return
    }
    if (!roleTitle.trim()) return setError("Give the role a title.")
    if (!department.trim()) return setError("Choose the department.")
    if (!expectedStartDate) return setError("Set the expected start date.")
    if (!justification.trim()) return setError("Explain why this role is needed.")

    const salaryValue = Number(salary)
    if (!Number.isFinite(salaryValue) || salaryValue <= 0) {
      return setError("Enter the suggested monthly salary.")
    }

    setSaving(true)
    try {
      await createRequisition({
        roleTitle: roleTitle.trim(),
        department: department.trim(),
        branchId,
        salarySuggested: salaryValue,
        priority,
        expectedStartDate,
        justification: justification.trim(),
      })
      pushToast("Requisition submitted for director review", "success")
      reset()
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit this requisition.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-xl">
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
          onClick={handleClose}
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
          <label className={labelCls} htmlFor="requisition-role">
            Role Title
          </label>
          <input
            id="requisition-role"
            type="text"
            value={roleTitle}
            onChange={(event) => setRoleTitle(event.target.value)}
            placeholder="e.g. Associate Pastor for Community Outreach"
            className={fieldCls}
          />
        </div>

        {/* Department + Salary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="requisition-department">
              Department
            </label>
            <select
              id="requisition-department"
              className={fieldCls}
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
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
            <label className={labelCls} htmlFor="requisition-salary">
              Salary Suggested
            </label>
            <input
              id="requisition-salary"
              type="text"
              inputMode="decimal"
              value={salary}
              onChange={(event) => setSalary(event.target.value.replace(/[^\d.]/g, ""))}
              placeholder="500000"
              className={fieldCls}
            />
          </div>
        </div>

        {/* Priority + Expected start */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className={labelCls}>Priority Level</span>
            <div className="mt-2 flex flex-col gap-2">
              {PRIORITY_LEVELS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-[13px]">
                  <input
                    type="radio"
                    name="priority-level"
                    value={option.value}
                    checked={priority === option.value}
                    onChange={() => setPriority(option.value)}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  <span
                    className={cn(
                      "font-medium",
                      option.value === "critical" ? "text-rose-600" : "text-[#111827]"
                    )}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="requisition-start">
              Expected Start Date
            </label>
            <input
              id="requisition-start"
              type="date"
              value={expectedStartDate}
              onChange={(event) => setExpectedStartDate(event.target.value)}
              className={fieldCls}
            />
          </div>
        </div>

        {/* Justification */}
        <div>
          <label className={labelCls} htmlFor="requisition-justification">
            Justification / Reason for Hire
          </label>
          <textarea
            id="requisition-justification"
            rows={4}
            value={justification}
            onChange={(event) => setJustification(event.target.value)}
            placeholder="Briefly describe the necessity for this role and its impact on the branch mission..."
            className={inputCls + " py-2.5"}
          />
        </div>

        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Submitting…" : "Submit to Director"}
        </button>
      </div>
    </ModalShell>
  )
}
