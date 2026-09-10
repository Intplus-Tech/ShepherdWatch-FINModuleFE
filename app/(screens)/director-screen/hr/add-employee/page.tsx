"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Contact,
  Loader2,
  User,
  Wallet,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { UserAccountPicker } from "@/components/hr/UserAccountPicker"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useBranches } from "@/components/hooks/useUsers"
import { useCreateEmployee } from "@/components/hooks/hr/useHrEmployees"
import { cn } from "@/lib/utils"

type StepId = "personal" | "contact" | "employment" | "compensation"

type Step = {
  id: StepId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: Step[] = [
  { id: "personal", label: "Personal Information", icon: User },
  { id: "contact", label: "Contact Details", icon: Contact },
  { id: "employment", label: "Employment Details", icon: Briefcase },
  { id: "compensation", label: "Compensation & Benefits", icon: Wallet },
]

const LABEL_CLASS =
  "block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5"
const FIELD_CLASS =
  "h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[14px] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"

type FormState = {
  userId: string
  dateOfBirth: string
  gender: string
  nationality: string
  maritalStatus: string
  phone: string
  address: string
  stateOfOrigin: string
  jobTitle: string
  department: string
  branchId: string
  hireDate: string
  salary: string
  allowanceTitle: string
  allowanceAmount: string
  taxId: string
  pensionId: string
  bankName: string
  accountNumber: string
  accountName: string
}

const INITIAL_FORM: FormState = {
  userId: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Nigerian",
  maritalStatus: "single",
  phone: "",
  address: "",
  stateOfOrigin: "",
  jobTitle: "",
  department: "",
  branchId: "",
  hireDate: new Date().toISOString().slice(0, 10),
  salary: "",
  allowanceTitle: "",
  allowanceAmount: "",
  taxId: "",
  pensionId: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
}

type BranchOption = { id: string; name: string }

function readBranches(list: unknown): BranchOption[] {
  if (!Array.isArray(list)) return []
  return list
    .map((entry) => {
      const branch = (entry ?? {}) as Record<string, unknown>
      return {
        id: String(branch._id ?? branch.id ?? ""),
        name: String(branch.name ?? "Unnamed branch"),
      }
    })
    .filter((branch) => branch.id)
}

export default function Page() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState<StepId>("personal")
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const branchesQuery = useBranches()
  const createEmployee = useCreateEmployee()

  const branches = useMemo(() => readBranches(branchesQuery.data), [branchesQuery.data])

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const activeIndex = STEPS.findIndex((s) => s.id === activeStep)
  const isLastStep = activeIndex === STEPS.length - 1

  /** Per-step validation, so the wizard blocks before the final submit fails. */
  function validateStep(step: StepId): string | null {
    if (step === "personal" && !form.userId) {
      return "Select the staff member's user account."
    }
    if (step === "employment") {
      if (form.jobTitle.trim().length < 2) return "Enter a job title."
      if (!form.branchId) return "Choose a branch."
      if (!form.hireDate) return "Set a hire date."
    }
    return null
  }

  async function handleSubmit() {
    setFormError(null)

    for (const step of STEPS) {
      const problem = validateStep(step.id)
      if (problem) {
        setActiveStep(step.id)
        setFormError(problem)
        return
      }
    }

    const salary = Number(form.salary.replace(/[^0-9.]/g, ""))

    try {
      await createEmployee.mutateAsync({
        userId: form.userId,
        branchId: form.branchId,
        jobTitle: form.jobTitle.trim(),
        department: form.department.trim() || undefined,
        hireDate: new Date(form.hireDate).toISOString(),
        dateOfBirth: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : undefined,
        gender: form.gender === "male" || form.gender === "female" ? form.gender : undefined,
        maritalStatus: form.maritalStatus || undefined,
        nationality: form.nationality.trim() || undefined,
        stateOfOrigin: form.stateOfOrigin.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        salary: Number.isFinite(salary) && salary > 0 ? salary : undefined,
        taxId: form.taxId.trim() || undefined,
        pensionId: form.pensionId.trim() || undefined,
        bankDetails: form.bankName.trim()
          ? {
              bankName: form.bankName.trim(),
              accountNumber: form.accountNumber.trim(),
              accountName: form.accountName.trim(),
            }
          : undefined,
        qualifications: undefined,
      })
      router.push("/director-screen/hr/employee-directory")
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  function goNext() {
    const problem = validateStep(activeStep)
    if (problem) {
      setFormError(problem)
      return
    }
    setFormError(null)
    if (isLastStep) {
      handleSubmit()
    } else {
      setActiveStep(STEPS[activeIndex + 1].id)
    }
  }

  function goBack() {
    setFormError(null)
    if (activeIndex > 0) setActiveStep(STEPS[activeIndex - 1].id)
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/employee-directory"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Back"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Add Employee
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            {/* Steps rail */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5 lg:col-span-1">
              <h2 className="text-[16px] font-bold text-[#111827]">Steps</h2>
              <div className="mt-4 flex flex-col gap-1">
                {STEPS.map((step, index) => {
                  const Icon = step.icon
                  const active = step.id === activeStep
                  const done = index < activeIndex
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors",
                        active
                          ? "bg-[#EEF2FF] font-semibold text-[#3B5BDB]"
                          : done
                            ? "text-emerald-600 hover:bg-[#F8FAFC]"
                            : "text-[#6B7280] hover:bg-[#F8FAFC]",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {step.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form panel */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-6 lg:col-span-3">
              <h2 className="text-[16px] font-bold text-[#111827]">
                {STEPS[activeIndex].label}
              </h2>

              <div className="mt-5">
                {activeStep === "personal" && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>User Account</label>
                      <UserAccountPicker
                        value={form.userId}
                        onChange={(userId) => setForm((prev) => ({ ...prev, userId }))}
                        disabled={createEmployee.isPending}
                      />
                      <p className="mt-1.5 text-[11px] text-[#9CA3AF]">
                        An employee record attaches to an existing ShepherdWatch account. Invite
                        the person from User Management first if they have none.
                      </p>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Date of Birth</label>
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={set("dateOfBirth")}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Gender</label>
                      <select value={form.gender} onChange={set("gender")} className={FIELD_CLASS}>
                        <option value="">Select…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Nationality</label>
                      <input
                        type="text"
                        value={form.nationality}
                        onChange={set("nationality")}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Marital Status</label>
                      <select
                        value={form.maritalStatus}
                        onChange={set("maritalStatus")}
                        className={FIELD_CLASS}
                      >
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeStep === "contact" && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS}>Phone Number</label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="+234 000-000-0000"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>State of Origin</label>
                      <input
                        type="text"
                        value={form.stateOfOrigin}
                        onChange={set("stateOfOrigin")}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Home Address</label>
                      <textarea
                        value={form.address}
                        onChange={set("address")}
                        className={TEXTAREA_CLASS}
                      />
                    </div>
                  </div>
                )}

                {activeStep === "employment" && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS}>Job Title</label>
                      <input
                        type="text"
                        value={form.jobTitle}
                        onChange={set("jobTitle")}
                        placeholder="e.g. Senior Accountant"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Department</label>
                      <input
                        type="text"
                        value={form.department}
                        onChange={set("department")}
                        placeholder="e.g. Finance"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Branch</label>
                      <select
                        value={form.branchId}
                        onChange={set("branchId")}
                        disabled={branchesQuery.isLoading}
                        className={FIELD_CLASS}
                      >
                        <option value="">
                          {branchesQuery.isLoading ? "Loading branches…" : "Select a branch"}
                        </option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                      {branchesQuery.error && (
                        <p className="mt-1.5 text-[12px] text-red-600">
                          Couldn&apos;t load branches.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Hire Date</label>
                      <input
                        type="date"
                        value={form.hireDate}
                        onChange={set("hireDate")}
                        className={FIELD_CLASS}
                      />
                    </div>
                  </div>
                )}

                {activeStep === "compensation" && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS}>Basic Salary</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={form.salary}
                        onChange={set("salary")}
                        placeholder="₦ 0.00"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Tax ID</label>
                      <input
                        type="text"
                        value={form.taxId}
                        onChange={set("taxId")}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Pension ID</label>
                      <input
                        type="text"
                        value={form.pensionId}
                        onChange={set("pensionId")}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Bank Name</label>
                      <input
                        type="text"
                        value={form.bankName}
                        onChange={set("bankName")}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Account Name</label>
                      <input
                        type="text"
                        value={form.accountName}
                        onChange={set("accountName")}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Account Number</label>
                      <input
                        type="text"
                        value={form.accountNumber}
                        onChange={set("accountNumber")}
                        className={FIELD_CLASS}
                      />
                    </div>
                  </div>
                )}
              </div>

              {formError && (
                <p className="mt-5 text-[12px] font-medium text-red-600">{formError}</p>
              )}

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-[#EEF1F6] pt-5">
                {activeIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={createEmployee.isPending}
                    className="border border-[#E5E7EB] bg-white text-[#4B5563] rounded-md px-4 py-2 text-[12px] font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={createEmployee.isPending}
                  className="inline-flex items-center gap-1.5 bg-[#111827] text-white rounded-md px-5 py-2.5 text-[13px] font-semibold hover:bg-[#1f2937] disabled:opacity-60"
                >
                  {createEmployee.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isLastStep ? "Create Employee" : "Save & Continue"}
                  {!isLastStep && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
