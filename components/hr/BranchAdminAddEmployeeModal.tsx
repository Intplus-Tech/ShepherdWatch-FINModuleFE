"use client"

import { useEffect, useState } from "react"
import { Info, Loader2, UserPlus, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { UserAccountPicker } from "@/components/hr/UserAccountPicker"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useBranchId } from "@/components/hooks/hr/useBranchId"
import { useCreateEmployee } from "@/components/hooks/hr/useHrEmployees"

const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-[#2563EB]" />
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#111827]">{children}</h3>
    </div>
  )
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function BranchAdminAddEmployeeModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const branchId = useBranchId()
  const createEmployee = useCreateEmployee()

  const [userId, setUserId] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [phone, setPhone] = useState("")
  const [hireDate, setHireDate] = useState(todayIso())
  const [salary, setSalary] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setUserId("")
    setJobTitle("")
    setDepartment("")
    setPhone("")
    setHireDate(todayIso())
    setSalary("")
    setFormError(null)
    createEmployee.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSave() {
    setFormError(null)

    if (!userId) {
      setFormError("Select the staff member's user account.")
      return
    }
    if (jobTitle.trim().length < 2) {
      setFormError("Enter a job title.")
      return
    }
    if (!branchId) {
      setFormError("Your account has no branch assigned, so this can't be saved.")
      return
    }

    const parsedSalary = Number(salary.replace(/,/g, ""))

    try {
      await createEmployee.mutateAsync({
        userId,
        branchId,
        jobTitle: jobTitle.trim(),
        department: department.trim() || undefined,
        phone: phone.trim() || undefined,
        hireDate: new Date(hireDate).toISOString(),
        salary: Number.isFinite(parsedSalary) && parsedSalary > 0 ? parsedSalary : undefined,
      })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error = formError ?? (createEmployee.error ? hrErrorMessage(createEmployee.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#2563EB]">
            <UserPlus className="h-5 w-5" />
          </span>
          <h2 className="text-[20px] font-bold text-[#111827]">Add New Employee</h2>
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
      <div className="flex max-h-[68vh] flex-col gap-6 overflow-y-auto px-6 py-5">
        {/* Staff account */}
        <section>
          <SectionHeading>Staff Account</SectionHeading>
          <div className="mt-4">
            <label className={labelCls}>User Account</label>
            <UserAccountPicker
              value={userId}
              onChange={setUserId}
              branchId={branchId || undefined}
              disabled={createEmployee.isPending}
            />
            <p className="mt-1.5 text-[11px] text-[#9CA3AF]">
              An employee record attaches to an existing ShepherdWatch account. If the person has
              no account yet, invite them from User Management first.
            </p>
          </div>
        </section>

        {/* Employment Details */}
        <section>
          <SectionHeading>Employment Details</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Job Title</label>
              <input
                className={inputCls}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Administrator"
              />
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <input
                className={inputCls}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Administration"
              />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 000-000-0000"
              />
            </div>
            <div>
              <label className={labelCls}>Date Hired</label>
              <input
                type="date"
                className={inputCls}
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Basic Monthly Salary</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                  ₦
                </span>
                <input
                  className="w-full rounded-md border border-[#E5E7EB] bg-white py-2.5 pl-7 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Info note */}
        <div className="flex items-start gap-3 rounded-lg bg-[#EEF2FF] p-4 text-[#4B5563]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
          <p className="text-[12px] leading-relaxed">
            Saving generates a ShepherdWatch employee ID automatically. The profile integrity score
            is calculated from how complete the record is, so filling in salary and department now
            saves a follow-up later.
          </p>
        </div>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={createEmployee.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={createEmployee.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {createEmployee.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Employee
        </button>
      </div>
    </ModalShell>
  )
}
