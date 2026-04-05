"use client"

import React, { useEffect, useMemo, useState } from "react"
import { X, Mail, ChevronDown } from "lucide-react"
import Link from "next/link"
import DashboardPage from "../dashboard/page"
import { useAuth } from "@/components/auth/AuthProvider"

export default function AddNewAccountPage() {
  const { user } = useAuth()
  const [coaOptions, setCoaOptions] = useState<Array<{ id: string; label: string }>>([])
  const [coaLoading, setCoaLoading] = useState(true)
  const [coaError, setCoaError] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  useEffect(() => {
    let isMounted = true

    const loadCoaOptions = async () => {
      setCoaLoading(true)
      setCoaError(null)

      try {
        const url = tenantId
          ? `/api/core/financial/coa?type=EXPENSE&tenantId=${encodeURIComponent(tenantId)}`
          : "/api/core/financial/coa?type=EXPENSE"

        const coaResponse = await fetch(url, {
          method: "GET",
          credentials: "include",
        })
        const coaData = await coaResponse.json().catch(() => null)

        if (!coaResponse.ok) {
          throw new Error(coaData?.message ?? "Unable to fetch chart of accounts.")
        }

        const rawItems = Array.isArray(coaData?.data?.content)
          ? coaData.data.content
          : Array.isArray(coaData?.data)
            ? coaData.data
            : Array.isArray(coaData?.items)
              ? coaData.items
              : Array.isArray(coaData)
                ? coaData
                : []

        const options = rawItems.map((item: any, index: number) => {
          const name =
            item?.name ?? item?.accountName ?? item?.title ?? `COA ${index + 1}`
          const code = item?.code ?? item?.accountCode ?? item?.number
          return {
            id: String(item?.id ?? item?.coaId ?? `${index}`),
            label: code ? `${code} - ${name}` : name,
          }
        })

        if (isMounted) {
          setCoaOptions(options)
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
                        className="h-[30.7px] w-full rounded-[3.23px] border-[0.81px] border-gray-200 px-3 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Account Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Main Operations" 
                        className="h-[30.7px] w-full rounded-[3.23px] border-[0.81px] border-gray-200 px-3 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Account Number</label>
                    <input 
                      type="text" 
                      placeholder="10-digit account number" 
                      className="h-[30.7px] w-full rounded-[3.23px] border-[0.81px] border-gray-200 px-3 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Default Currency</label>
                      <div className="relative">
                        <select className="h-[30.7px] w-full appearance-none rounded-[3.23px] border-[0.81px] border-gray-200 bg-white pl-3 pr-10 text-[13px] font-medium text-gray-900 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all">
                          <option>₦ Naira</option>
                          <option>$ USD</option>
                          <option>£ GBP</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">Assign to Budget Head</label>
                      <div className="relative">
                        <select className="h-[30.7px] w-full appearance-none rounded-[3.23px] border-[0.81px] border-gray-200 bg-white pl-3 pr-10 text-[12.5px] font-medium text-gray-900 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all">
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
                        value="alerts@gracechapel.com" 
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
                        <option>Zenith Bank Parser</option>
                        <option>Access Bank Parser</option>
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
                  <span className="font-medium text-gray-500">Real-time Sync</span>
                  <span className="font-semibold text-emerald-600">Enabled</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Verification Method</span>
                  <span className="font-semibold text-gray-900">Email Forwarding</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">COA Linkage</span>
                  <span className="font-semibold text-gray-900">Operational Expenses</span>
                </div>
              </div>

              <button className="mt-8 flex h-11 w-full items-center justify-center rounded-[8px] bg-[#111827] text-[13px] font-bold text-white shadow-sm hover:bg-[#1f2937] active:scale-[0.98] transition-all">
                Finalize & Save Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
