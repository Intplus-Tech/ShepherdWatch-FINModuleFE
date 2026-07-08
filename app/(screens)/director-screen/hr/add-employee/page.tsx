"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  User,
  Contact,
  Briefcase,
  Wallet,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
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
  fullName: string
  dateOfBirth: string
  gender: string
  nationality: string
  maritalStatus: string
  personalEmail: string
  phoneNumber: string
  homeAddress: string
  city: string
  state: string
  jobTitle: string
  department: string
  branch: string
  employmentType: string
  startDate: string
  basicSalary: string
  allowances: string
  pensionScheme: string
  bankName: string
  accountNumber: string
}

const INITIAL_FORM: FormState = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Nigerian",
  maritalStatus: "Single",
  personalEmail: "",
  phoneNumber: "",
  homeAddress: "",
  city: "",
  state: "",
  jobTitle: "",
  department: "",
  branch: "",
  employmentType: "Full-time",
  startDate: "",
  basicSalary: "",
  allowances: "",
  pensionScheme: "",
  bankName: "",
  accountNumber: "",
}

export default function Page() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState<StepId>("personal")
  const [form, setForm] = useState<FormState>(INITIAL_FORM)

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const activeIndex = STEPS.findIndex((s) => s.id === activeStep)
  const isLastStep = activeIndex === STEPS.length - 1

  const goNext = () => {
    if (!isLastStep) setActiveStep(STEPS[activeIndex + 1].id)
  }
  const goBack = () => {
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Add New Employee
              </h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Maryland LAG Branch Portal • ID Generation Pending
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/director-screen/hr/employee-directory")}
              className="inline-flex items-center gap-1.5 border border-[#E5E7EB] bg-white text-[#4B5563] rounded-md px-4 py-2 text-[12px] font-medium hover:bg-gray-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Roster
            </button>
          </div>

          {/* Body */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            {/* Left: step nav */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-6 h-fit">
              <h2 className="text-[16px] font-bold text-[#111827]">
                Personal Information Management Portal
              </h2>
              <div className="mt-4 flex flex-col gap-1">
                {STEPS.map((step) => {
                  const Icon = step.icon
                  const isActive = step.id === activeStep
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={cn(
                        "rounded-[8px] px-3 py-2.5 text-[13px] flex items-center gap-2 text-left transition-colors",
                        isActive
                          ? "bg-[#EEF2FF] text-[#3B5BDB] font-semibold"
                          : "text-[#6B7280] hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {step.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: active step form */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-6">
              <h2 className="text-[16px] font-bold text-[#111827]">
                {STEPS[activeIndex].label}
              </h2>

              <div className="mt-5">
                {activeStep === "personal" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Full Name</label>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={set("fullName")}
                        placeholder="e.g. Samuel Adebayo"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Date of Birth</label>
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={set("dateOfBirth")}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Gender</label>
                      <select
                        value={form.gender}
                        onChange={set("gender")}
                        className={FIELD_CLASS}
                      >
                        <option value="">Select…</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
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
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeStep === "contact" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    <div>
                      <label className={LABEL_CLASS}>Personal Email</label>
                      <input
                        type="email"
                        value={form.personalEmail}
                        onChange={set("personalEmail")}
                        placeholder="name@example.com"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Phone Number</label>
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={set("phoneNumber")}
                        placeholder="+234 800 000 0000"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Home Address</label>
                      <textarea
                        value={form.homeAddress}
                        onChange={set("homeAddress")}
                        placeholder="Street address"
                        className={TEXTAREA_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>City</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={set("city")}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>State</label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={set("state")}
                        className={FIELD_CLASS}
                      />
                    </div>
                  </div>
                )}

                {activeStep === "employment" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    <div>
                      <label className={LABEL_CLASS}>Job Title</label>
                      <input
                        type="text"
                        value={form.jobTitle}
                        onChange={set("jobTitle")}
                        placeholder="e.g. Branch Accountant"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Department</label>
                      <select
                        value={form.department}
                        onChange={set("department")}
                        className={FIELD_CLASS}
                      >
                        <option value="">Select…</option>
                        <option value="Finance">Finance</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Operations">Operations</option>
                        <option value="Administration">Administration</option>
                        <option value="Ministry">Ministry</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Branch</label>
                      <select
                        value={form.branch}
                        onChange={set("branch")}
                        className={FIELD_CLASS}
                      >
                        <option value="">Select…</option>
                        <option value="Maryland LAG">Maryland LAG</option>
                        <option value="Ikeja">Ikeja</option>
                        <option value="Lekki">Lekki</option>
                        <option value="Abuja">Abuja</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Employment Type</label>
                      <select
                        value={form.employmentType}
                        onChange={set("employmentType")}
                        className={FIELD_CLASS}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Start Date</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={set("startDate")}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className={FIELD_CLASS}
                      />
                    </div>
                  </div>
                )}

                {activeStep === "compensation" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    <div>
                      <label className={LABEL_CLASS}>Basic Salary</label>
                      <input
                        type="number"
                        value={form.basicSalary}
                        onChange={set("basicSalary")}
                        placeholder="0"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Allowances</label>
                      <input
                        type="number"
                        value={form.allowances}
                        onChange={set("allowances")}
                        placeholder="0"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Pension Scheme</label>
                      <select
                        value={form.pensionScheme}
                        onChange={set("pensionScheme")}
                        className={FIELD_CLASS}
                      >
                        <option value="">Select…</option>
                        <option value="Stanbic IBTC Pension">Stanbic IBTC Pension</option>
                        <option value="ARM Pension">ARM Pension</option>
                        <option value="Leadway Pensure">Leadway Pensure</option>
                        <option value="Premium Pension">Premium Pension</option>
                      </select>
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

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-[#EEF1F6] pt-5">
                {activeIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="border border-[#E5E7EB] bg-white text-[#4B5563] rounded-md px-4 py-2 text-[12px] font-medium hover:bg-gray-50"
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 bg-[#111827] text-white rounded-md px-5 py-2.5 text-[13px] font-semibold hover:bg-[#1f2937]"
                >
                  Save &amp; Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
