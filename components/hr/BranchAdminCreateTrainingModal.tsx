"use client"

import { useState } from "react"
import { X, UploadCloud, Plus } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { cn } from "@/lib/utils"

const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

type TrainingFor = "For Myself" | "For Branch"
type Payment = "Free" | "Paid"

type Participant = { id: number }

function Radio({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#111827]">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
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
  const [trainingFor, setTrainingFor] = useState<TrainingFor>("For Myself")
  const [payment, setPayment] = useState<Payment>("Free")
  const [participants, setParticipants] = useState<Participant[]>([{ id: 1 }])

  const addParticipant = () =>
    setParticipants((prev) => [...prev, { id: (prev.at(-1)?.id ?? 0) + 1 }])

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
        {/* Training For */}
        <div>
          <label className={labelCls}>Training For</label>
          <div className="mt-2 flex items-center gap-6">
            <Radio
              checked={trainingFor === "For Myself"}
              onChange={() => setTrainingFor("For Myself")}
              label="For Myself"
            />
            <Radio
              checked={trainingFor === "For Branch"}
              onChange={() => setTrainingFor("For Branch")}
              label="For Branch"
            />
          </div>
        </div>

        {/* Training Title */}
        <div>
          <label className={labelCls}>Training Title</label>
          <input className={inputCls} placeholder="e.g. Governance & Financial Oversight" />
        </div>

        {/* Event Type + Payment */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Event Type</label>
            <select className={inputCls} defaultValue="Virtual">
              <option>Virtual</option>
              <option>Physical</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Payment</label>
            <div className="mt-2.5 flex items-center gap-6">
              <Radio
                checked={payment === "Free"}
                onChange={() => setPayment("Free")}
                label="Free"
              />
              <Radio
                checked={payment === "Paid"}
                onChange={() => setPayment("Paid")}
                label="Paid"
              />
            </div>
          </div>
        </div>

        {/* Conditional: Paid */}
        {payment === "Paid" && (
          <div className="flex flex-col gap-4 rounded-[12px] border border-[#EEF1F6] bg-[#FAFBFF] p-4">
            <div>
              <label className={labelCls}>Amount</label>
              <input className={inputCls} placeholder="₦ 0.00" />
            </div>

            {participants.map((participant, idx) => (
              <div key={participant.id} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  {idx === 0 && <label className={labelCls}>Participant Name</label>}
                  <input className={idx === 0 ? inputCls : "w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#2563EB]"} placeholder="Participant Name" />
                </div>
                <div>
                  {idx === 0 && <label className={labelCls}>Phone Number</label>}
                  <input className={idx === 0 ? inputCls : "w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#2563EB]"} placeholder="Phone Number" />
                </div>
                <div>
                  {idx === 0 && <label className={labelCls}>Participant Email</label>}
                  <input className={idx === 0 ? inputCls : "w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#2563EB]"} placeholder="Participant Email" />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addParticipant}
              className="flex items-center gap-1.5 self-start text-[12px] font-semibold text-[#2563EB] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Participants
            </button>
          </div>
        )}

        {/* Location */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Event Location Name</label>
            <input className={inputCls} placeholder="e.g. Main Auditorium" />
          </div>
          <div>
            <label className={labelCls}>Full Address</label>
            <input className={inputCls} placeholder="Street, City, State" />
          </div>
        </div>

        {/* Upload E-Flyer */}
        <div>
          <label className={labelCls}>Upload E-Flyer</label>
          <div className="mt-1.5 flex flex-col items-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-8 text-center">
            <UploadCloud className="h-9 w-9 text-[#9CA3AF]" />
            <div className="mt-3 text-[14px] font-semibold text-[#111827]">
              Click to upload or drag and drop
            </div>
            <div className="text-[12px] text-[#6B7280]">JPG, PNG or PDF (max. 5MB)</div>
          </div>
        </div>

        {/* Date / Times */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Start Time</label>
            <input type="time" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End Time</label>
            <input type="time" className={inputCls} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Briefly describe the purpose of this training session..."
          />
        </div>

        {/* Certification Included */}
        <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#111827]">
          <input type="checkbox" className="h-4 w-4 rounded border-[#D1D5DB] accent-[#2563EB]" />
          Certification Included?
        </label>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]"
        >
          Cancel
        </button>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-md bg-[#2563EB] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1D4FD7]"
          )}
        >
          Create Training
        </button>
      </div>
    </ModalShell>
  )
}
