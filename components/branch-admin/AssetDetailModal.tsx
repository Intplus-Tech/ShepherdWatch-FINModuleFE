"use client"

import { useState } from "react"
import {
  X,
  Trash2,
  Printer,
  Pencil,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Plus,
  ArrowRight,
  Wrench,
  Clock,
  CheckCircle2,
  Info,
  TrendingDown,
  ShieldCheck,
} from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

type TabKey = "general" | "maintenance" | "movement" | "financial"

const TABS: { key: TabKey; label: string }[] = [
  { key: "general", label: "General Info" },
  { key: "maintenance", label: "Maintenance History" },
  { key: "movement", label: "Movement Log" },
  { key: "financial", label: "Financial Impact" },
]

function Tag({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: "gray" | "amber" | "green" | "red" | "blue" | "orange"
}) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </h4>
  )
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-blue-600"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

/* ----------------------------- TAB 1: GENERAL ----------------------------- */

function GeneralInfoTab() {
  const coreDetails = [
    { label: "Serial Number", value: "CN-0W7N89-70163" },
    { label: "Model Year", value: "2021" },
    { label: "Purchase Date", value: "Aug 15, 2021" },
    {
      label: "Warranty Status",
      value: <span className="text-green-600">Active until 2024</span>,
    },
  ]

  const specs = [
    {
      icon: Cpu,
      text: "Intel Core i7-10700 (8-Core, 16MB Cache)",
    },
    { icon: MemoryStick, text: "16GB DDR4 RAM 2933MHz" },
    { icon: HardDrive, text: "512GB PCIe NVMe Class 40 SSD" },
    { icon: Monitor, text: "Windows 10 Pro (Includes Win 11 License)" },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: spans 2 cols */}
      <div className="space-y-6 lg:col-span-2">
        <div>
          <SectionLabel>Core Details</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {coreDetails.map((d) => (
              <div
                key={d.label}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-xs text-gray-500">{d.label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {d.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Technical Specs</SectionLabel>
          <ul className="space-y-2.5">
            {specs.map((s) => {
              const Icon = s.icon
              return (
                <li
                  key={s.text}
                  className="flex items-center gap-3 text-sm text-gray-700"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  {s.text}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Right */}
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Financial Snapshot</SectionLabel>
            <button className="text-xs font-medium text-blue-600 hover:underline">
              View Full Details
            </button>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Original Cost</dt>
              <dd className="font-semibold text-gray-900">₦450,000.00</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Current Value</dt>
              <dd className="font-semibold text-gray-900">₦285,500.00</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Depreciation (YTD)</dt>
              <dd className="font-semibold text-red-600">-12.5%</dd>
            </div>
          </dl>
          <div className="mt-3">
            <ProgressBar percent={63} />
            <p className="mt-1.5 text-xs text-gray-500">63% of value remaining</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <SectionLabel>Latest Activity</SectionLabel>
          <ul className="space-y-3">
            <li className="border-l-2 border-blue-200 pl-3">
              <p className="text-sm font-semibold text-gray-900">
                Software Update
              </p>
              <p className="text-xs text-gray-600">
                System updated to latest security patch.
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Today, 10:30 AM • Auto-log
              </p>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <p className="text-sm font-semibold text-gray-900">
                Routine Checkup
              </p>
              <p className="text-xs text-gray-600">
                Visual inspection passed. No issues.
              </p>
              <p className="mt-0.5 text-xs text-gray-400">Last Week • J. Admin</p>
            </li>
          </ul>
          <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Plus className="h-3.5 w-3.5" /> Add Log Entry
          </button>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- TAB 2: MAINTENANCE --------------------------- */

type MaintItem = {
  title: string
  tag: { label: string; tone: "red" | "blue" | "amber" }
  date: string
  cost: string
  status: { label: string; tone: "orange" | "green" }
  rows: { label: string; value: string }[]
  note?: string
}

function MaintenanceTab() {
  const items: MaintItem[] = [
    {
      title: "Emergency PSU Replacement",
      tag: { label: "EMERGENCY", tone: "red" },
      date: "Jan 12, 2024 • 02:45 PM",
      cost: "₦45,000.00",
      status: { label: "Pending", tone: "orange" },
      rows: [
        { label: "Service Provider", value: "FastFix Tech Hub" },
        { label: "Reported By", value: "M. Bello (Front Desk)" },
      ],
      note: "System experienced sudden power loss. Technician diagnosed a blown power supply unit. Replacement ordered.",
    },
    {
      title: "Quarterly Cleaning & Optimization",
      tag: { label: "ROUTINE", tone: "blue" },
      date: "Oct 05, 2023 • 10:00 AM",
      cost: "₦8,500.00",
      status: { label: "Completed", tone: "green" },
      rows: [
        { label: "Service Provider", value: "Internal IT Team" },
        { label: "Approved By", value: "Admin Jane" },
      ],
    },
    {
      title: "RAM Upgrade (8GB to 16GB)",
      tag: { label: "REPAIR", tone: "amber" },
      date: "Jun 18, 2023 • 11:30 AM",
      cost: "₦32,000.00",
      status: { label: "Completed", tone: "green" },
      rows: [
        { label: "Service Provider", value: "Compulsive Ltd." },
        { label: "Ticket Ref", value: "#TK-90821" },
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left timeline */}
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <SectionLabel>Service History Timeline</SectionLabel>
          <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add Maintenance Record
          </button>
        </div>

        <ol className="relative space-y-4 border-l border-gray-200 pl-6">
          {items.map((it) => (
            <li key={it.title} className="relative">
              <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-500" />
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-gray-900">
                      {it.title}
                    </h5>
                    <Tag tone={it.tag.tone}>{it.tag.label}</Tag>
                  </div>
                  <Tag tone={it.status.tone}>{it.status.label}</Tag>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {it.date}
                  </span>
                  <span className="font-semibold text-gray-900">{it.cost}</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {it.rows.map((r) => (
                    <div key={r.label}>
                      <dt className="text-gray-400">{r.label}</dt>
                      <dd className="font-medium text-gray-700">{r.value}</dd>
                    </div>
                  ))}
                </dl>
                {it.note && (
                  <p className="mt-3 rounded-md bg-gray-50 p-2 text-xs italic text-gray-600">
                    {it.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Right */}
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <SectionLabel>Financial Snapshot</SectionLabel>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Original Purchase</dt>
              <dd className="font-semibold text-gray-900">₦450,000.00</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Service Cost</dt>
              <dd className="font-semibold text-red-600">₦85,500.00</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Current Net Value</dt>
              <dd className="font-semibold text-gray-900">₦285,500.00</dd>
            </div>
          </dl>
          <div className="mt-3">
            <ProgressBar percent={63} />
            <p className="mt-1.5 text-xs text-gray-500">63% Remaining</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <SectionLabel>Service Metrics</SectionLabel>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">MTBF (Approx.)</dt>
              <dd className="font-semibold text-gray-900">142 Days</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Next Routine Check</dt>
              <dd className="font-semibold text-gray-900">Mar 15, 2024</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- TAB 3: MOVEMENT ----------------------------- */

function MovementTab() {
  const rows = [
    {
      date: "Oct 12, 2023 09:15 AM",
      from: "Storage A",
      to: "Main Office - Desk 4",
      by: "Admin (S. Adebayo)",
      reason: "Deployment to new staff",
    },
    {
      date: "Sep 28, 2023 02:30 PM",
      from: "Repair Center",
      to: "Storage A",
      by: "M. Smith",
      reason: "Returned from maintenance",
    },
    {
      date: "Sep 20, 2023 11:00 AM",
      from: "Main Office",
      to: "Repair Center",
      by: "T. Williams",
      reason: "Fan replacement scheduled",
    },
    {
      date: "Aug 15, 2021 08:00 AM",
      from: "N/A (New)",
      to: "Central Store",
      by: "Admin",
      reason: "Initial intake/procurement",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Asset Journey Log
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete tracking history of the asset within branch departments and
            rooms.
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5" /> Log New Movement
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Transfer Date", "From", "To", "Handled By", "Reason"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((r) => (
              <tr key={r.date}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                  {r.date}
                </td>
                <td className="px-4 py-3 text-gray-600">{r.from}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-gray-900">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                    {r.to}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.by}</td>
                <td className="px-4 py-3 text-gray-600">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <SectionLabel>Verification Info</SectionLabel>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Last Verified On</p>
            <p className="mt-1 font-semibold text-gray-900">Oct 12, 2023</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Verified By</p>
            <p className="mt-1 font-semibold text-gray-900">Sarah Admin</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Audit Status</p>
            <p className="mt-1">
              <Tag tone="green">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Confirmed In-Place
              </Tag>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- TAB 4: FINANCIAL ----------------------------- */

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-bold text-gray-900 ${valueClass ?? ""}`}>
        {value}
      </p>
    </div>
  )
}

function ProjectionChart() {
  const years = ["2021", "2022", "2023", "2024", "2025", "2026"]
  // simple downward area chart placeholder
  const points = "0,20 80,55 160,80 240,110 320,135 400,155"
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <SectionLabel>Net Book Value Projection</SectionLabel>
      <div className="relative">
        <svg viewBox="0 0 400 180" className="h-44 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="nbvFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`${points} 400,180 0,180`} fill="url(#nbvFill)" />
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
          />
          {/* Improvement marker */}
          <circle cx="80" cy="55" r="5" fill="#fff" stroke="#22c55e" strokeWidth="3" />
        </svg>
        <span className="absolute left-[18%] top-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
          Improvement
        </span>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        {years.map((y) => (
          <span key={y}>{y}</span>
        ))}
      </div>
    </div>
  )
}

function FinancialTab() {
  const schedule = [
    {
      fy: "FY 2021/22",
      opening: "450,000",
      depreciation: "85,000",
      closing: "365,000",
      status: "FINALIZED",
      active: false,
    },
    {
      fy: "FY 2022/23 (Current)",
      opening: "410,000 (net adjusted)",
      depreciation: "79,500",
      closing: "330,500",
      status: "ACTIVE",
      active: true,
    },
    {
      fy: "FY 2023/24",
      opening: "330,500",
      depreciation: "82,100",
      closing: "248,400",
      status: "PROJECTED",
      active: false,
    },
    {
      fy: "FY 2024/25",
      opening: "248,400",
      depreciation: "82,100",
      closing: "166,300",
      status: "PROJECTED",
      active: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Purchase Price" value="₦450,000.00" />
        <StatCard label="Net Book Value" value="₦285,500.00" />
        <StatCard
          label="Total Depreciation"
          value="₦164,500.00"
          valueClass="text-red-600"
        />
        <StatCard label="Economic Life" value="5 Years" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectionChart />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <SectionLabel>Methodology</SectionLabel>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Depreciation Method</dt>
              <dd className="font-semibold text-gray-900">Straight Line</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Annual Rate</dt>
              <dd className="font-semibold text-gray-900">20%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Salvage Value</dt>
              <dd className="font-semibold text-gray-900">₦25,000.00</dd>
            </div>
          </dl>
          <p className="mt-3 flex gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Asset is currently in its 3rd year of economic life. Market value may
            vary from book value based on condition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Capital improvements */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Capital Improvements</SectionLabel>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <TrendingDown className="h-3.5 w-3.5 rotate-180" /> Increases Asset
              Value
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                RAM &amp; Storage Upgrade
              </p>
              <p className="text-xs text-gray-500">
                Mar 12, 2022 • Performance Enhancement
              </p>
            </div>
            <span className="text-sm font-semibold text-green-600">
              +₦45,000.00
            </span>
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Plus className="h-3.5 w-3.5" /> Register New Capital Improvement
          </button>
        </div>

        {/* Tax impact */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <SectionLabel>Tax Impact</SectionLabel>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                Investment Allowance
              </p>
              <Tag tone="green">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Applied
              </Tag>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Eligible for 10% investment allowance under current tax realm.
            </p>
          </div>
        </div>
      </div>

      {/* Depreciation schedule */}
      <div>
        <SectionLabel>Depreciation Schedule</SectionLabel>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Financial Year",
                  "Opening Value (₦)",
                  "Depreciation (₦)",
                  "Closing Value (₦)",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {schedule.map((row) => (
                <tr
                  key={row.fy}
                  className={row.active ? "bg-blue-50" : undefined}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {row.fy}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.opening}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.depreciation}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.closing}</td>
                  <td className="px-4 py-3">
                    <Tag
                      tone={
                        row.status === "ACTIVE"
                          ? "blue"
                          : row.status === "FINALIZED"
                            ? "green"
                            : "gray"
                      }
                    >
                      {row.status}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- MAIN MODAL ------------------------------- */

export default function AssetDetailModal({
  open,
  onClose,
  onEdit,
}: {
  open: boolean
  onClose: () => void
  onEdit?: () => void
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("general")

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              Dell OptiPlex 7090
            </h2>
            <Tag tone="gray">IT Equipment</Tag>
            <Tag tone="amber">Fair Condition</Tag>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Asset ID: #EQ-2041 • Main Office - Desk 4
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-100 px-6">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Body */}
      <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
        {activeTab === "general" && <GeneralInfoTab />}
        {activeTab === "maintenance" && <MaintenanceTab />}
        {activeTab === "movement" && <MovementTab />}
        {activeTab === "financial" && <FinancialTab />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-6 py-4">
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" /> Retire Asset
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Printer className="h-4 w-4" /> Print Label
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit Details
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
