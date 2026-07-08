"use client"

import { Eye, Star } from "lucide-react"
import {
  SectionCard,
  CardHeading,
  StatCard,
  ProgressBar,
  Th,
  Td,
} from "./shared"

const REVIEWS = [
  {
    period: "Annual Review 2023",
    reviewer: "Bishop Elias Thorne",
    reviewerRole: "Regional Overseer",
    date: "Jan 12, 2024",
    rating: "4.8",
  },
  {
    period: "Mid-Year 2023",
    reviewer: "Rev. Victor Adeyemi",
    reviewerRole: "Director",
    date: "Jul 05, 2023",
    rating: "4.6",
  },
  {
    period: "Annual Review 2022",
    reviewer: "Bishop Elias Thorne",
    reviewerRole: "Regional Overseer",
    date: "Jan 10, 2023",
    rating: "4.5",
  },
]

const COMPETENCIES = [
  { label: "Leadership", value: 95 },
  { label: "Technical", value: 85 },
  { label: "Teamwork", value: 88 },
  { label: "Communication", value: 90 },
  { label: "Integrity", value: 98 },
]

function Donut({ percent }: { percent: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#EEF1F6" strokeWidth="7" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="#111827"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
      <text
        x="32"
        y="36"
        textAnchor="middle"
        className="fill-[#111827] text-[13px] font-bold"
      >
        {percent}%
      </text>
    </svg>
  )
}

function RadarChart({ data }: { data: { label: string; value: number }[] }) {
  const size = 300
  const cx = size / 2
  const cy = size / 2 - 4
  const R = 92
  const n = data.length
  const angleFor = (i: number) => (-90 + i * (360 / n)) * (Math.PI / 180)
  const pointAt = (i: number, radius: number): [number, number] => {
    const a = angleFor(i)
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)]
  }
  const rings = [0.25, 0.5, 0.75, 1]
  const dataPoints = data.map((d, i) => pointAt(i, R * (d.value / 100)))
  const dataPath = dataPoints.map((p) => p.join(",")).join(" ")

  const anchorFor = (i: number): "start" | "middle" | "end" => {
    const [x] = pointAt(i, R)
    if (x > cx + 6) return "start"
    if (x < cx - 6) return "end"
    return "middle"
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px]" style={{ overflow: "visible" }}>
      {/* concentric grid pentagons */}
      {rings.map((ring, ri) => (
        <polygon
          key={ri}
          points={data.map((_, i) => pointAt(i, R * ring).join(",")).join(" ")}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ))}
      {/* axes */}
      {data.map((_, i) => {
        const [x, y] = pointAt(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E5E7EB" strokeWidth="1" />
      })}
      {/* data polygon */}
      <polygon
        points={dataPath}
        fill="rgba(17,24,39,0.06)"
        stroke="#111827"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* data vertices */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#111827" />
      ))}
      {/* labels */}
      {data.map((d, i) => {
        const [x, y] = pointAt(i, R + 16)
        return (
          <text
            key={d.label}
            x={x}
            y={y}
            textAnchor={anchorFor(i)}
            dominantBaseline="middle"
            className="fill-[#9CA3AF]"
            style={{ fontSize: "9px", fontWeight: 600 }}
          >
            {d.label.toUpperCase()} ({d.value}%)
          </text>
        )
      })}
    </svg>
  )
}

export default function PerformanceTab() {
  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Overall Rating"
          value="4.8 / 5.0"
          sub={<span className="font-semibold text-emerald-600">↗ +0.3 from last year</span>}
        />
        <StatCard label="Goals Completed" value="12/15">
          <div className="mt-3 flex items-center gap-3">
            <Donut percent={80} />
            <span className="text-[12px] text-[#6B7280]">
              3 goals currently in progress
            </span>
          </div>
        </StatCard>
        <StatCard label="Review Cycle" value="2023 Annual">
          <div className="mt-3">
            <div className="mb-2 text-[12px] text-[#6B7280]">Next review: Dec 15, 2024</div>
            <ProgressBar percent={70} className="[&>div]:bg-amber-400" />
          </div>
        </StatCard>
      </div>

      {/* Performance History + Competency Assessment side by side */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard className="p-0">
          <div className="flex items-center justify-between px-5 py-4">
            <CardHeading>Performance History</CardHeading>
            <button className="text-[13px] font-semibold text-[#3B5BDB] hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto border-t border-[#EEF1F6]">
            <table className="w-full">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <Th>Review Period</Th>
                  <Th>Reviewer</Th>
                  <Th>Rating</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {REVIEWS.map((r) => (
                  <tr key={r.period}>
                    <Td className="font-semibold text-[#111827]">
                      {r.period}
                      <div className="text-[12px] font-normal text-[#9CA3AF]">{r.date}</div>
                    </Td>
                    <Td className="text-[#111827]">
                      {r.reviewer}
                      <div className="text-[12px] font-normal text-[#9CA3AF]">{r.reviewerRole}</div>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#111827]">
                        {r.rating}
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      </span>
                    </Td>
                    <Td>
                      <button
                        aria-label="View review"
                        className="text-[#9CA3AF] hover:text-[#3B5BDB]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard>
          <CardHeading>Competency Assessment</CardHeading>
          <div className="mt-2 flex justify-center">
            <RadarChart data={COMPETENCIES} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#EEF1F6] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280]">Strategic Planning</span>
              <span className="text-[13px] font-bold text-[#111827]">Expert</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280]">Crisis Management</span>
              <span className="text-[13px] font-bold text-[#111827]">Advanced</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
