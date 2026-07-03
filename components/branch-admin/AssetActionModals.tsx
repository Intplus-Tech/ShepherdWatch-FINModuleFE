"use client"

import { useState } from "react"
import {
  X,
  Wrench,
  Printer,
  UploadCloud,
  Box,
  ChevronDown,
} from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import {
  useAssetMovements,
  useCashBoxTopUp,
  useStockAdjustment,
  type AssetMovement,
} from "@/components/hooks/useAssetMovements"
import { formatDate } from "@/lib/format"

/* ------------------------------- shared bits ------------------------------ */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}

function ModalHeader({
  title,
  subtitle,
  icon,
  onClose,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

function CancelButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Cancel
    </button>
  )
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  )
}

type Props = { open: boolean; onClose: () => void; assetId?: string; cashBoxId?: string }

/* ============================== 1. TOP-UP CASH ============================= */

export function TopUpCashModal({ open, onClose, cashBoxId }: Props) {
  const [amount, setAmount] = useState("")
  const [justification, setJustification] = useState("")
  const [createRequisition, setCreateRequisition] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const topUp = useCashBoxTopUp(cashBoxId ?? "AS-1024")

  const handleSubmit = async () => {
    setError(null)
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid top-up amount.")
      return
    }
    if (!justification.trim()) {
      setError("Justification is required.")
      return
    }
    try {
      await topUp.mutateAsync({
        amount: numericAmount,
        justification: justification.trim(),
        createRequisition,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit top-up request.")
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-md">
      <ModalHeader
        title="Top-up Cash"
        subtitle="Petty Cash Box (AS-1024)"
        onClose={onClose}
      />

      <div className="space-y-5 px-6 py-5">
        {/* Current balance */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <span className="text-sm text-gray-500">Current Balance</span>
          <span className="text-sm font-semibold text-gray-900">
            ₦ 50,000.00
          </span>
        </div>

        {/* Top-up amount */}
        <div>
          <FieldLabel>Top-up Amount</FieldLabel>
          <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <span className="pl-3 text-sm text-gray-500">₦</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent px-2 py-2.5 text-sm text-gray-900 outline-none"
            />
            <span className="pr-3 text-sm font-medium text-gray-400">NGN</span>
          </div>
        </div>

        {/* Justification */}
        <div>
          <FieldLabel>
            Justification <span className="text-red-500">*</span>
          </FieldLabel>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
            placeholder="Explain the reason for this cash top-up request..."
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Create requisition toggle row */}
        <div className="flex items-start justify-between gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Create Requisition Automatically
            </p>
            <p className="mt-0.5 text-xs text-gray-600">
              Synchronize this request with the branch&apos;s financial workflow
              for approval.
            </p>
          </div>
          <Toggle checked={createRequisition} onChange={setCreateRequisition} />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <CancelButton onClose={onClose} />
        <PrimaryButton onClick={handleSubmit} disabled={topUp.isPending}>
          {topUp.isPending ? "Submitting…" : "Submit Request"}
        </PrimaryButton>
      </div>
    </ModalShell>
  )
}

/* ============================= 2. UPDATE STOCK ============================ */

export function UpdateStockModal({ open, onClose, assetId }: Props) {
  const [quantityAdded, setQuantityAdded] = useState("0")
  const [newTotal, setNewTotal] = useState("24")
  const [linkRequisition, setLinkRequisition] = useState(true)
  const [totalCost, setTotalCost] = useState("")
  const [category, setCategory] = useState("Office Supplies")
  const [error, setError] = useState<string | null>(null)

  const stockAdjustment = useStockAdjustment(assetId ?? "AS-1045")

  const handleSubmit = async () => {
    setError(null)
    const qty = Number(quantityAdded)
    if (!Number.isFinite(qty) || qty === 0) {
      setError("Enter a quantity to adjust.")
      return
    }
    try {
      await stockAdjustment.mutateAsync({
        quantityAdded: qty,
        newTotal: Number(newTotal) || undefined,
        totalCost: linkRequisition && totalCost ? Number(totalCost) : undefined,
        category: linkRequisition ? category : undefined,
        linkRequisition,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update stock.")
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      <ModalHeader
        title="Update Stock Level"
        subtitle="Manage inventory quantities and costs"
        onClose={onClose}
      />

      <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
        {/* Asset card */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
            <Printer className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                Printer Paper Stock (A4)
              </p>
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                AS-1045
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Current Stock: 24 Reams</p>
          </div>
        </div>

        {/* Two fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Quantity Added</FieldLabel>
            <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <input
                type="number"
                value={quantityAdded}
                onChange={(e) => setQuantityAdded(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
              />
              <span className="pr-3 text-sm text-gray-400">units</span>
            </div>
          </div>
          <div>
            <FieldLabel>New Total Stock</FieldLabel>
            <input
              type="number"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Upload area */}
        <div>
          <FieldLabel>Attach Invoice/Receipt</FieldLabel>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center">
            <UploadCloud className="mb-2 h-7 w-7 text-gray-400" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">Upload a file</span>{" "}
              or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>

        {/* Link to requisition */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={linkRequisition}
              onChange={(e) => setLinkRequisition(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900">
                Link to Financial Requisition
              </span>
              <span className="mt-0.5 block text-xs text-gray-600">
                Automatically create an expense entry in the branch budget for
                this restock.
              </span>
            </span>
          </label>

          {linkRequisition && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Total Cost</FieldLabel>
                <div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <span className="pl-3 text-sm text-gray-500">₦</span>
                  <input
                    type="number"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent px-2 py-2.5 text-sm text-gray-900 outline-none"
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Budget Category</FieldLabel>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option>Office Supplies</option>
                    <option>Maintenance</option>
                    <option>IT Equipment</option>
                    <option>Utilities</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <CancelButton onClose={onClose} />
        <PrimaryButton onClick={handleSubmit} disabled={stockAdjustment.isPending}>
          {stockAdjustment.isPending ? "Updating…" : "Update Stock"}
        </PrimaryButton>
      </div>
    </ModalShell>
  )
}

/* ========================= 3. SCHEDULE MAINTENANCE ======================== */

const MAINTENANCE_TYPES = [
  "Routine Check",
  "Upgrade / Overhaul",
  "Corrective / Repair",
  "Emergency",
] as const

type MaintenanceType = (typeof MAINTENANCE_TYPES)[number]

export function ScheduleMaintenanceModal({ open, onClose }: Props) {
  const [type, setType] = useState<MaintenanceType>("Routine Check")
  const [routineDate, setRoutineDate] = useState("Every 30 Days")
  const [overhaulDate, setOverhaulDate] = useState("")
  const [correctiveDate, setCorrectiveDate] = useState("Today")
  const [vendor, setVendor] = useState("")
  const [cost, setCost] = useState("")
  const [createRequisition, setCreateRequisition] = useState(true)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      <ModalHeader
        title="Schedule Maintenance"
        icon={<Wrench className="h-5 w-5" />}
        onClose={onClose}
      />

      <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
        {/* Info banner */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-gray-900">
            Asset: HVAC Unit - Main Hall (EQ-2045)
          </p>
          <p className="mt-0.5 text-xs text-blue-700">
            Regular maintenance helps extend asset lifespan.
          </p>
        </div>

        {/* Type + date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Maintenance Type</FieldLabel>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {MAINTENANCE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <FieldLabel>Scheduled Date</FieldLabel>

            {type === "Routine Check" && (
              <div className="relative">
                <select
                  value={routineDate}
                  onChange={(e) => setRoutineDate(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option>Every 30 Days</option>
                  <option>Every 60 Days</option>
                  <option>Every 90 Days</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            )}

            {type === "Upgrade / Overhaul" && (
              <input
                type="date"
                value={overhaulDate}
                onChange={(e) => setOverhaulDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            )}

            {type === "Corrective / Repair" && (
              <input
                type="text"
                value={correctiveDate}
                onChange={(e) => setCorrectiveDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            )}

            {type === "Emergency" && (
              <input
                type="text"
                value="Today"
                disabled
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-400 outline-none"
              />
            )}
          </div>
        </div>

        {/* Vendor */}
        <div>
          <FieldLabel>Service Provider / Vendor</FieldLabel>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. CoolBreeze HVAC Services Ltd."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Estimated cost */}
        <div>
          <FieldLabel>Estimated Cost</FieldLabel>
          <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <span className="pl-3 text-sm text-gray-500">₦</span>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent px-2 py-2.5 text-sm text-gray-900 outline-none"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            Approximate cost for budgeting purposes.
          </p>
        </div>

        {/* Requisition toggle */}
        <div className="flex items-start justify-between gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Create Payment Requisition
            </p>
            <p className="mt-0.5 text-xs text-gray-600">
              Notify accountant to process funds release
            </p>
          </div>
          <Toggle checked={createRequisition} onChange={setCreateRequisition} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <CancelButton onClose={onClose} />
        <PrimaryButton>Confirm Schedule</PrimaryButton>
      </div>
    </ModalShell>
  )
}

/* ======================= 4. FULL MOVEMENT HISTORY ======================== */

type MovementRow = {
  date: string
  asset: string
  from: string
  to: string
  dot: "green" | "orange" | "blue"
  initials: string
  handler: string
  reason: string
}

const MOVEMENT_ROWS: MovementRow[] = [
  {
    date: "Oct 24, 2023 09:42 AM",
    asset: "HP LaserJet Pro M404n",
    from: "IT Storage",
    to: "Front Desk",
    dot: "green",
    initials: "JD",
    handler: "J. Doe",
    reason: "Printer replacement request",
  },
  {
    date: "Oct 24, 2023 08:15 AM",
    asset: "Meeting Room Chair #4",
    from: "Meeting Room A",
    to: "Storage B",
    dot: "orange",
    initials: "MS",
    handler: "M. Smith",
    reason: "Broken leg - needs repair",
  },
  {
    date: "Oct 23, 2023 04:30 PM",
    asset: 'MacBook Pro 16"',
    from: "IT Department",
    to: "Sarah K. (Staff)",
    dot: "blue",
    initials: "AD",
    handler: "Admin",
    reason: "New staff allocation",
  },
  {
    date: "Oct 22, 2023 11:00 AM",
    asset: "Canon XA11 Camcorder",
    from: "AV Studio",
    to: "Main Sanctuary",
    dot: "green",
    initials: "DK",
    handler: "D. King",
    reason: "Sunday Service Streaming",
  },
  {
    date: "Oct 21, 2023 02:30 PM",
    asset: "Foldable Table (White)",
    from: "Storage B",
    to: "Courtyard",
    dot: "orange",
    initials: "RT",
    handler: "R. Taylor",
    reason: "Community Picnic Setup",
  },
]

const DOT_COLORS: Record<MovementRow["dot"], string> = {
  green: "bg-green-500",
  orange: "bg-orange-500",
  blue: "bg-blue-500",
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "--"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function mapMovementRow(m: AssetMovement): MovementRow {
  const handler = String(m.handledBy ?? m.movedBy ?? "—")
  return {
    date: formatDate(m.movedAt ?? m.createdAt, "datetime"),
    asset: String(m.assetName ?? m.assetId ?? "Asset"),
    from: String(m.fromLocation ?? "—"),
    to: String(m.toLocation ?? "—"),
    dot: "green",
    initials: initialsOf(handler),
    handler,
    reason: String(m.reason ?? m.movementType ?? "—"),
  }
}

export function FullMovementHistoryModal({ open, onClose, assetId }: Props) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [category, setCategory] = useState("All Categories")

  const { items: movementItems, isLoading } = useAssetMovements({ assetId, enabled: open })
  const liveRows = movementItems.map(mapMovementRow)
  const rows = liveRows.length > 0 ? liveRows : MOVEMENT_ROWS

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-4xl">
      <ModalHeader
        title="Full Movement History"
        subtitle="Detailed log of all asset movements within the branch."
        onClose={onClose}
      />

      <div className="space-y-5 px-6 py-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <FieldLabel>Start Date</FieldLabel>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <FieldLabel>End Date</FieldLabel>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <FieldLabel>Filter by Category</FieldLabel>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-9 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option>All Categories</option>
                <option>IT Equipment</option>
                <option>Furniture</option>
                <option>AV Equipment</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              More Filters
            </button>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Date & Time",
                  "Asset Name",
                  "From",
                  "To",
                  "Handled By",
                  "Reason",
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
              {isLoading && liveRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Loading movements…
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={`${r.date}-${r.asset}`}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {r.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium text-blue-600">
                      <Box className="h-4 w-4 shrink-0" />
                      {r.asset}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.from}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-gray-900">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLORS[r.dot]}`}
                      />
                      {r.to}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                        {r.initials}
                      </span>
                      {r.handler}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing 1-5 of 124 results</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
