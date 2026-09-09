"use client"

import { User, Contact, Phone, GraduationCap } from "lucide-react"
import { SectionCard, CardHeading, Field, ProgressBar } from "./shared"
import { useHrEmployee } from "@/components/hooks/useHrEmployees"
import { useHrDocuments } from "@/components/hooks/useHrDocuments"
import { DOCUMENT_TYPE_LABELS, formatDate, statusLabel } from "@/lib/hr/display"

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

const EMPTY = "—"

export default function GeneralInfoTab({ employeeId }: { employeeId: string }) {
  const { employee, loading } = useHrEmployee(employeeId)
  // Credentials live in the document vault rather than on the profile record.
  const { documents } = useHrDocuments(employeeId)
  const credentials = documents.filter((document) =>
    ["academic_credential", "certification"].includes(String(document.documentType))
  )

  const emergency = employee?.emergencyContact
  const integrity = employee?.profileIntegrityScore ?? 0

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* LEFT (spans 2) */}
      <div className="flex flex-col gap-5 lg:col-span-2">
        {/* Personal Information */}
        <SectionCard>
          <CardTitle icon={User}>Personal Information</CardTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full Name" value={employee?.name || (loading ? "Loading…" : EMPTY)} />
            <Field label="Date of Birth" value={formatDate(employee?.dateOfBirth ?? "", EMPTY)} />
            <Field label="Gender" value={employee?.gender || EMPTY} />
            <Field label="Marital Status" value={employee?.maritalStatus || EMPTY} />
            <Field label="Nationality" value={employee?.nationality || EMPTY} />
            <Field label="Religion" value={employee?.religion || EMPTY} />
          </div>
        </SectionCard>

        {/* Contact Details */}
        <SectionCard>
          <CardTitle icon={Contact}>Contact Details</CardTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Personal Email" value={employee?.email || EMPTY} />
            <Field label="Phone Number" value={employee?.phone || EMPTY} />
            <Field
              label="Home Address"
              value={employee?.address || EMPTY}
              className="sm:col-span-2"
            />
          </div>
        </SectionCard>

        {/* Education & Certifications */}
        <SectionCard>
          <CardTitle icon={GraduationCap}>Education &amp; Certifications</CardTitle>
          <div className="mt-5 flex flex-col gap-3">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="flex items-start justify-between gap-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-4"
              >
                <div>
                  <div className="text-[14px] font-semibold text-[#111827]">
                    {credential.title}
                  </div>
                  <div className="mt-0.5 text-[13px] text-[#6B7280]">
                    {statusLabel(DOCUMENT_TYPE_LABELS, credential.documentType)}
                  </div>
                </div>
                <span
                  className={
                    credential.verificationStatus === "verified"
                      ? "shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700"
                      : "shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600"
                  }
                >
                  {credential.verificationStatus === "verified"
                    ? `Verified ${formatDate(credential.verifiedAt, "")}`.trim()
                    : credential.verificationStatus}
                </span>
              </div>
            ))}

            {credentials.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF]">
                No academic credentials or certifications have been filed.
              </p>
            ) : null}
          </div>
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
            <ProgressBar percent={integrity} tone="emerald" className="bg-white/10" />
          </div>
          <p className="mt-4 text-[13px] text-white/70">
            {integrity >= 100
              ? "This profile is complete."
              : "The score rises as personal details, bank details and documents are filed."}
          </p>
        </div>

        {/* Emergency Contact */}
        <SectionCard>
          <CardHeading>Emergency Contact</CardHeading>
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Primary Name" value={emergency?.name || EMPTY} />
            <Field label="Relationship" value={emergency?.relationship || EMPTY} />
            <Field label="Phone Number" value={emergency?.phone || EMPTY} />
            <a
              href={emergency?.phone ? `tel:${emergency.phone}` : undefined}
              aria-disabled={!emergency?.phone}
              className={
                emergency?.phone
                  ? "inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#3149b8]"
                  : "pointer-events-none inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#9CA3AF] px-4 py-2 text-[12px] font-medium text-white"
              }
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
