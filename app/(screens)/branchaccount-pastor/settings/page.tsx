"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { KeyRound, Mail, MapPin, Phone, Shield, User as UserIcon } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ActiveSessionsManager } from "@/components/settings/ActiveSessionsManager"

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

function getInitials(name: string) {
  if (!name.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
}

export default function Page() {
  const { user, updateProfile, loading: authLoading } = useAuth()

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
      // success — react-hook-form resets dirty state when we reset()
      reset(values)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to update profile"
      setFormError("root", { message })
    }
  })

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
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                getInitials(fullName)
              )}
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
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <KeyRound className="h-4 w-4" />
              Change password
            </Link>
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
    </main>
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
