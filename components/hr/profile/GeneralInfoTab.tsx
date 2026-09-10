"use client"

import { User, Contact, Phone, GraduationCap } from "lucide-react"
import { SectionCard, CardHeading, Field, ProgressBar } from "./shared"
import { HrPanelState } from "@/components/hr/HrDataState"
import { useEmployee } from "@/components/hooks/hr/useHrEmployees"
import { titleCase, userName } from "@/lib/hr/normalize"
import { deref } from "@/lib/hr/normalize"
import { formatDate } from "@/lib/format"

function CardTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF] text-[#3B5BDB]">
        <Icon className="h-4 w-4" />
      </span>
      <CardHeading>{children}</CardHeading>
    </div>
  )
}

export default function GeneralInfoTab({ employeeId }: { employeeId: string | null }) {
  const query = useEmployee(employeeId)
  const employee = query.data

  if (query.isLoading || query.error || !employee) {
    return (
      <HrPanelState
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={!employee}
        emptyTitle="No employee selected"
        emptyDescription="Open a profile from the Employee Directory."
        onRetry={() => query.refetch()}
      />
    )
  }

  const user = deref(employee.userId)
  const integrity = employee.profileIntegrityScore ?? 0
  const emergency = employee.emergencyContact
  const qualifications = employee.qualifications ?? []

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* LEFT (spans 2) */}
      <div className="flex flex-col gap-5 lg:col-span-2">
        {/* Personal Information */}
        <SectionCard>
          <CardTitle icon={User}>Personal Information</CardTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full Name" value={userName(employee.userId, employee.employeeId)} />
            <Field
              label="Date of Birth"
              value={employee.dateOfBirth ? formatDate(employee.dateOfBirth, "long") : "—"}
            />
            <Field label="Gender" value={titleCase(employee.gender)} />
            <Field label="Marital Status" value={titleCase(employee.maritalStatus)} />
            <Field label="Nationality" value={employee.nationality || "—"} />
            <Field label="State of Origin" value={employee.stateOfOrigin || "—"} />
          </div>
        </SectionCard>

        {/* Contact Details */}
        <SectionCard>
          <CardTitle icon={Contact}>Contact Details</CardTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Work Email" value={user?.email || "—"} />
            <Field label="Phone Number" value={employee.phone || "—"} />
            <Field
              label="Home Address"
              value={employee.address || "—"}
              className="sm:col-span-2"
            />
          </div>
        </SectionCard>

        {/* Education & Certifications */}
        <SectionCard>
          <CardTitle icon={GraduationCap}>Education &amp; Certifications</CardTitle>
          {qualifications.length === 0 ? (
            <HrPanelState
              isLoading={false}
              error={null}
              isEmpty
              emptyTitle="No qualifications on file"
              emptyDescription="Add them when editing this employee record."
              className="mt-5 border-0 p-4"
            />
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {qualifications.map((qualification, index) => (
                <div
                  key={`${qualification.degree}-${index}`}
                  className="flex items-start justify-between gap-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-4"
                >
                  <div>
                    <div className="text-[14px] font-semibold text-[#111827]">
                      {qualification.degree}
                    </div>
                    <div className="mt-0.5 text-[13px] text-[#6B7280]">
                      {qualification.institution}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    {qualification.yearObtained}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-5">
        {/* Profile Integrity */}
        <div className="rounded-xl bg-[#111827] p-5 text-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            Profile Integrity
          </div>
          <div className="mt-2 text-[32px] font-bold leading-none">{integrity}%</div>
          <div className="mt-4">
            <ProgressBar
              percent={integrity}
              tone={integrity >= 80 ? "emerald" : "amber"}
              className="bg-white/10"
            />
          </div>
          <p className="mt-4 text-[13px] text-white/70">
            {integrity >= 100
              ? "This record is complete."
              : "Score is calculated from how much of the record is filled in — bank details, next of kin, qualifications and salary all count."}
          </p>
        </div>

        {/* Employment */}
        <SectionCard>
          <CardHeading>Employment</CardHeading>
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Job Title" value={employee.jobTitle} />
            <Field label="Department" value={employee.department || "—"} />
            <Field
              label="Hire Date"
              value={employee.hireDate ? formatDate(employee.hireDate, "long") : "—"}
            />
            {employee.confirmationDate && (
              <Field
                label="Confirmed"
                value={formatDate(employee.confirmationDate, "long")}
              />
            )}
          </div>
        </SectionCard>

        {/* Emergency Contact */}
        <SectionCard>
          <CardHeading>Emergency Contact</CardHeading>
          {!emergency?.name ? (
            <HrPanelState
              isLoading={false}
              error={null}
              isEmpty
              emptyTitle="No emergency contact"
              emptyDescription="Add one when editing this employee record."
              className="mt-5 border-0 p-4"
            />
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              <Field label="Primary Name" value={emergency.name} />
              <Field label="Relationship" value={emergency.relationship || "—"} />
              <Field label="Phone Number" value={emergency.phone || "—"} />
              {emergency.phone && (
                <a
                  href={`tel:${emergency.phone}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#3149b8]"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
