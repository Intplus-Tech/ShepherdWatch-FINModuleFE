"use client"

import React, { useState, useRef, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Download,
  ChevronDown,
  Settings2,
  Plus,
  Check
} from "lucide-react"
import { useRouter } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import { useAssetClasses } from "@/components/hooks/useAssetClasses"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useModalParam } from "@/components/hooks/useModalParam"
import NewAssetCategoryModal from "@/components/modals/NewAssetCategoryModal"

function Dropdown({
  value, 
  options, 
  onChange,
  isOpen,
  setIsOpen
}: { 
  value: string; 
  options: string[]; 
  onChange: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setIsOpen])

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-[200px] rounded-[6px] border bg-white px-3 py-1.5 text-[12px] font-medium shadow-sm transition-colors ${
          isOpen ? 'border-[#3B5BDB] ring-1 ring-[#3B5BDB]/20 text-[#3B5BDB]' : 'border-[#E5E7EB] text-[#4B5563] hover:border-[#D1D5DB]'
        }`}
      >
        {value}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180 text-[#3B5BDB]' : 'text-[#9CA3AF]'}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-[240px] w-[200px] overflow-y-auto rounded-[8px] border border-[#EEF1F6] bg-white py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] hover:bg-[#F8FAFC]"
            >
              <span className={opt === value ? "text-[#111827] font-medium" : "text-[#4B5563]"}>
                {opt}
              </span>
              {opt === value && <Check className="h-3.5 w-3.5 text-[#6B7280]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ModalContainer() {
  const { isOpen, close } = useModalParam('new-asset-category')

  return (
    <NewAssetCategoryModal 
      isOpen={isOpen} 
      onClose={close} 
    />
  )
}

function PageInner() {
  const router = useRouter()

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const { assetClasses, isLoading: loading, error } = useAssetClasses()

  const methodOptions = [
    "Straight Line",
    "Reducing Balance",
    "Sum of Years' Digits",
    "Units of Production"
  ]


  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">

      <SidebarNav
        activeHref="/director-screen/assets"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] flex flex-col min-w-0 text-[#111827]">

        {/* Mobile Header Top Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#EEF1F6] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={130} height={28} className="object-contain" />
          </div>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200">
             <Image src="/images/Beared%20Guy02-min%201.jpg" alt="User" width={32} height={32} className="h-full w-full object-cover" />
          </div>
        </header>

        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center justify-center sm:justify-start gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 w-full sm:w-auto sm:ml-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <h2 className="text-[14px] font-[800] text-[#344054] tracking-wide uppercase mb-6">
            ASSET & DEPRECIATION MANAGER
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <Link href="/director-screen/assets" className="rounded-[10px] border border-[#3B5BDB] bg-[#F0F4FF] p-5 cursor-pointer shadow-sm block">
              <div className="text-[13px] font-[700] text-[#111827]">Depreciation Policies</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Global Config)</div>
            </Link>
            <Link href="/director-screen/assets/branch-assets" className="rounded-[10px] border border-[#EEF1F6] bg-white p-5 cursor-pointer hover:border-gray-300 shadow-sm transition-colors block">
              <div className="text-[13px] font-[700] text-[#111827]">Branch Assets</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Live Tracking)</div>
            </Link>
            <Link href="/director-screen/assets/sales-log" className="rounded-[10px] border border-[#EEF1F6] bg-white p-5 cursor-pointer hover:border-gray-300 shadow-sm transition-colors block">
              <div className="text-[13px] font-[700] text-[#111827]">Asset Sales Log</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Audit Trail)</div>
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-[18px] w-[18px] text-[#6B7280]" />
            <h3 className="text-[12px] font-[800] text-[#344054] tracking-wide">
              DEPRECIATION POLICIES <span className="text-[#6B7280] font-normal tracking-normal ml-1">(Director sets for all branches)</span>
            </h3>
          </div>

          <div className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm overflow-visible">
            <div className="overflow-visible">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#EEF1F6]">
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[25%]">Asset Category</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[35%]">Depreciation Method</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[20%]">Useful Life (yrs)</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[20%]">Residual Value %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4">
                        <SkeletonTable rows={5} columns={4} />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-rose-600">
                        {error}
                      </td>
                    </tr>
                  ) : !assetClasses || assetClasses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">
                        No asset categories configured yet.
                      </td>
                    </tr>
                  ) : (
                    assetClasses.map((row) => (
                      <tr key={row._id || row.name}>
                        <td className="px-6 py-4 font-medium text-[#111827]">{row.name}</td>
                        <td className="px-6 py-3">
                          <Dropdown 
                            value={row.defaultDepreciationMethod || "straight_line"} 
                            options={methodOptions} 
                            onChange={() => {}} 
                            isOpen={openDropdownId === (row._id || row.name)}
                            setIsOpen={(open) => setOpenDropdownId(open ? (row._id || row.name || null) : null)}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-[#4B5563]">{row.defaultUsefulLifeYears || "N/A"}</td>
                        <td className="px-6 py-4 font-medium text-[#4B5563]">
                          {(row.residualValuePercent ?? row.defaultResidualValuePercent ?? 0)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between p-4 px-6 border-t border-[#EEF1F6]">
              <button 
                onClick={() => router.push('/director-screen/assets?modal=new-asset-category')}
                className="flex items-center gap-2 text-[12px] font-medium text-[#4B5563] bg-gray-50 border border-[#E5E7EB] rounded-[6px] px-3.5 py-2 hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Asset Category
              </button>
              <button className="rounded-[6px] bg-[#3B5BDB] px-4 py-2 text-[12px] font-[600] text-white shadow hover:bg-blue-700 transition-colors">
                Save Policies
              </button>
            </div>
          </div>

        </div>
      </main>
      
      <Suspense fallback={null}>
        <ModalContainer />
      </Suspense>
    </div>
  )
}


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  )
}
