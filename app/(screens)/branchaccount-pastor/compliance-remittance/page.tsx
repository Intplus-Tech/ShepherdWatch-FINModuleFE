"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Bell, ChevronDown } from "lucide-react"
import { useStatutoryDeductions, type DeductionType } from "@/components/hooks/useStatutoryDeductions"
import { useComplianceSummary } from "@/components/hooks/useComplianceSummary"

export default function Page() {
  const { user } = useAuth()
  const tenantId = useMemo(() => user?.tenantId ?? user?.tenant?.id ?? "", [user])
  const {
    createDeduction,
    fetchDeductions,
    getDeductionById,
    updateDeduction,
    remitDeduction,
    deductions,
    selectedDeduction,
    pagination,
    creating,
    updating,
    remitting,
    loading,
    detailLoading,
    error,
    listError,
    detailError,
    setError,
  } = useStatutoryDeductions()
  const {
    complianceData: complianceSummary,
    loading: summaryLoading,
    error: summaryError,
    fetchSummary,
  } = useComplianceSummary()

  const [success, setSuccess] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const [remitSuccess, setRemitSuccess] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editPeriod, setEditPeriod] = useState("")
  const [remittanceDate, setRemittanceDate] = useState("")
  const [receiptNumber, setReceiptNumber] = useState("")
  const [form, setForm] = useState<{
    type: DeductionType
    employeeProfileId: string
    amount: string
    period: string
  }>({
    type: "paye",
    employeeProfileId: "",
    amount: "",
    period: "",
  })

  useEffect(() => {
    if (!tenantId) return
    fetchDeductions({ branchId: tenantId, page: 1, limit: 10 }).catch(() => undefined)
    const year = new Date().getFullYear()
    fetchSummary({ branchId: tenantId, startDate: `${year}-01-01`, endDate: `${year}-12-31` }).catch(() => undefined)
  }, [tenantId, fetchDeductions, fetchSummary])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess(null)
    setError(null)

    const amount = Number(form.amount)
    if (!form.employeeProfileId.trim()) {
      setError("Employee profile ID is required.")
      return
    }
    if (!form.period.trim()) {
      setError("Period is required. Use format YYYY-MM.")
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than 0.")
      return
    }

    try {
      await createDeduction({
        type: form.type,
        employeeProfileId: form.employeeProfileId.trim(),
        amount,
        period: form.period.trim(),
        branchId: tenantId || undefined,
      })
      setSuccess("Statutory deduction created successfully.")
      setForm((prev) => ({ ...prev, employeeProfileId: "", amount: "" }))
      await fetchDeductions({ branchId: tenantId, page: 1, limit: 10 })
    } catch {
      // error handled in hook state
    }
  }

  const handleSelect = (id: string) => {
    setUpdateSuccess(null)
    setRemitSuccess(null)
    getDeductionById(id)
      .then((deduction) => {
        setEditAmount(deduction.amount ? String(deduction.amount) : "")
        setEditPeriod(deduction.period || "")
        setRemittanceDate(deduction.remittedAt ? deduction.remittedAt.slice(0, 10) : "")
        setReceiptNumber(deduction.receiptNumber || "")
      })
      .catch(() => undefined)
  }

  const handleUpdate = async () => {
    if (!selectedDeduction) return
    setUpdateSuccess(null)
    setError(null)

    const amount = Number(editAmount)
    if (!editPeriod.trim()) {
      setError("Period is required.")
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than 0.")
      return
    }

    try {
      await updateDeduction(selectedDeduction.id, {
        amount,
        period: editPeriod.trim(),
      })
      setUpdateSuccess("Deduction updated successfully.")
      await fetchDeductions({ branchId: tenantId, page: 1, limit: 10 })
    } catch {
      // handled in hook state
    }
  }

  const handleRemit = async () => {
    if (!selectedDeduction || selectedDeduction.remitted) return
    setRemitSuccess(null)
    setError(null)

    try {
      await remitDeduction(selectedDeduction.id, {
        remittanceDate: remittanceDate || undefined,
        receiptNumber: receiptNumber.trim() || undefined,
      })
      setRemitSuccess("Deduction marked as remitted successfully.")
      await fetchDeductions({ branchId: tenantId, page: 1, limit: 10 })
    } catch {
      // handled in hook state
    }
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/compliance-remittance" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader
              title="Compliance"
              subtitle="Monitor compliance and remittances."
              rightSlot={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    January 2024
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                </div>
              }
            />

            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
              <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5">
                <div className="text-[13px] font-semibold text-[#111827]">Create Statutory Deduction</div>
                <p className="mt-1 text-[11px] text-[#6B7280]">
                  Create PAYE, pension, or NHF deductions in pending remittance status.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="space-y-1 text-[11px] text-[#6B7280]">
                      <span className="font-medium">Deduction Type</span>
                      <select
                        value={form.type}
                        onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as DeductionType }))}
                        className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#111827]"
                      >
                        <option value="paye">PAYE</option>
                        <option value="pension">Pension</option>
                        <option value="nhf">NHF</option>
                      </select>
                    </label>

                    <label className="space-y-1 text-[11px] text-[#6B7280]">
                      <span className="font-medium">Period</span>
                      <input
                        type="month"
                        value={form.period}
                        onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
                        className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#111827]"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1 text-[11px] text-[#6B7280]">
                    <span className="font-medium">Employee Profile ID</span>
                    <input
                      type="text"
                      value={form.employeeProfileId}
                      onChange={(e) => setForm((prev) => ({ ...prev, employeeProfileId: e.target.value }))}
                      placeholder="e.g. 665f1a2b3c4d5e6f70890140"
                      className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#111827]"
                    />
                  </label>

                  <label className="block space-y-1 text-[11px] text-[#6B7280]">
                    <span className="font-medium">Amount</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#111827]"
                    />
                  </label>

                  <div className="rounded-[8px] bg-[#F9FAFB] px-3 py-2 text-[11px] text-[#6B7280]">
                    Branch ID: <span className="font-semibold text-[#111827]">{tenantId || "Not available"}</span>
                  </div>

                  {error && <div className="text-[11px] font-medium text-rose-600">{error}</div>}
                  {success && <div className="text-[11px] font-medium text-emerald-600">{success}</div>}

                  <Button
                    type="submit"
                    disabled={creating}
                    className="h-9 rounded-[8px] bg-[#3B5BDB] px-4 text-[11px] text-white"
                  >
                    {creating ? "Creating..." : "Create Deduction"}
                  </Button>
                </form>
              </div>

              <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5">
                <div className="text-[13px] font-semibold text-[#111827]">Recent Deductions</div>
                <p className="mt-1 text-[11px] text-[#6B7280]">Latest statutory deductions from the compliance register.</p>

                <div className="mt-4 space-y-2">
                  {summaryLoading && (
                    <div className="rounded-[8px] border border-dashed border-[#E5E7EB] px-3 py-2 text-[10px] text-[#9CA3AF]">
                      Loading summary...
                    </div>
                  )}
                  {summaryError && (
                    <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[10px] text-rose-600">
                      {summaryError}
                    </div>
                  )}
                  {complianceSummary && (
                    <div className="rounded-[8px] border border-[#EEF1F6] bg-[#F9FAFB] px-3 py-2 text-[10px] text-[#4B5563]">
                      Total Deductions: <span className="font-semibold text-[#111827]">{formatCurrency(complianceSummary.totalDeductions)}</span> · Outstanding: <span className="font-semibold text-[#111827]">{formatCurrency(complianceSummary.outstanding)}</span>
                    </div>
                  )}
                  {loading && (
                    <div className="rounded-[8px] border border-dashed border-[#E5E7EB] px-3 py-4 text-[11px] text-[#9CA3AF]">
                      Loading deductions...
                    </div>
                  )}
                  {!loading && listError && (
                    <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-4 text-[11px] text-rose-600">
                      {listError}
                    </div>
                  )}
                  {!loading && !listError && deductions.length === 0 && (
                    <div className="rounded-[8px] border border-dashed border-[#E5E7EB] px-3 py-4 text-[11px] text-[#9CA3AF]">
                      No deductions created yet.
                    </div>
                  )}
                  {deductions.map((item) => (
                    <div key={item.id} className="rounded-[8px] border border-[#EEF1F6] px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold text-[#111827] uppercase">{item.type}</div>
                        <div className="text-[11px] font-semibold text-[#111827]">{formatCurrency(item.amount)}</div>
                      </div>
                      <div className="mt-1 text-[10px] text-[#6B7280]">Period: {item.period}</div>
                      <div className="text-[10px] text-[#6B7280]">Remittance: {item.remitted ? "Remitted" : "Pending"}</div>
                      <button
                        onClick={() => {
                          handleSelect(item.id)
                        }}
                        className="mt-2 rounded border border-[#E5E7EB] px-2.5 py-1 text-[10px] font-semibold text-[#4B5563] hover:bg-gray-50"
                      >
                        View details
                      </button>
                    </div>
                  ))}
                  {(detailLoading || detailError || selectedDeduction) && (
                    <div className="rounded-[8px] border border-[#EEF1F6] bg-[#F9FAFB] px-3 py-2 text-[10px] text-[#4B5563]">
                      {detailLoading && <div>Loading deduction details...</div>}
                      {!detailLoading && detailError && <div className="text-rose-600">{detailError}</div>}
                      {!detailLoading && !detailError && selectedDeduction && (
                        <div>
                          <div className="font-semibold text-[#111827]">Selected Deduction</div>
                          <div className="mt-1">ID: {selectedDeduction.id}</div>
                          <div>Type: {selectedDeduction.type.toUpperCase()}</div>
                          <div>Status: {selectedDeduction.remitted ? "Remitted" : "Pending"}</div>
                          {!selectedDeduction.remitted && (
                            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto] md:items-end">
                              <label className="space-y-1">
                                <span className="font-medium">Amount</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="h-8 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[11px] text-[#111827]"
                                />
                              </label>
                              <label className="space-y-1">
                                <span className="font-medium">Period</span>
                                <input
                                  type="month"
                                  value={editPeriod}
                                  onChange={(e) => setEditPeriod(e.target.value)}
                                  className="h-8 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[11px] text-[#111827]"
                                />
                              </label>
                              <button
                                onClick={handleUpdate}
                                disabled={updating}
                                className="h-8 rounded-[8px] bg-[#3B5BDB] px-3 text-[10px] font-semibold text-white disabled:opacity-60"
                              >
                                {updating ? "Saving..." : "Update"}
                              </button>
                              <label className="space-y-1">
                                <span className="font-medium">Remit Date</span>
                                <input
                                  type="date"
                                  value={remittanceDate}
                                  onChange={(e) => setRemittanceDate(e.target.value)}
                                  className="h-8 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[11px] text-[#111827]"
                                />
                              </label>
                              <label className="space-y-1">
                                <span className="font-medium">Receipt No.</span>
                                <input
                                  type="text"
                                  value={receiptNumber}
                                  onChange={(e) => setReceiptNumber(e.target.value)}
                                  placeholder="Optional"
                                  className="h-8 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[11px] text-[#111827]"
                                />
                              </label>
                              <button
                                onClick={handleRemit}
                                disabled={remitting}
                                className="h-8 rounded-[8px] bg-emerald-600 px-3 text-[10px] font-semibold text-white disabled:opacity-60"
                              >
                                {remitting ? "Remitting..." : "Mark Remitted"}
                              </button>
                            </div>
                          )}
                          {selectedDeduction.remitted && (
                            <div className="mt-2 text-[10px] text-amber-700">
                              This deduction is remitted and can no longer be updated.
                            </div>
                          )}
                          {updateSuccess && (
                            <div className="mt-2 text-[10px] font-medium text-emerald-600">{updateSuccess}</div>
                          )}
                          {remitSuccess && (
                            <div className="mt-2 text-[10px] font-medium text-emerald-600">{remitSuccess}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {pagination && (
                    <div className="pt-1 text-[10px] text-[#9CA3AF]">
                      Showing {deductions.length} of {pagination.total} records
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
