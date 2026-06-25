"use client"

import { API_V1 } from "@/lib/api";
import { getCsrfTokenFromCookie } from "@/lib/csrf";
import { bankAccountSchema } from "@/lib/validation/bankAccount";

import React, { useEffect, useMemo, useState } from "react"
import { X, Mail, ChevronDown } from "lucide-react"
import Link from "next/link"
import DashboardPage from "../dashboard/page"
import { useAuth } from "@/components/auth/AuthProvider"

type CoaTreeNode = {
  id?: string
  _id?: string
  coaId?: string
  code?: string
  accountCode?: string
  number?: string
  name?: string
  accountName?: string
  title?: string
  accountType?: string
  children?: CoaTreeNode[]
}

type BankAccountItem = {
  _id?: string
  id?: string
  accountName?: string
  accountNumber?: string
  bankName?: string
  currency?: string
  isDomiciliary?: boolean
}

type BankAccountDetail = {
  _id?: string
  id?: string
  accountName?: string
  accountNumber?: string
  bankName?: string
  currency?: string
  isDomiciliary?: boolean
  branchId?: { _id?: string; name?: string } | string
}

function flattenCoaTree(nodes: CoaTreeNode[]): CoaTreeNode[] {
  const flat: CoaTreeNode[] = []
  const queue = [...nodes]
  while (queue.length > 0) {
    const node = queue.shift()
    if (!node) continue
    flat.push(node)
    if (Array.isArray(node.children) && node.children.length > 0) {
      queue.push(...node.children)
    }
  }
  return flat
}

