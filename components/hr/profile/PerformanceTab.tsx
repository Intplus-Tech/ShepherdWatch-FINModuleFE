"use client"

import { useMemo } from "react"
import { Star } from "lucide-react"
import {
  SectionCard,
  CardHeading,
  StatCard,
  ProgressBar,
  StatusBadge,
  Th,
  Td,
} from "./shared"
import { useHrTrainings } from "@/components/hooks/useHrTrainings"
import { useHrAttendance, useHrAttendanceMetrics } from "@/components/hooks/useHrAttendance"
import { TRAINING_RECORD_LABELS, formatDate, statusLabel } from "@/lib/hr/display"

/**
 * Performance reviews have no endpoint yet, so this tab reports on what the API
 * does measure for a staff member: their training and certification record, and
 * their attendance reliability.
 */
export default function PerformanceTab({ employeeId }: { employeeId: string }) {
  const { trainings, loading } = useHrTrainings({ limit: 50 })
  const { logs } = useHrAttendance({ employeeId, limit: 50 })
  const { metrics } = useHrAttendanceMetrics()

  const records = useMemo(
    () =>
      trainings
        .map((training) => {
          const participant = training.participants.find(
            (entry) => entry.employeeId === employeeId
          )
          return participant ? { training, participant } : null
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [trainings, employeeId]
  )

  const certified = records.filter(({ participant }) => participant.status === "certified")
  const completionRate = records.length
    ? Math.round((certified.length / records.length) * 100)
    : 0

  const scored = records.filter(({ participant }) => participant.score > 0)
  const averageScore = scored.length
    ? Math.round(
        (scored.reduce((sum, { participant }) => sum + participant.score, 0) / scored.length) * 10
      ) / 10
    : 0

  const punctual = logs.filter((log) => log.status === "present").length
  const punctualityRate = logs.length ? Math.round((punctual / logs.length) * 100) : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Average Training Score"
          value={averageScore ? `${averageScore}%` : "—"}
          sub={
            <span className="text-[#6B7280]">
              Across {scored.length} scored assessment{scored.length === 1 ? "" : "s"}
            </span>
          }
        />
        <StatCard label="Certifications" value={`${certified.length}/${records.length}`}>
          <div className="mt-3">
            <ProgressBar percent={completionRate} tone="emerald" />
            <div className="mt-2 text-[12px] text-[#6B7280]">
              {completionRate}% of enrolments certified
            </div>
          </div>
        </StatCard>
        <StatCard label="Attendance Reliability" value={`${punctualityRate}%`}>
          <div className="mt-3">
            <ProgressBar percent={punctualityRate} className="[&>div]:bg-amber-400" />
            <div className="mt-2 text-[12px] text-[#6B7280]">
              Branch average {metrics.attendanceRate}%
            </div>
          </div>
        </StatCard>
      </div>

      {/* Training record */}
      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Training &amp; Certification Record</CardHeading>
          <span className="text-[12px] text-[#6B7280]">
            {records.length} enrolment{records.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="overflow-x-auto border-t border-[#EEF1F6]">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <Th>Programme</Th>
                <Th>Trainer</Th>
                <Th>Date</Th>
                <Th>Score</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {records.map(({ training, participant }) => (
                <tr key={participant.recordId || training.id}>
                  <Td className="font-semibold text-[#111827]">{training.title}</Td>
                  <Td className="text-[#4B5563]">{training.trainerName || "—"}</Td>
                  <Td className="text-[#4B5563]">{formatDate(training.startDate)}</Td>
                  <Td className="text-[#4B5563]">
                    {participant.score ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#111827]">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {participant.score}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    <StatusBadge
                      status={statusLabel(TRAINING_RECORD_LABELS, participant.status).toUpperCase()}
                    />
                  </Td>
                </tr>
              ))}

              {!loading && records.length === 0 ? (
                <tr>
                  <Td className="text-[#9CA3AF]">
                    This staff member has not been enrolled in any training yet.
                  </Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <p className="text-[12px] text-[#9CA3AF]">
        Appraisal cycles and competency scoring are not exposed by the HR API yet; this tab
        reports the measured training and attendance record instead.
      </p>
    </div>
  )
}
