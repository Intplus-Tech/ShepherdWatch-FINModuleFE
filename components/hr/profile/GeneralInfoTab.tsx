"use client"

import { User, Contact, Phone, GraduationCap } from "lucide-react"
import { SectionCard, CardHeading, Field, ProgressBar } from "./shared"

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

export default function GeneralInfoTab() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* LEFT (spans 2) */}
      <div className="flex flex-col gap-5 lg:col-span-2">
        {/* Personal Information */}
        <SectionCard>
          <CardTitle icon={User}>Personal Information</CardTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full Name" value="Deborah Olawunmi Oke" />
            <Field label="Date of Birth" value="September 14, 1986" />
            <Field label="Gender" value="Female" />
            <Field label="Marital Status" value="Married" />
            <Field label="Nationality" value="Nigerian" />
            <Field label="Religion" value="Christian (Ecclesiastical Staff)" />
          </div>
        </SectionCard>

        {/* Contact Details */}
        <SectionCard>
          <CardTitle icon={Contact}>Contact Details</CardTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Personal Email" value="d.oke@domain.org" />
            <Field label="Phone Number" value="+234 802 345 6789" />
            <Field
              label="Home Address"
              value="Plot 42, Victory Estate, Lekki Phase 1, Lagos, Nigeria"
              className="sm:col-span-2"
            />
          </div>
        </SectionCard>

        {/* Education & Certifications */}
        <SectionCard>
          <CardTitle icon={GraduationCap}>Education &amp; Certifications</CardTitle>
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-4">
              <div>
                <div className="text-[14px] font-semibold text-[#111827]">
                  M.Sc Human Resource Management
                </div>
                <div className="mt-0.5 text-[13px] text-[#6B7280]">
                  University of Lagos, Nigeria
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                2014 - 2016
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-4">
              <div>
                <div className="text-[14px] font-semibold text-[#111827]">
                  Chartered Institute of Personnel Management (CIPM)
                </div>
                <div className="mt-0.5 text-[13px] text-[#6B7280]">
                  Full Membership Accreditation
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                Certified 2018
              </span>
            </div>
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
          <div className="mt-2 text-[32px] font-bold leading-none">94%</div>
          <div className="mt-4">
            <ProgressBar percent={94} tone="emerald" className="bg-white/10" />
          </div>
          <p className="mt-4 text-[13px] text-white/70">
            Profile is near complete. Update your &lsquo;Professional
            Summary&rsquo; to reach 100%.
          </p>
          <button className="mt-3 text-[13px] font-semibold text-amber-400 hover:text-amber-300">
            Complete Now &rarr;
          </button>
        </div>

        {/* Emergency Contact */}
        <SectionCard>
          <CardHeading>Emergency Contact</CardHeading>
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Primary Name" value="Samuel Oke" />
            <Field label="Relationship" value="Spouse" />
            <Field label="Phone Number" value="+234 810 555 1234" />
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#3149b8]">
              <Phone className="h-4 w-4" />
              Call Now
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
