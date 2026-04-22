"use client"

import React, { useState } from "react"
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
  Building,
  Eye,
  Plus
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter } from "next/navigation"
import BranchesDropdown from "@/components/navigation/BranchesDropdown"

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

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }

  const assetRows = [
    { branch: "Maryland, LAG", name: "Toyota Hiace Bus", category: "Motor Vehicle", cost: "15,000,000", nbv: "9,000,000", status: "Active" },
    { branch: "Ibadan HQ", name: "HP Laptops (x10)", category: "IT Equipment", cost: "4,500,000", nbv: "1,200,000", status: "Active" },
    { branch: "Ado Ekiti", name: "Church Building", category: "Building", cost: "50,000,000", nbv: "48,000,000", status: "Active" },
    { branch: "Maryland, US", name: "Chairs (200pcs)", category: "Furniture", cost: "2,000,000", nbv: "1,200,000", status: "Active" },
    { branch: "Agodi, Ibadan", name: "Projector", category: "IT Equipment", cost: "500,000", nbv: "150,000", status: "Sold" },
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
          <span className="text-[10px] font-medium text-[#3B5BDB] ml-9 -mt-1">Super Admin</span>
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
                <span className="text-[13px] font-bold text-[#111827]">Rev. Thomas M.</span>
                <span className="text-[11px] font-medium text-[#6B7280]">Director</span>
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
            <Link href="/director-screen/assets" className="rounded-[10px] border border-[#EEF1F6] bg-white p-5 cursor-pointer hover:border-gray-300 shadow-sm transition-colors block">
              <div className="text-[13px] font-[700] text-[#111827]">Depreciation Policies</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Global Config)</div>
            </Link>
            <Link href="/director-screen/assets/branch-assets" className="rounded-[10px] border border-[#3B5BDB] bg-[#F0F4FF] p-5 cursor-pointer shadow-sm block">
              <div className="text-[13px] font-[700] text-[#111827]">Branch Assets</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Live Tracking)</div>
            </Link>
            <Link href="/director-screen/assets/sales-log" className="rounded-[10px] border border-[#EEF1F6] bg-white p-5 cursor-pointer hover:border-gray-300 shadow-sm transition-colors block">
              <div className="text-[13px] font-[700] text-[#111827]">Asset Sales Log</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Audit Trail)</div>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Building className="h-[18px] w-[18px] text-[#6B7280]" />
              <h3 className="text-[12px] font-[800] text-[#344054] tracking-wide">
                BRANCH ASSETS REGISTER
              </h3>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#6B7280]">Filter:</span>
                <button className="flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 focus:outline-none">
                  All Branches
                  <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#6B7280]">Status:</span>
                <button className="flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 focus:outline-none">
                  Active
                  <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm overflow-visible">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#EEF1F6]">
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[20%]">Branch</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[20%]">Asset Name</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%]">Category</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%] text-right">Cost (₦)</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%] text-right">NBV (₦)</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {assetRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 font-medium text-[#4B5563]">{row.branch}</td>
                      <td className="px-6 py-4 font-[700] text-[#111827]">{row.name}</td>
                      <td className="px-6 py-4 font-medium text-[#9CA3AF]">{row.category}</td>
                      <td className="px-6 py-4 font-[600] text-[#4B5563] text-right">{row.cost}</td>
                      <td className="px-6 py-4 font-[600] text-[#4B5563] text-right">{row.nbv}</td>
                      <td className="px-6 py-4">
                        {row.status === "Active" ? (
                          <span className="inline-flex items-center rounded-full bg-[#10B981] px-2.5 py-0.5 text-[11px] font-[600] text-white">
                            Active
                          </span>
                        ) : (
                          <button className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[11px] font-[600] text-[#6B7280] shadow-sm">
                            Sold
                            <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 border-t border-[#EEF1F6] gap-4">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-[12px] font-[600] text-[#4B5563] border border-[#E5E7EB] bg-white rounded-[6px] px-3.5 py-2 hover:bg-gray-50 transition-colors shadow-sm">
                  <Download className="h-3.5 w-3.5" />
                  Export Log
                </button>
                <button className="flex items-center gap-2 text-[12px] font-[600] text-[#4B5563] border border-[#E5E7EB] bg-white rounded-[6px] px-3.5 py-2 hover:bg-gray-50 transition-colors shadow-sm">
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-[12px] font-[600] text-[#4B5563] border border-[#E5E7EB] bg-white rounded-[6px] px-3.5 py-2 hover:bg-gray-50 transition-colors shadow-sm">
                  Record Asset Sale
                </button>
                <button className="flex items-center gap-2 rounded-[6px] bg-[#3B5BDB] px-4 py-2 text-[12px] font-[600] text-white shadow hover:bg-blue-700 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  Add Asset
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
