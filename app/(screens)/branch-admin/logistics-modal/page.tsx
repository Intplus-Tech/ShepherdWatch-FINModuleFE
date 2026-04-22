"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Inter } from "next/font/google"
import Link from "next/link"
import LogisticsRepairsPage from "../logistics-repair/page"
import {
  X,
  Building2,
  ChevronDown,
  Wrench,
  Info
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

export default function LogisticsModalPage() {
  const { user } = useAuth()
  const [assetId, setAssetId] = useState("")
  const [branchId, setBranchId] = useState("")
  const [assetLabel, setAssetLabel] = useState("Asset")
  const [maintenanceType, setMaintenanceType] = useState("routine")
  const [scheduleInterval, setScheduleInterval] = useState("30")
  const [vendor, setVendor] = useState("")
  const [cost, setCost] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )
  const defaultBranchId = useMemo(
    () => user?.branchId ?? user?.branch?.id ?? "",
    [user]
  )

  useEffect(() => {
    let isMounted = true

    const fetchFirstAsset = async () => {
      if (!tenantId) return
      try {
        const response = await fetch(`/api/core/financial/fixed-assets?tenantId=${tenantId}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load assets.")
        }

        const data =
          payload?.data?.content ??
          payload?.data ??
          payload?.content ??
          []
        const firstAsset = Array.isArray(data) ? data[0] : null
        if (firstAsset && isMounted) {
          setAssetId(firstAsset?.id ?? firstAsset?.assetId ?? "")
          setAssetLabel(firstAsset?.description ?? firstAsset?.name ?? "Asset")
          setBranchId(firstAsset?.branchId ?? firstAsset?.branch?.id ?? defaultBranchId)
        } else if (isMounted) {
          setBranchId(defaultBranchId)
        }
      } catch (error) {
        if (isMounted) {
          setSubmitError(error instanceof Error ? error.message : "Unable to load assets.")
        }
      }
    }

    fetchFirstAsset()

    return () => {
      isMounted = false
    }
  }, [tenantId, defaultBranchId])

  const handleSubmit = async () => {
    if (!assetId) {
      setSubmitError("Asset is required to schedule maintenance.")
      return
    }
    if (!branchId) {
      setSubmitError("Branch is required to schedule maintenance.")
      return
    }
    if (!vendor.trim()) {
      setSubmitError("Service provider is required to schedule maintenance.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const intervalDays = Number(scheduleInterval) || 30
      const scheduledDate = new Date()
      scheduledDate.setDate(scheduledDate.getDate() + intervalDays)

      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          assetId,
          branchId,
          serviceType: maintenanceType,
          description: `${maintenanceType === "routine" ? "Routine check" : "Repair"} - ${assetLabel}`,
          provider: vendor.trim(),
          cost: cost ? Number(cost.replace(/[^\d.]/g, "")) : 0,
          currency: "NGN",
          scheduledDate: scheduledDate.toISOString().slice(0, 10),
          notes: vendor ? `Service Provider: ${vendor}` : undefined,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to schedule maintenance.")
      }

      setSubmitSuccess("Maintenance scheduled successfully.")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to schedule maintenance.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`relative w-full min-h-[100dvh] bg-white ${inter.className}`}>
      
      {/* Blurred Background */}
      <div className="h-[100dvh] w-full overflow-hidden pointer-events-none filter blur-[3px]">
        <LogisticsRepairsPage />
      </div>

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#111827]/40 backdrop-blur-[2px]">
        
        {/* Modal Container */}
        <div className="bg-white rounded-[16px] shadow-2xl w-[95%] sm:w-full max-w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#E5E7EB]/50">
          
          {/* Header */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-[#EEF1F6]">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <Wrench className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-[#2563EB]" strokeWidth={2.5} />
              </div>
              <h2 
                className="text-[#111827]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "16.01px",
                  lineHeight: "24.9px",
                  letterSpacing: "0%",
                  verticalAlign: "middle"
                }}
              >
                Schedule Maintenance
              </h2>
            </div>
            <Link href="/branch-admin/logistics-repair" className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#9CA3AF] hover:text-[#4B5563]">
              <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 flex flex-col gap-4">
            
            {/* Info Banner */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start">
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#DBEAFE] mt-0.5 sm:mt-0">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#2563EB]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[12px] sm:text-[13.5px] font-[800] text-[#1E3A8A] leading-tight">
                  Asset: {assetLabel} - Scheduled: {new Date(new Date().setDate(new Date().getDate() + (Number(scheduleInterval) || 30))).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
                <div className="text-[10.5px] sm:text-[12px] font-[500] text-[#3B82F6] leading-snug">
                  Regular maintenance helps extend asset lifespan.
                </div>
              </div>
            </div>

            {/* Grid Row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] sm:text-[13px] font-[700] text-[#4B5563]">Maintenance Type</label>
                <div className="relative">
                  <select
                    value={maintenanceType}
                    onChange={(event) => setMaintenanceType(event.target.value)}
                    className="h-[38px] sm:h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 sm:px-3.5 pr-8 sm:pr-10 text-[12px] sm:text-[14px] font-[500] text-[#111827] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="routine">Routine Check</option>
                    <option value="repair">Emergency Repair</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] sm:text-[13px] font-[700] text-[#4B5563]">Scheduled Date</label>
                <div className="relative">
                  <select
                    value={scheduleInterval}
                    onChange={(event) => setScheduleInterval(event.target.value)}
                    className="h-[38px] sm:h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 sm:px-3.5 pr-8 sm:pr-10 text-[12px] sm:text-[14px] font-[500] text-[#111827] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="30">Every 30 Days</option>
                    <option value="60">Every 60 Days</option>
                    <option value="90">Every 90 Days</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Service Provider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] sm:text-[13px] font-[700] text-[#4B5563]">Service Provider / Vendor</label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-2.5 sm:left-3.5 h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-[#9CA3AF]" strokeWidth={2} />
                <input
                  type="text" 
                  placeholder="e.g. Excellence Auto Services Ltd." 
                  value={vendor}
                  onChange={(event) => setVendor(event.target.value)}
                  className="h-[38px] sm:h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-[30px] sm:pl-[38px] pr-3 sm:pr-4 text-[12px] sm:text-[14px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] sm:text-[13px] font-[700] text-[#4B5563]">Estimated Cost</label>
              <div className="relative flex items-center h-[38px] sm:h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 sm:px-3.5 shadow-sm focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20 transition-all">
                <span className="text-[13px] sm:text-[15px] font-[700] text-[#9CA3AF] mr-1">₦</span>
                <input 
                  type="text" 
                  placeholder="0.00" 
                  value={cost}
                  onChange={(event) => setCost(event.target.value)}
                  className="h-full w-full bg-transparent text-[12px] sm:text-[14px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                />
              </div>
              <div className="text-[10px] sm:text-[11.5px] font-[500] text-[#9CA3AF] mt-0.5">
                Leave blank if cost is pending from vendor.
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#EEF1F6] my-0.5 sm:my-1"></div>

            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col pr-2 sm:pr-4">
                <div className="text-[11.5px] sm:text-[13.5px] font-[800] text-[#111827] leading-tight mb-0.5">Create Payment Requisition</div>
                <div className="text-[10px] sm:text-[12px] font-[500] text-[#6B7280] leading-snug">Notify admin to approve & release funds</div>
              </div>
              <label className="relative inline-flex items-center justify-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-4.5 sm:w-11 sm:h-6 bg-[#E5E7EB] rounded-full peer peer-checked:bg-[#2563EB] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-sm border border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2563EB]/30"></div>
              </label>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-3 sm:p-5 sm:px-6 sm:py-4 bg-[#F9FAFB] border-t border-[#EEF1F6] flex flex-col gap-2.5 sm:gap-3 mt-auto">
            {(submitError || submitSuccess) && (
              <div className="text-[11.5px] font-[700] text-left">
                {submitSuccess && <span className="text-emerald-600">{submitSuccess}</span>}
                {submitError && <span className="text-[#DC2626]">{submitError}</span>}
              </div>
            )}
            <div className="flex items-center justify-end gap-2.5 sm:gap-3">
            <Link href="/branch-admin/logistics-repair" className="w-[110px] sm:w-auto h-[36px] sm:h-[40px] px-3 sm:px-6 rounded-[8px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[11.5px] sm:text-[13.5px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none h-[36px] sm:h-[40px] px-3 sm:px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center text-[11.5px] sm:text-[13.5px] font-[800] text-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Scheduling..." : "Confirm Schedule"}
            </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}


