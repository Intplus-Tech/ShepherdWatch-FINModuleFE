"use client"

import { Construction } from "lucide-react"
import { SectionCard } from "./shared"

/**
 * Performance appraisals have no API yet.
 *
 * The backend defines a `PerformanceAppraisal` model and repository, but no
 * service, controller or route exposes them — there is nothing under
 * `/api/v1/hr` to read or write appraisals. Rather than show invented ratings
 * and reviewer names, this states the gap plainly.
 *
 * To light this tab up, the backend needs appraisal endpoints (list by
 * employee, create, advance through `AppraisalStatus`); the frontend work is
 * then a hook in `components/hooks/hr/` plus a table here.
 */
export default function PerformanceTab() {
  return (
    <SectionCard>
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#6B7280]">
          <Construction className="h-6 w-6" />
        </span>
        <h3 className="text-[16px] font-bold text-[#111827]">
          Performance reviews aren&apos;t available yet
        </h3>
        <p className="max-w-md text-[13px] leading-relaxed text-[#6B7280]">
          Appraisal records exist in the data model but no API endpoint serves them, so there
          is nothing to display here. This tab will populate once the appraisal endpoints ship.
        </p>
      </div>
    </SectionCard>
  )
}
