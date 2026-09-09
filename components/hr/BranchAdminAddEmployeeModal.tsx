"use client"

import { useMemo, useState } from "react"
import { UserPlus, X, Info, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useEmployeeMutations } from "@/components/hooks/useHrEmployees"
import { useUsers } from "@/components/hooks/useUsers"
import { useHrScope } from "@/lib/hr/useHrScope"
import { useToast } from "@/components/ui/toast"

const labelCls =
  "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-[#2563EB]" />
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#111827]">
        {children}
      </h3>
    </div>
  )
}

type UserOption = { id: string; label: string }

/**
 * An employee profile hangs off an existing user account — the HR API takes a
 * `userId`, not a name and email — so the form links an invited user rather
 * than re-typing their identity. Anyone not yet in the list has to be invited
 * from Users first.
 */
export default function BranchAdminAddEmployeeModal({
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
  const { createEmployee } = useEmployeeMutations()

  const [userId, setUserId] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [hireDate, setHireDate] = useState("")
  const [salary, setSalary] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("")
  const [maritalStatus, setMaritalStatus] = useState("")
  const [address, setAddress] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    limit: 100,
    branchId: scope.branchId || undefined,
  })

  const userOptions = useMemo<UserOption[]>(() => {
    const raw = usersResponse as { data?: unknown } | undefined
    const rows = Array.isArray(raw?.data) ? raw?.data : []
    return rows
      .map((entry) => {
        const user = (entry ?? {}) as Record<string, unknown>
        const id = String(user._id ?? user.id ?? "")
        const name =
          String(user.fullName ?? "") ||
          `${String(user.firstName ?? "")} ${String(user.lastName ?? "")}`.trim()
        const email = String(user.email ?? "")
        if (!id) return null
        return { id, label: [name || "Unnamed user", email].filter(Boolean).join(" · ") }
      })
      .filter((option): option is UserOption => Boolean(option))
  }, [usersResponse])

  const reset = () => {
    setUserId("")
    setJobTitle("")
    setDepartment("")
    setHireDate("")
    setSalary("")
    setPhone("")
    setGender("")
    setMaritalStatus("")
    setAddress("")
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
      setError("No branch is attached to your account, so the staff record cannot be filed.")
      return
    }
    if (!jobTitle.trim()) {
      setError("Job title is required.")
      return
    }

    setSaving(true)
    try {
      await createEmployee({
        userId: userId || undefined,
        branchId,
        jobTitle: jobTitle.trim(),
        department: department.trim() || undefined,
        salary: salary ? Number(salary) : undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        gender: gender || undefined,
        maritalStatus: maritalStatus || undefined,
        hireDate: hireDate || undefined,
      })
      pushToast("Employee profile created", "success")
      reset()
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the employee profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-2xl">
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
          onClick={handleClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex max-h-[68vh] flex-col gap-6 overflow-y-auto px-6 py-5">
        <section>
          <SectionHeading>Staff Account</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="employee-user">
                Linked User Account
              </label>
              <select
                id="employee-user"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className={inputCls}
              >
                <option value="">
                  {usersLoading ? "Loading user accounts…" : "Select an invited user (optional)"}
                </option>
                {userOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-[#9CA3AF]">
                Names and emails come from the user account. Invite the person under Users first
                if they are not listed.
              </p>
            </div>
          </div>
        </section>

        <section>
          <SectionHeading>Employment Details</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="employee-job-title">
                Job Title
              </label>
              <input
                id="employee-job-title"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className={inputCls}
                placeholder="e.g. Senior Administrator"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="employee-department">
                Department
              </label>
              <input
                id="employee-department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className={inputCls}
                placeholder="e.g. Administration & Protocol"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="employee-phone">
                Phone Number
              </label>
              <input
                id="employee-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputCls}
                placeholder="+234 000-000-0000"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="employee-hire-date">
                Date Hired
              </label>
              <input
                id="employee-hire-date"
                type="date"
                value={hireDate}
                onChange={(event) => setHireDate(event.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="employee-gender">
                Gender
              </label>
              <select
                id="employee-gender"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className={inputCls}
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="employee-marital-status">
                Marital Status
              </label>
              <select
                id="employee-marital-status"
                value={maritalStatus}
                onChange={(event) => setMaritalStatus(event.target.value)}
                className={inputCls}
              >
                <option value="">Not specified</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="employee-salary">
                Basic Monthly Salary
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                  ₦
                </span>
                <input
                  id="employee-salary"
                  value={salary}
                  onChange={(event) => setSalary(event.target.value.replace(/[^\d.]/g, ""))}
                  inputMode="decimal"
                  className="w-full rounded-md border border-[#E5E7EB] bg-white py-2.5 pl-7 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="employee-address">
                Residential Address
              </label>
              <input
                id="employee-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className={inputCls}
                placeholder="e.g. 12 Isaac John Street, Ikeja, Lagos"
              />
            </div>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-lg bg-[#EEF2FF] p-4 text-[#4B5563]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
          <p className="text-[12px] leading-relaxed">
            Saving files the staff record against{" "}
            {scope.branchName || "your branch"} and generates a ShepherdWatch employee ID. The
            profile integrity score starts low until documents and bank details are added.
          </p>
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
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Saving…" : "Save Employee Record"}
        </button>
      </div>
    </ModalShell>
  )
}
