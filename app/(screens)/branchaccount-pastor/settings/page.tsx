"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, KeyRound, Loader2, Mail, MapPin, Phone, Shield, User as UserIcon } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ActiveSessionsManager } from "@/components/settings/ActiveSessionsManager"
import { useToast } from "@/components/ui/toast"
import { API_V1 } from "@/lib/api"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PasswordInput } from "@/components/ui/password-input"

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().max(80),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .refine((v) => !v || /^[+()\d\s-]{6,}$/.test(v), "Enter a valid phone number"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

function getInitials(name: string) {
  if (!name.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
}

export default function Page() {
  const { user, updateProfile, changePassword, loading: authLoading } = useAuth()
  const { pushToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError: setFormError,
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? user.phoneNumber ?? "",
      })
    }
  }, [user, reset])

  const fullName = useMemo(() => {
    const fn = user?.firstName ?? ""
    const ln = user?.lastName ?? ""
    return `${fn} ${ln}`.trim() || user?.email || "User"
  }, [user])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone?.trim() || undefined,
      })
      reset(values)
      pushToast("Profile updated", "success")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to update profile"
      setFormError("root", { message })
      pushToast(message, "error")
    }
  })

  const handleAvatarFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      pushToast("Image exceeds 5MB limit", "error")
      return
    }
    if (!file.type.startsWith("image/")) {
      pushToast("Only image files are allowed", "error")
      return
    }
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "avatars")
      const res = await fetch(`${API_V1}/file-uploads`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body?.message ?? "Upload failed")
      }
      const uploaded = body?.data ?? body
      const fileId: string | undefined = uploaded?.id ?? uploaded?._id ?? uploaded?.url
      if (!fileId) {
        throw new Error("Upload response missing file ID")
      }
      await updateProfile({ avatar: fileId })
      pushToast("Avatar updated", "success")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to upload avatar"
      pushToast(message, "error")
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header>
          <h1 className="text-xl font-bold text-[#111827]">Account Settings</h1>
          <p className="text-sm text-[#6B7280]">Manage your profile and security</p>
        </header>

        {/* Profile card */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                aria-label="Change profile photo"
              >
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(fullName)
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {avatarUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </span>
                {avatarUploading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="Upload profile photo"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleAvatarFile(file)
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-[#111827]">{fullName}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6B7280]">
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {user?.role ?? "—"}
                </span>
                {user?.tenant?.name && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.tenant.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Profile form */}
        <form onSubmit={onSubmit} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#111827]">Personal Information</h2>
          <p className="mb-5 text-sm text-[#6B7280]">Update your name and contact details</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Read-only: Employee ID */}
            <ReadOnlyField
              label="Employee ID"
              icon={<UserIcon className="h-4 w-4" />}
              value={user?.id ?? "—"}
            />
            {/* Read-only: Work Email */}
            <ReadOnlyField
              label="Work Email"
              icon={<Mail className="h-4 w-4" />}
              value={user?.email ?? "—"}
            />

            {/* Editable: First name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">First name</label>
              <input
                {...register("firstName")}
                className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="First name"
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-rose-600">{errors.firstName.message}</p>
              )}
            </div>

            {/* Editable: Last name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">Last name</label>
              <input
                {...register("lastName")}
                className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Last name"
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-rose-600">{errors.lastName.message}</p>
              )}
            </div>

            {/* Editable: Phone */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#374151]">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  {...register("phone")}
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#111827] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="+234 800 000 0000"
                  autoComplete="tel"
                  type="tel"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
            </div>
          </div>

          {errors.root?.message && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {errors.root.message}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <KeyRound className="h-4 w-4" />
              Change password
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setValue("firstName", user.firstName ?? "")
                    setValue("lastName", user.lastName ?? "")
                    setValue("phone", user.phone ?? user.phoneNumber ?? "")
                  }
                }}
                disabled={!isDirty || isSubmitting}
                className="inline-flex h-10 items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={!isDirty || isSubmitting || authLoading}
                className="inline-flex h-10 items-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Active sessions */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#111827]">Active Sessions</h2>
          <p className="mb-4 text-sm text-[#6B7280]">
            Devices currently signed into your account
          </p>
          <ActiveSessionsManager />
        </section>
      </div>

      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        changePassword={changePassword}
        pushToast={pushToast}
      />
    </main>
  )
}

function ChangePasswordDialog({
  open,
  onOpenChange,
  changePassword,
  pushToast,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  changePassword: (p: { currentPassword: string; newPassword: string }) => Promise<void>
  pushToast: (msg: string, type?: "success" | "error" | "info") => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (!open) reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      pushToast("Password changed", "success")
      onOpenChange(false)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to change password"
      setError("root", { message })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Current password</label>
            <PasswordInput
              {...register("currentPassword")}
              placeholder="Current password"
              autoComplete="current-password"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-rose-600">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">New password</label>
            <PasswordInput
              {...register("newPassword")}
              placeholder="New password"
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-rose-600">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Confirm new password</label>
            <PasswordInput
              {...register("confirmPassword")}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          {errors.root?.message && (
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {errors.root.message}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[#374151]">{label}</label>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
        <span className="text-[#9CA3AF]">{icon}</span>
        <span className="truncate">{value}</span>
      </div>
    </div>
  )
}
