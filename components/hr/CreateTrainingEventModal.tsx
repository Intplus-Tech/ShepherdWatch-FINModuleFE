"use client"

import { useState } from "react"
import { GraduationCap, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useTrainingMutations } from "@/components/hooks/useHrTrainings"
import { useHrScope } from "@/lib/hr/useHrScope"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
const inputCls =
  "mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

const LOCATION_TYPES = [
  { value: "in_person", label: "In Person" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
]

/**
 * Creates a training event. Used by every role that can schedule one — the
 * endpoint and required fields are identical; only who can approve the budget
 * differs, and that happens on the list screen.
 */
export default function CreateTrainingEventModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}) {
  const scope = useHrScope()
  const { pushToast } = useToast()
  const { createTraining } = useTrainingMutations()

  const [title, setTitle] = useState("")
  const [isGlobal, setIsGlobal] = useState(false)
  const [locationType, setLocationType] = useState("in_person")
  const [venueOrLink, setVenueOrLink] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("16:00")
  const [trainerName, setTrainerName] = useState("")
  const [trainerType, setTrainerType] = useState("internal")
  const [maxCapacity, setMaxCapacity] = useState("")
  const [budgetRequested, setBudgetRequested] = useState("")
  const [budgetJustification, setBudgetJustification] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitle("")
    setIsGlobal(false)
    setLocationType("in_person")
    setVenueOrLink("")
    setStartDate("")
    setEndDate("")
    setStartTime("09:00")
    setEndTime("16:00")
    setTrainerName("")
    setTrainerType("internal")
    setMaxCapacity("")
    setBudgetRequested("")
    setBudgetJustification("")
    setDescription("")
    setError(null)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    setError(null)

    if (!title.trim()) return setError("Give the training a name.")
    if (!venueOrLink.trim()) return setError("Add the venue or the meeting link.")
    if (!startDate || !endDate) return setError("Set the start and end dates.")
    if (!trainerName.trim()) return setError("Name the trainer.")

    const branchId = scope.branchId || scope.ownBranchId

    setSaving(true)
    try {
      await createTraining({
        title: title.trim(),
        branchId: isGlobal ? undefined : branchId || undefined,
        isGlobal,
        locationType,
        venueOrLink: venueOrLink.trim(),
        startDate,
        endDate,
        startTime,
        endTime,
        trainerName: trainerName.trim(),
        trainerType,
        maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
        budgetRequested: budgetRequested ? Number(budgetRequested) : undefined,
        budgetJustification: budgetJustification.trim() || undefined,
        description: description.trim() || undefined,
      })
      pushToast("Training event created", "success")
      reset()
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create this training event.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">Create Training Event</h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              Schedule a session and request its budget.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="training-title">
              Name of Training
            </label>
            <input
              id="training-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputCls}
              placeholder="e.g. Advanced Sound Engineering Workshop"
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="training-scope">
              Scope
            </label>
            <select
              id="training-scope"
              className={inputCls}
              value={isGlobal ? "global" : "branch"}
              onChange={(event) => setIsGlobal(event.target.value === "global")}
            >
              <option value="branch">
                {scope.branchName ? `${scope.branchName} only` : "This branch only"}
              </option>
              <option value="global">All branches</option>
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="training-location-type">
              Location Type
            </label>
            <select
              id="training-location-type"
              className={inputCls}
              value={locationType}
              onChange={(event) => setLocationType(event.target.value)}
            >
              {LOCATION_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="training-venue">
              Location / Link
            </label>
            <input
              id="training-venue"
              value={venueOrLink}
              onChange={(event) => setVenueOrLink(event.target.value)}
              className={inputCls}
              placeholder="Venue or Meeting Link"
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="training-start-date">
              Start Date
            </label>
            <input
              id="training-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="training-end-date">
              End Date
            </label>
            <input
              id="training-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="training-start-time">
              Start Time
            </label>
            <input
              id="training-start-time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="training-end-time">
              End Time
            </label>
            <input
              id="training-end-time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="training-trainer">
              Trainer Name
            </label>
            <input
              id="training-trainer"
              value={trainerName}
              onChange={(event) => setTrainerName(event.target.value)}
              className={inputCls}
              placeholder="e.g. Pastor David Osei"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="training-trainer-type">
              Trainer Type
            </label>
            <select
              id="training-trainer-type"
              className={inputCls}
              value={trainerType}
              onChange={(event) => setTrainerType(event.target.value)}
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="training-capacity">
              Max Capacity
            </label>
            <input
              id="training-capacity"
              value={maxCapacity}
              onChange={(event) => setMaxCapacity(event.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              className={inputCls}
              placeholder="50"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="training-budget">
              Total Budget Requested
            </label>
            <input
              id="training-budget"
              value={budgetRequested}
              onChange={(event) => setBudgetRequested(event.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              className={inputCls}
              placeholder="250000"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="training-justification">
              Budget Justification
            </label>
            <textarea
              id="training-justification"
              rows={3}
              value={budgetJustification}
              onChange={(event) => setBudgetJustification(event.target.value)}
              className={cn(inputCls, "resize-none")}
              placeholder="What the budget covers and why it is needed."
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="training-description">
              Description
            </label>
            <textarea
              id="training-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={cn(inputCls, "resize-none")}
              placeholder="What participants will cover."
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Creating…" : "Create Training Event"}
        </button>
      </div>
    </ModalShell>
  )
}
