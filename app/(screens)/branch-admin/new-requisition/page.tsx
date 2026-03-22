"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import {
  LayoutDashboard,
  List,
  Wrench,
  Database,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ArrowLeft,
  ChevronDown,
  FileText,
  Paperclip,
  CloudUpload,
  Send,
} from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export default function NewRequisitionPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className={`flex flex-col xl:flex-row min-h-[100dvh] bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed xl:sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"}`}>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        
        <div className="py-6 flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* Logo Container */}
          <div className="flex items-center gap-3 pb-8 px-6">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="text-[17px] font-[800] text-[#2563EB] leading-tight tracking-tight">ShepherdWatch</div>
              <div className="text-[11.5px] text-[#6B7280] font-medium tracking-wide">Admin&apos;s View</div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1.5 mt-2 px-3">
            {[
              { label: "Dashboard", href: "#", icon: LayoutDashboard },
              { label: "Requisitions", href: "#", icon: List, active: true },
              { label: "Logistics & Repairs", href: "#", icon: Wrench },
              { label: "Assets", href: "#", icon: Database },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-4 py-3 text-[14px] font-[700] cursor-pointer transition-colors ${item.active ? "bg-[#EEF2FF] text-[#2563EB]" : "text-[#4B5563] hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-5 w-5 stroke-[2] ${item.active ? "text-[#2563EB]" : "text-[#6B7280]"}`} />
                    {item.label}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* System Section */}
          <div className="px-3 mt-4">
            <div className="text-[11px] font-[800] text-[#9CA3AF] tracking-widest uppercase mb-3 px-4">System</div>
            <div className="space-y-1">
              <div className="flex items-center gap-3.5 rounded-[8px] px-4 py-3 cursor-pointer text-[14px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 stroke-[2] text-[#6B7280]" />
                Settings
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto px-3 mb-2">
            <div className="pt-6 border-t border-[#EEF1F6] flex items-center gap-3.5 px-4 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-200 flex items-center justify-center">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-[800] text-[#111827] leading-tight mb-0.5">Alex Morgan</div>
                <div className="text-[12px] font-medium text-[#9CA3AF] leading-tight">Branch Officer</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
        {/* Top Header */}
        <header className="h-[64px] sm:h-[73px] bg-white border-b border-[#EEF1F6] flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#4B5563]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[18px] font-[900] text-[#111827] tracking-tight hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-end">
            <div className="relative w-full max-w-[180px] sm:max-w-[240px] md:max-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2.5} />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#6B7280] relative">
              <Bell className="h-5 w-5" strokeWidth={2} />
              <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></div>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 pt-4 sm:pt-8 pb-8 sm:pb-12 overflow-y-auto w-full">
          <div className="mx-auto w-full max-w-[1200px] flex flex-col">

            {/* Back Button */}
            <div className="mb-1 sm:mb-3">
              <button className="flex items-center gap-1.5 text-[14px] sm:text-[15px] font-[700] text-[#4B5563] hover:text-[#111827] transition-colors">
                <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.5} />
                Back
              </button>
            </div>

            {/* Hero Section */}
            <div className="mb-5 md:mb-8">
              <h1 
                className="text-[#111827] mb-2"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  fontSize: "22.8px",
                  lineHeight: "28.5px",
                  letterSpacing: "-0.57px",
                  verticalAlign: "middle"
                }}
              >
                Create Requisition
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#6B7280] font-[500] leading-relaxed">
                Fill in the details below to request funds for office expenses.
              </p>
            </div>

            {/* Cards Grid */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 lg:gap-8 items-start">
              
              {/* Left Column (Requisition Details) */}
              <div className="w-full sm:flex-[6] min-w-0">
                <div className="bg-white rounded-[12px] md:rounded-[16px] border border-[#EEF1F6] shadow-sm p-4 sm:p-5 md:p-8 flex flex-col w-full h-full">
                  <div className="flex items-center gap-2 mb-6 md:mb-8">
                    <FileText className="h-5 w-5 text-[#2563EB]" strokeWidth={2} />
                    <h2 className="text-[16px] md:text-[18px] font-[900] text-[#111827]">Requisition Details</h2>
                  </div>

                  <div className="flex flex-col gap-5 md:gap-7">
                    {/* Expense Title */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-[700] text-[#4B5563]">
                        Expense Title <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g., Q3 Office Supplies Restock" 
                        className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-[14px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm"
                      />
                    </div>

                    {/* Category and Amount Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-[700] text-[#4B5563]">
                          Budget Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            defaultValue=""
                            className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 pr-10 text-[14px] font-[500] text-[#111827] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                          >
                            <option value="" disabled hidden>Select a category</option>
                            <option value="1">Office Supplies</option>
                            <option value="2">Maintenance</option>
                            <option value="3">Logistics</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-[700] text-[#4B5563]">
                          Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 shadow-sm focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20 transition-all">
                          <span className="text-[15px] font-[700] text-[#9CA3AF] mr-1.5">₦</span>
                          <input 
                            type="text" 
                            placeholder="0.00" 
                            className="h-full w-full bg-transparent text-[14px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                          />
                          <span className="text-[12px] font-[800] text-[#9CA3AF] ml-2 shrink-0 tracking-wide">NGN</span>
                        </div>
                      </div>
                    </div>

                    {/* Justification */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-[700] text-[#4B5563] mb-0.5">
                        Justification <span className="text-red-500">*</span>
                        <div className="text-[11.5px] font-[500] text-[#9CA3AF] mt-1 normal-case font-normal">
                          Please provide a detailed reason for this expenditure for audit purposes.
                        </div>
                      </label>
                      <textarea 
                        className="w-full min-h-[120px] sm:min-h-[140px] rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-[14px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm resize-y"
                        placeholder="Explain why this expense is necessary..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Buttons mapped below Left Card */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button className="h-[42px] sm:h-[46px] px-5 sm:px-6 md:px-8 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-[800] text-white transition-colors shadow-sm w-full sm:w-auto shrink-0">
                    Submit Requisition
                    <Send className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                  <button className="h-[42px] sm:h-[46px] px-5 sm:px-6 md:px-8 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center text-[13px] sm:text-[14px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto shrink-0">
                    Save as Draft
                  </button>
                </div>
              </div>

              {/* Right Column (Attachments) */}
              <div className="w-full sm:flex-[4] min-w-0">
                <div className="bg-white rounded-[12px] md:rounded-[16px] border border-[#EEF1F6] shadow-sm p-4 sm:p-5 md:p-8 flex flex-col w-full h-full">
                  <div className="flex items-center gap-2 mb-6">
                    <Paperclip className="h-5 w-5 text-[#2563EB]" strokeWidth={2} />
                    <h2 className="text-[16px] md:text-[18px] font-[900] text-[#111827]">Attachments</h2>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="w-full rounded-[12px] border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors flex flex-col items-center justify-center p-5 sm:p-8 md:p-10 mb-4 cursor-pointer">
                    <CloudUpload className="h-10 w-10 text-[#9CA3AF] mb-3" strokeWidth={1.5} />
                    <div className="text-[14px] font-[600] text-[#4B5563] text-center mb-1">
                      <span className="text-[#2563EB] hover:underline cursor-pointer">Upload a file</span> or drag and drop
                    </div>
                    <div className="text-[12px] font-[500] text-[#9CA3AF] text-center">
                      PNG, JPG, PDF up to 10MB
                    </div>
                  </div>

                  {/* Uploaded File List */}
                  <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3 p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#EEF1F6]">
                      <div className="h-10 w-10 shrink-0 bg-[#FEE2E2] rounded-[6px] flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-[800] text-[#111827] truncate">quote_supplier_ABC.pdf</div>
                        <div className="text-[11.5px] font-[500] text-[#9CA3AF] mt-0.5">1.2 MB</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
