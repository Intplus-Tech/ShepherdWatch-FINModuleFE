"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { EmployeeMultiPicker } from "@/components/hr/EmployeePicker"
import { HrFileDrop, type UploadedFile } from "@/components/hr/HrFileDrop"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useBranchId } from "@/components/hooks/hr/useBranchId"
import {
  useCreateTrainingEvent,
  useEnrollParticipants,
} from "@/components/hooks/hr/useHrTraining"
import type { EmployeeProfile, TrainingLocationType } from "@/lib/hr/types"

const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

const LOCATION_TYPES: { value: TrainingLocationType; label: string }[] = [
  { value: "virtual", label: "Virtual" },
  { value: "physical", label: "Physical" },
  { value: "hybrid", label: "Hybrid" },
]

function Radio({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#111827]">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 accent-[#2563EB]"
      />
      {label}
    </label>
  )
}

export default function BranchAdminCreateTrainingModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const branchId = useBranchId()
  const createEvent = useCreateTrainingEvent()
  const enroll = useEnrollParticipants()

  const [scope, setScope] = useState<"branch" | "global">("branch")
  const [title, setTitle] = useState("")
  const [locationType, setLocationType] = useState<TrainingLocationType>("virtual")
  const [isPaid, setIsPaid] = useState(false)
  const [amount, setAmount] = useState("")
  const [budgetRequested, setBudgetRequested] = useState("")
  const [venueOrLink, setVenueOrLink] = useState("")
  const [trainerName, setTrainerName] = useState("")
  const [trainerType, setTrainerType] = useState<"internal" | "external">("internal")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [description, setDescription] = useState("")
  const [certification, setCertification] = useState(true)
  const [flyer, setFlyer] = useState<UploadedFile[]>([])
  const [participants, setParticipants] = useState<EmployeeProfile[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setScope("branch")
    setTitle("")
    setLocationType("virtual")
    setIsPaid(false)
    setAmount("")
    setBudgetRequested("")
    setVenueOrLink("")
    setTrainerName("")
    setTrainerType("internal")
    setStartDate("")
    setEndDate("")
    setStartTime("")
    setEndTime("")
    setDescription("")
    setCertification(true)
    setFlyer([])
    setParticipants([])
    setFormError(null)
    createEvent.reset()
    enroll.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const pending = createEvent.isPending || enroll.isPending

  async function handleCreate() {
    setFormError(null)

    if (title.trim().length < 3) {
      setFormError("Enter a training title of at least three characters.")
      return
    }
    if (venueOrLink.trim().length < 2) {
      setFormError(
        locationType === "virtual" ? "Enter the meeting link." : "Enter the venue.",
      )
      return
    }
    if (trainerName.trim().length < 2) {
      setFormError("Enter the trainer's name.")
      return
    }
    if (!startDate || !endDate) {
      setFormError("Set both a start and end date.")
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError("The end date can't be before the start date.")
      return
    }
    if (!startTime || !endTime) {
      setFormError("Set the start and end times.")
      return
    }
    if (scope === "branch" && !branchId) {
      setFormError("Your account has no branch assigned, so this can't be saved.")
      return
    }

    try {
      const created = await createEvent.mutateAsync({
        title: title.trim(),
        branchId: scope === "branch" ? branchId : undefined,
        isGlobal: scope === "global",
        locationType,
        venueOrLink: venueOrLink.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        startTime,
        endTime,
        trainerName: trainerName.trim(),
        trainerType,
        isPaid,
        amount: isPaid ? Number(amount.replace(/[^0-9.]/g, "")) || 0 : 0,
        budgetRequested: isPaid
          ? Number(budgetRequested.replace(/[^0-9.]/g, "")) || 0
          : undefined,
        flyerUrl: flyer[0]?.url,
        certificationIncluded: certification,
        description: description.trim() || undefined,
      })

      // Enrolment is a second call against the newly created event.
      const eventId = (created as { _id?: string } | null)?._id
      if (eventId && participants.length > 0) {
        await enroll.mutateAsync({
          id: eventId,
          employeeIds: participants.map((p) => p._id),
        })
      }

      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error =
    formError ??
    (createEvent.error || enroll.error
      ? hrErrorMessage(createEvent.error ?? enroll.error)
      : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <h2 className="text-[20px] font-bold text-[#111827]">Create New Training Event</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Body */}
      <div className="flex max-h-[68vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Scope */}
        <div>
          <label className={labelCls}>Training For</label>
          <div className="mt-2 flex items-center gap-6">
            <Radio
              checked={scope === "branch"}
              onChange={() => setScope("branch")}
              label="This Branch"
              disabled={pending}
            />
            <Radio
              checked={scope === "global"}
              onChange={() => setScope("global")}
              label="All Branches"
              disabled={pending}
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelCls}>Training Title</label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Governance & Financial Oversight"
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Event Type</label>
            <select
              className={inputCls}
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as TrainingLocationType)}
              disabled={pending}
            >
              {LOCATION_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Payment</label>
            <div className="mt-2 flex items-center gap-6">
              <Radio
                checked={!isPaid}
                onChange={() => setIsPaid(false)}
                label="Free"
                disabled={pending}
              />
              <Radio
                checked={isPaid}
                onChange={() => setIsPaid(true)}
                label="Paid"
                disabled={pending}
              />
            </div>
          </div>
        </div>

        {isPaid && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Amount (per participant)</label>
              <input
                className={inputCls}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="₦ 0.00"
                disabled={pending}
              />
            </div>
            <div>
              <label className={labelCls}>Budget Requested</label>
              <input
                className={inputCls}
                value={budgetRequested}
                onChange={(e) => setBudgetRequested(e.target.value)}
                inputMode="decimal"
                placeholder="₦ 0.00"
                disabled={pending}
              />
            </div>
          </div>
        )}

        {/* Participants */}
        <div>
          <label className={labelCls}>Enrol Staff (optional)</label>
          <EmployeeMultiPicker
            value={participants}
            onChange={setParticipants}
            disabled={pending}
          />
        </div>

        {/* Trainer + venue */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Trainer Name</label>
            <input
              className={inputCls}
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              placeholder="e.g. Pastor Caleb Obi"
              disabled={pending}
            />
          </div>
          <div>
            <label className={labelCls}>Trainer Type</label>
            <select
              className={inputCls}
              value={trainerType}
              onChange={(e) => setTrainerType(e.target.value as "internal" | "external")}
              disabled={pending}
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            {locationType === "virtual" ? "Meeting Link" : "Venue"}
          </label>
          <input
            className={inputCls}
            value={venueOrLink}
            onChange={(e) => setVenueOrLink(e.target.value)}
            placeholder={
              locationType === "virtual" ? "https://…" : "e.g. Main Auditorium, Maryland"
            }
            disabled={pending}
          />
        </div>

        {/* Upload E-Flyer */}
        <div>
          <label className={labelCls}>Upload E-Flyer</label>
          <HrFileDrop
            files={flyer}
            onChange={(files) => setFlyer(files.slice(-1))}
            folder="hr/trainings"
            branchId={branchId || undefined}
            hint="JPG, PNG or PDF (max. 5MB)"
            disabled={pending}
          />
        </div>

        {/* Dates / Times */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Start Date</label>
            <input
              type="date"
              className={inputCls}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={pending}
            />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input
              type="date"
              className={inputCls}
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={pending}
            />
          </div>
          <div>
            <label className={labelCls}>Start Time</label>
            <input
              type="time"
              className={inputCls}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={pending}
            />
          </div>
          <div>
            <label className={labelCls}>End Time</label>
            <input
              type="time"
              className={inputCls}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={pending}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={3}
            className={inputCls}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the purpose of this training session..."
            disabled={pending}
          />
        </div>

        {/* Certification Included */}
        <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#111827]">
          <input
            type="checkbox"
            checked={certification}
            onChange={(e) => setCertification(e.target.checked)}
            disabled={pending}
            className="h-4 w-4 rounded border-[#D1D5DB] accent-[#2563EB]"
          />
          Certification Included?
        </label>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1D4FD7] disabled:opacity-60"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Create Training
        </button>
      </div>
    </ModalShell>
  )
}
