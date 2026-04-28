"use client"

import React, { useState, useRef, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Coins,
  Scale,
  Wallet,
  Building2,
  Users,
  Settings,
  Calendar,
  Download,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Settings2,
  Plus,
  Check
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter, useSearchParams } from "next/navigation"
import BranchesDropdown from "@/components/navigation/BranchesDropdown"
import { useAssetClasses } from "@/components/hooks/useAssetClasses"
import NewAssetCategoryModal from "@/components/modals/NewAssetCategoryModal"

const navItems = [
  { label: "Dashboard", href: "/director-screen/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/director-screen/transaction", icon: ArrowLeftRight },
  { label: "Budgeting", href: "/director-screen/budgeting", icon: Coins },
  { label: "Compliance", href: "/director-screen/compliance", icon: Scale },
  { label: "Asset", href: "/director-screen/assets", icon: Wallet },
  { label: "Branch Management", href: "/director-screen/branch-management", icon: Building2 },
  { label: "Users", href: "/director-screen/users", icon: Users },
  { label: "Settings", href: "/director-screen/settings", icon: Settings },
]

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
        <div className="absolute left-0 top-[calc(100%+4px)] z-10 w-[200px] rounded-[8px] border border-[#EEF1F6] bg-white py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const isModalOpen = searchParams.get('modal') === 'new-asset-category'

  return (
    <NewAssetCategoryModal 
      isOpen={isModalOpen} 
      onClose={() => router.replace('/director-screen/assets')} 
    />
  )
}

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  
  const { assetClasses, isLoading: loading, error } = useAssetClasses()

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }

  const methodOptions = [
    "Straight Line",
    "Reducing Balance",
    "Sum of Years' Digits",
    "Units of Production"
  ]


  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#EEF1F6] bg-[#FAFBFF] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:flex`}>
        <div className="flex flex-col gap-1 px-6 pt-6 lg:pt-8 pb-4 relative">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={160} height={36} className="object-contain" />
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-6 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 p-1 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-[10px] font-medium text-[#3B5BDB] ml-9 -mt-1 uppercase">
            {user?.role ? String(user.role).replace(/_/g, ' ') : "Director"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 mt-2">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/director-screen/assets"
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#3B5BDB] text-white shadow-sm"
                      : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#EEF1F6] p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0">
                <Image
                  src="/images/Beared%20Guy02-min%201.jpg"
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111827]">
                  {user?.name && !['director user', 'super admin', 'admin user'].includes(user.name.toLowerCase()) ? user.name : user?.email || "Super Admin"}
                </span>
                <span className="text-[11px] font-medium text-[#6B7280] capitalize">
                  {user?.role ? String(user.role).replace(/_/g, ' ').toLowerCase() : "Director"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-[8px] py-2.5 px-3 -mx-3 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-[calc(100%+24px)] text-left"
            >
              <LogOut className="h-4.5 w-4.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 text-[#111827]">
        
        {/* Mobile Header Top Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#EEF1F6] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={130} height={28} className="object-contain" />
          </div>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200">
             <Image src="/images/Beared%20Guy02-min%201.jpg" alt="User" width={32} height={32} className="h-full w-full object-cover" />
          </div>
        </header>

        <div className="mx-auto w-full px-4 sm:px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-[1200px] overflow-hidden">
          
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <BranchesDropdown label="All Branches" className="text-[12px]" />
              
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 flex-1 sm:flex-none justify-center sm:justify-start">
                <Calendar className="h-4 w-4 text-[#6B7280]" />
                This Month
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>

              <div className="flex items-center rounded-md border border-[#E5E7EB] bg-white p-0.5 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
                <button className="rounded px-3 py-1.5 text-[11px] font-bold bg-[#3B5BDB] text-white">NGN</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">USD</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">EUR</button>
              </div>

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
            <div className="overflow-x-auto overflow-y-visible">
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
                      <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">
                        Loading asset policies...
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
                            value={row.defaultDepreciationMethod || row.depreciationMethod || "straight_line"} 
                            options={methodOptions} 
                            onChange={() => {}} 
                            isOpen={openDropdownId === (row._id || row.name)}
                            setIsOpen={(open) => setOpenDropdownId(open ? (row._id || row.name || null) : null)}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-[#4B5563]">{row.defaultUsefulLifeYears || row.usefulLifeYears || "N/A"}</td>
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