export default function AddNewAccountPage() {
  const { user } = useAuth()
  const [bankName, setBankName] = useState("")
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [currency, setCurrency] = useState<"NGN" | "USD" | "GBP" | "EUR" | "CAD">("NGN")
  const [isDomiciliary, setIsDomiciliary] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([])
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false)
  const [bankAccountsError, setBankAccountsError] = useState<string | null>(null)
  const [latestAccountDetail, setLatestAccountDetail] = useState<BankAccountDetail | null>(null)
  const [coaOptions, setCoaOptions] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCoaId, setSelectedCoaId] = useState("")
  const [selectedCoaLabel, setSelectedCoaLabel] = useState("Not selected")
  const [selectedCoaName, setSelectedCoaName] = useState("")
  const [selectedCoaDescription, setSelectedCoaDescription] = useState("")
  const [selectedCoaLoading, setSelectedCoaLoading] = useState(false)
  const [updatingCoa, setUpdatingCoa] = useState(false)
  const [coaUpdateMessage, setCoaUpdateMessage] = useState<string | null>(null)
  const [coaLoading, setCoaLoading] = useState(true)
  const [coaError, setCoaError] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const getCsrfToken = getCsrfTokenFromCookie

  useEffect(() => {
    let isMounted = true

    const loadCoaOptions = async () => {
      setCoaLoading(true)
      setCoaError(null)

      try {
        const url = tenantId
          ? `${API_V1}/financial/coa/tree?branchId=${encodeURIComponent(tenantId)}`
          : `${API_V1}/financial/coa/tree`

        const coaResponse = await fetch(url, {
          method: "GET",
          credentials: "include",
        })
        const coaData = await coaResponse.json().catch(() => null)

        if (!coaResponse.ok) {
          throw new Error(coaData?.message ?? "Unable to fetch chart of accounts.")
        }

        const rawTree = Array.isArray(coaData?.data)
          ? coaData.data
          : Array.isArray(coaData?.items)
            ? coaData.items
            : Array.isArray(coaData)
              ? coaData
              : []

        const rawItems = flattenCoaTree(rawTree as CoaTreeNode[]).filter(
          (item) => String(item.accountType ?? "").toLowerCase() === "expense"
        )

        const options = rawItems.map((item: CoaTreeNode, index: number) => {
          const name =
            item?.name ?? item?.accountName ?? item?.title ?? `COA ${index + 1}`
          const code = item?.code ?? item?.accountCode ?? item?.number
          return {
            id: String(item?.id ?? item?._id ?? item?.coaId ?? `${index}`),
            label: code ? `${code} - ${name}` : name,
          }
        })

        if (isMounted) {
          setCoaOptions(options)
          if (options.length > 0) {
            setSelectedCoaId((prev) => prev || options[0].id)
          }
        }
      } catch (error) {
        if (isMounted) {
          setCoaError(
            error instanceof Error ? error.message : "Unable to load COA list."
          )
        }
      } finally {
        if (isMounted) {
          setCoaLoading(false)
        }
      }
    }

    if (tenantId) {
      loadCoaOptions()
    } else {
      setCoaLoading(false)
      setCoaError("Tenant context is missing.")
    }

    return () => {
      isMounted = false
    }
  }, [tenantId])

  useEffect(() => {
    const latestId = String(bankAccounts[0]?._id ?? bankAccounts[0]?.id ?? "").trim()
    if (!latestId) {
      setLatestAccountDetail(null)
      return
    }

    let active = true
    const loadLatestDetail = async () => {
      try {
        const response = await fetch(`${API_V1}/financial/bank-accounts/${encodeURIComponent(latestId)}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch latest bank account details.")
        }
        if (active) {
          setLatestAccountDetail((payload?.data ?? payload ?? null) as BankAccountDetail | null)
        }
      } catch {
        if (active) {
          setLatestAccountDetail(null)
        }
      }
    }

    loadLatestDetail()
    return () => {
      active = false
    }
  }, [bankAccounts])

  useEffect(() => {
    if (!tenantId) return
    let isMounted = true

    const loadBankAccounts = async () => {
      setBankAccountsLoading(true)
      setBankAccountsError(null)
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "20",
          branchId: tenantId,
        })
        const response = await fetch(`${API_V1}/financial/bank-accounts?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch bank accounts.")
        }

        const rows = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.data)
            ? payload.data.data
            : []
        if (isMounted) {
          setBankAccounts(rows as BankAccountItem[])
        }
      } catch (error) {
        if (isMounted) {
          setBankAccounts([])
          setBankAccountsError(error instanceof Error ? error.message : "Unable to fetch bank accounts.")
        }
      } finally {
        if (isMounted) setBankAccountsLoading(false)
      }
    }

    loadBankAccounts()
    return () => {
      isMounted = false
    }
  }, [tenantId])

  useEffect(() => {
    if (!selectedCoaId) {
      setSelectedCoaLabel("Not selected")
      setSelectedCoaName("")
      setSelectedCoaDescription("")
      return
    }

    let isMounted = true
    const loadCoaById = async () => {
      setSelectedCoaLoading(true)
      try {
        const response = await fetch(`${API_V1}/financial/coa/${encodeURIComponent(selectedCoaId)}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch COA details.")
        }
        const item = (payload?.data ?? payload ?? {}) as Record<string, unknown>
        const label = String(item?.name ?? item?.accountName ?? item?.title ?? "Unnamed COA")
        if (isMounted) {
          setSelectedCoaLabel(label)
          setSelectedCoaName(String(item?.name ?? item?.accountName ?? item?.title ?? ""))
          setSelectedCoaDescription(String(item?.description ?? ""))
        }
      } catch {
        if (isMounted) {
          setSelectedCoaLabel("Unavailable")
          setSelectedCoaName("")
          setSelectedCoaDescription("")
        }
      } finally {
        if (isMounted) {
          setSelectedCoaLoading(false)
        }
      }
    }

    loadCoaById()
    return () => {
      isMounted = false
    }
  }, [selectedCoaId])

  const handleUpdateSelectedCoa = async () => {
    if (!selectedCoaId || !selectedCoaName.trim()) {
      setCoaUpdateMessage("Selected account name is required.")
      return
    }

    setUpdatingCoa(true)
    setCoaUpdateMessage(null)
    try {
      const response = await fetch(`${API_V1}/financial/coa/${encodeURIComponent(selectedCoaId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: selectedCoaName.trim(),
          description: selectedCoaDescription.trim() || undefined,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to update chart of account.")
      }

      const updated = (payload?.data ?? payload ?? {}) as Record<string, unknown>
      const nextName = String(updated?.name ?? selectedCoaName.trim())
      const nextCode = String(updated?.code ?? "")
      const nextDescription = String(updated?.description ?? selectedCoaDescription.trim())

      setSelectedCoaLabel(nextName)
      setSelectedCoaName(nextName)
      setSelectedCoaDescription(nextDescription)
      setCoaOptions((prev) =>
        prev.map((item) =>
          item.id === selectedCoaId
            ? { ...item, label: nextCode ? `${nextCode} - ${nextName}` : nextName }
            : item
        )
      )
      setCoaUpdateMessage("Budget head updated successfully.")
    } catch (error) {
      setCoaUpdateMessage(error instanceof Error ? error.message : "Unable to update chart of account.")
    } finally {
      setUpdatingCoa(false)
    }
  }

  const resetForm = () => {
    setBankName("")
    setAccountName("")
    setAccountNumber("")
    setCurrency("NGN")
    setIsDomiciliary(false)
  }

  const handleCreateBankAccount = async () => {
    setSubmitMessage(null)
    setSubmitError(null)

    if (!tenantId) {
      setSubmitError("Branch context is required.")
      return
    }

    const parsed = bankAccountSchema.safeParse({
      bankName,
      accountName,
      accountNumber,
      currency,
      isDomiciliary,
      chartOfAccountId: selectedCoaId || undefined,
      branchId: tenantId,
    })
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? "Please correct the highlighted fields.")
      return
    }
    const validated = parsed.data

    setSubmitting(true)
    try {
      const existingAccount = bankAccounts.find((item) => {
        const existingNumber = String(item.accountNumber ?? "").trim()
        const existingBank = String(item.bankName ?? "").trim().toLowerCase()
        return existingNumber === validated.accountNumber && existingBank === validated.bankName.toLowerCase()
      })

      const response = await fetch(
        existingAccount?._id || existingAccount?.id
          ? `${API_V1}/financial/bank-accounts/${encodeURIComponent(
              String(existingAccount._id ?? existingAccount.id ?? "")
            )}`
          : `${API_V1}/financial/bank-accounts`,
        {
        method: existingAccount ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          accountName: validated.accountName,
          accountNumber: validated.accountNumber,
          bankName: validated.bankName,
          ...(existingAccount ? {} : { branchId: tenantId }),
          currency: validated.currency,
          isDomiciliary: validated.isDomiciliary,
          chartOfAccountId: validated.chartOfAccountId,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? `Unable to ${existingAccount ? "update" : "create"} bank account.`)
      }

      setSubmitMessage(payload?.message ?? `Bank account ${existingAccount ? "updated" : "created"} successfully.`)
      const params = new URLSearchParams({ page: "1", limit: "20", branchId: tenantId })
      const listResponse = await fetch(`${API_V1}/financial/bank-accounts?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })
      const listPayload = await listResponse.json().catch(() => null)
      if (listResponse.ok) {
        const rows = Array.isArray(listPayload?.data)
          ? listPayload.data
          : Array.isArray(listPayload?.data?.data)
            ? listPayload.data.data
            : []
        setBankAccounts(rows as BankAccountItem[])
      }
      resetForm()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create bank account.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative font-['Public_Sans',_sans-serif]">
      {/* Background Layer: Dashboard */}
      <div className="h-screen w-full overflow-hidden pointer-events-none select-none">
        <DashboardPage />
      </div>

      {/* Full-Screen Blur Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-[4px] p-4 sm:p-6 w-full">
        
        {/* Modal Container */}
        <div 
          className="relative w-full max-w-[827.2px] max-h-full lg:h-[694.32px] overflow-y-auto lg:overflow-visible rounded-[16px] bg-white p-5 sm:p-6 shadow-2xl flex flex-col shrink-0"
        >
          
          {/* Close Button */}
          <Link 
            href="/branchaccount-pastor/dashboard"
            className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </Link>

          {/* Modal Header */}
          <div className="mb-4 pr-8">
            <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Add New Bank Account</h2>
            <p className="mt-1 text-[13px] text-gray-500">
              Configure bank details and automated email parsing for real-time reconciliation.
            </p>
          </div>

          {/* Grid Layout Layout Split */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              
              {/* Account Details Card */}
              <div className="rounded-[12px] border border-gray-200 p-5">
                <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                  Account Details
                </h3>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Bank Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Zenith Bank" 
                        value={bankName}
                        onChange={(event) => setBankName(event.target.value)}
                        className="h-[30.7px] w-full rounded-[3.23px] border-[0.81px] border-gray-200 px-3 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Account Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Main Operations" 
                        value={accountName}
                        onChange={(event) => setAccountName(event.target.value)}
                        className="h-[30.7px] w-full rounded-[3.23px] border-[0.81px] border-gray-200 px-3 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Account Number</label>
                    <input 
                      type="text" 
                      placeholder="10-digit account number" 
                      value={accountNumber}
                      onChange={(event) => setAccountNumber(event.target.value)}
                      className="h-[30.7px] w-full rounded-[3.23px] border-[0.81px] border-gray-200 px-3 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Default Currency</label>
                      <div className="relative">
                        <select
                          value={currency}
                          onChange={(event) => setCurrency(event.target.value as "NGN" | "USD" | "GBP" | "EUR" | "CAD")}
                          className="h-[30.7px] w-full appearance-none rounded-[3.23px] border-[0.81px] border-gray-200 bg-white pl-3 pr-10 text-[13px] font-medium text-gray-900 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all"
                        >
                          <option value="NGN">NGN</option>
                          <option value="USD">USD</option>
                          <option value="GBP">GBP</option>
                          <option value="EUR">EUR</option>
                          <option value="CAD">CAD</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Assign to Budget Head</label>
                      <div className="relative">
                        <select
                          value={selectedCoaId}
                          onChange={(event) => setSelectedCoaId(event.target.value)}
                          className="h-[30.7px] w-full appearance-none rounded-[3.23px] border-[0.81px] border-gray-200 bg-white pl-3 pr-10 text-[12.5px] font-medium text-gray-900 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all"
                        >
                          {coaLoading ? (
                            <option>Loading chart of accounts...</option>
                          ) : coaError ? (
                            <option>{coaError}</option>
                          ) : coaOptions.length === 0 ? (
                            <option>No COA entries available</option>
                          ) : (
                            coaOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))
                          )}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      {selectedCoaId && (
                        <div className="mt-2 space-y-2 rounded-[8px] border border-gray-200 bg-gray-50 p-2.5">
                          <input
                            type="text"
                            value={selectedCoaName}
                            onChange={(event) => setSelectedCoaName(event.target.value)}
                            placeholder="Budget head name"
                            className="h-[30px] w-full rounded-[6px] border border-gray-200 bg-white px-2.5 text-[12px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
                          />
                          <input
                            type="text"
                            value={selectedCoaDescription}
                            onChange={(event) => setSelectedCoaDescription(event.target.value)}
                            placeholder="Description (optional)"
                            className="h-[30px] w-full rounded-[6px] border border-gray-200 bg-white px-2.5 text-[12px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={handleUpdateSelectedCoa}
                              disabled={updatingCoa}
                              className="h-[28px] rounded-[6px] bg-[#3B5BDB] px-2.5 text-[11px] font-semibold text-white disabled:opacity-60"
                            >
                              {updatingCoa ? "Saving..." : "Update Budget Head"}
                            </button>
                            {coaUpdateMessage && (
                              <span className="text-[10px] font-medium text-[#6B7280]">{coaUpdateMessage}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Notification Setup Card */}
              <div className="rounded-[12px] border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Mail className="h-4.5 w-4.5 text-[#3B5BDB]" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                    Email Notification Setup
                  </h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Dedicated Notification Email</label>
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        readOnly
                        value={String(user?.email ?? "No notification email available")}
                        className="h-[30.7px] w-full rounded-[3.23px] border-[0.81px] border-gray-200 bg-white pl-3 pr-10 text-[13px] font-medium text-[#374151] focus:outline-none cursor-default"
                      />
                      <span className="absolute right-3.5 flex items-center justify-center text-gray-400 font-medium text-[15px]">
                        @
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] font-medium text-gray-500">
                      The inbox that receives transaction alerts from your bank.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Bank Template Selection</label>
                    <div className="relative">
                      <select className="h-[30.7px] w-full appearance-none rounded-[3.23px] border-[0.81px] border-gray-200 bg-white pl-3 pr-10 text-[13px] text-gray-500 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all">
                        <option>Select bank to apply parser template...</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="h-fit rounded-[12px] border border-dashed border-gray-300 bg-[#F9FAFB] p-6">
              <h3 className="mb-5 text-[11px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                Setup Preview
              </h3>

              <div className="space-y-4 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Domiciliary Account</span>
                  <input
                    type="checkbox"
                    checked={isDomiciliary}
                    onChange={(event) => setIsDomiciliary(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#3B5BDB] focus:ring-[#3B5BDB]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Real-time Sync</span>
                  <span className="font-semibold text-emerald-600">Enabled</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Verification Method</span>
                  <span className="font-semibold text-gray-900">Email Forwarding</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">COA Linkage</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCoaLoading ? "Loading..." : selectedCoaLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Existing Accounts</span>
                  <span className="font-semibold text-gray-900">
                    {bankAccountsLoading ? "Loading..." : String(bankAccounts.length)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Latest Account</span>
                  <span className="font-semibold text-gray-900 truncate max-w-[140px] text-right">
                    {latestAccountDetail?.accountName ?? bankAccounts[0]?.accountName ?? "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Latest Number</span>
                  <span className="font-semibold text-gray-900">
                    {latestAccountDetail?.accountNumber ?? "—"}
                  </span>
                </div>
              </div>

              {bankAccountsError && <div className="mt-4 text-[11px] font-semibold text-rose-600">{bankAccountsError}</div>}
              {submitMessage && <div className="mt-4 text-[11px] font-semibold text-emerald-600">{submitMessage}</div>}
              {submitError && <div className="mt-4 text-[11px] font-semibold text-rose-600">{submitError}</div>}
              <button
                onClick={handleCreateBankAccount}
                disabled={submitting}
                className="mt-8 flex h-11 w-full items-center justify-center rounded-[8px] bg-[#111827] text-[13px] font-bold text-white shadow-sm hover:bg-[#1f2937] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Finalize & Save Account"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}


