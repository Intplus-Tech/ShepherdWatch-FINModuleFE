"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import UserDirectoryMenuPage from "@/app/(screens)/director-screen/user-directory-menu/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  ChevronDown,
  Mail,
  UserRound,
  X,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useInviteUser, useBranches } from "@/components/hooks/useUsers"

const labelText = "text-[9.33px] leading-[13.33px] font-medium"
const inputText = "text-[12px] leading-[16px]"

const inviteRoleOptions = [
  { value: "super_admin", label: "Super Admin" },
  { value: "director", label: "Director" },
  { value: "regional_pastor", label: "Regional Pastor" },
  { value: "branch_pastor", label: "Branch Pastor" },
  { value: "accountant", label: "Accountant" },
  { value: "admin", label: "Admin" },
  { value: "hr", label: "HR" },
  { value: "employee", label: "Employee" },
] as const

type BranchOption = {
  id: string
  name: string
}

function normalizeBranchOption(branch: unknown, index: number): BranchOption | null {
  if (!branch || typeof branch !== "object") return null
  const source = branch as Record<string, unknown>
  const id = String(source._id ?? source.id ?? source.branchId ?? "").trim()
  if (!id) return null

  const name = String(source.branchName ?? source.name ?? `Branch ${index + 1}`).trim()
  return {
    id,
    name: name || `Branch ${index + 1}`,
  }
}

export default function Page() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [branchId, setBranchId] = useState("")
  const [phone, setPhone] = useState("")
  


  const { mutateAsync: inviteUser, isPending: loading } = useInviteUser()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const { user } = useAuth()
  const { data: branchesPayload, isLoading: branchesLoading } = useBranches()
  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? null,
    [user]
  )
  const branchOptions = useMemo(
    () =>
      (Array.isArray(branchesPayload) ? branchesPayload : [])
        .map((branch, index) => normalizeBranchOption(branch, index))
        .filter((branch): branch is BranchOption => Boolean(branch)),
    [branchesPayload]
  )


  const handleClose = () => {
    router.back()
  }

  const handleInvite = async () => {
    setError(null)
    setSuccess(false)

    if (!fullName || !email || !role || !branchId) {
      setError("Please fill out all required fields: name, email, role, branch.")
      return
    }

    const parts = fullName.trim().split(" ")
    const firstName = parts[0] || "Unknown"
    const lastName = parts.slice(1).join(" ") || "User"

    try {
      await inviteUser({
        firstName,
        lastName,
        email,
        role,
        branchId,
        ...(phone && { phone })
      })
      
      setSuccess(true)
      setTimeout(() => {
        router.push("/director-screen/users")
      }, 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to send invite.")
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] font-sans">
      <div className="pointer-events-none select-none">
        <div className="scale-[1.08] origin-top-left blur-xs brightness-[0.95] opacity-65">
          <UserDirectoryMenuPage />
        </div>
      </div>

      <div className="absolute inset-0 flex items-start justify-end px-6 py-6 md:px-10">
        <div className="w-full max-w-[320px] rounded-[12px] border border-[#E5E7EB] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
            <div className="text-[12px] leading-[18.67px] font-bold text-[#111827]">Invite New User</div>
            <button onClick={handleClose} className="text-[#9CA3AF]" aria-label="Close invite form">
              <X className="h-4 w-4" />
            </button>
          </div>

            <div className="space-y-4 px-4 py-4 max-h-[80vh] overflow-auto">
            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  className={`${inputText} h-9 rounded-md border-[#E5E7EB] bg-white pl-9 text-[#111827]`}
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  className={`${inputText} h-9 rounded-md border-[#E5E7EB] bg-white pl-9 text-[#111827]`}
                  placeholder="e.g. john@shepherdwatch.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Phone Number (Optional)</label>
              <div className="relative">
                <Input
                  className={`${inputText} h-9 rounded-md border-[#E5E7EB] bg-white px-3 text-[#111827]`}
                  placeholder="e.g. +2348012345678"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Primary Role <span className="text-red-500">*</span></label>
              <div className="relative">
                <select 
                  aria-label="Primary role"
                  className={`flex h-9 w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3 text-[10.67px] leading-4 text-[#111827] appearance-none`}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="" disabled className="text-[#9CA3AF]">Select a role...</option>
                  {inviteRoleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Branch Assignment <span className="text-red-500">*</span></label>
              <div className="relative">
                <select 
                  aria-label="Branch assignment"
                  className={`flex h-9 w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3 text-[10.67px] leading-4 text-[#111827] appearance-none`}
                  value={branchId}
                  onChange={e => setBranchId(e.target.value)}
                  disabled={branchesLoading}
                >
                  <option value="" disabled className="text-[#9CA3AF]">
                    {branchesLoading ? "Loading branches..." : "Select a branch..."}
                  </option>
                  {!branchesLoading && branchOptions.length === 0 && (
                    <option value="" disabled>No branches found</option>
                  )}
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>
              <div className="text-[10px] text-[#9CA3AF]">User will access data only from assigned branches.</div>
            </div>
            
            {error && <div className="text-[10px] text-rose-600 font-semibold">{error}</div>}
            {success && <div className="text-[10px] text-emerald-600 font-semibold">User created successfully!</div>}
          </div>

          <div className="border-t border-[#EEF1F6] px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.63px] leading-[14.17px] text-[#6B7280]">Send invitation Email immediately</span>
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} className="data-[state=checked]:bg-[#3B5BDB]" />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button onClick={handleClose} variant="outline" className="h-8 rounded-md border-[#E5E7EB] bg-white text-[11px] text-[#6B7280]">
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={loading} className="h-8 rounded-md bg-[#3B5BDB] text-[11px] text-white shadow hover:bg-blue-700 disabled:opacity-70">
                {loading ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


