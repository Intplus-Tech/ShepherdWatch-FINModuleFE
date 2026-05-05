"use client"

import { API_V1 } from "@/lib/api";

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import AuthHeader from "../auth/AuthHeader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"

const verifySchema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z.string().min(6, "Enter the 6-digit OTP").max(6, "Enter the 6-digit OTP"),
})

type VerifyValues = z.infer<typeof verifySchema>

export default function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email")?.trim().toLowerCase() ?? ""
  const { resendOtp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: emailFromQuery,
      code: "",
    },
  })

  const onSubmit = async (values: VerifyValues) => {
    setError(null)
    setSuccessMessage(null)
    setResendMessage(null)
    try {
      const res = await fetch(`${API_V1}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Verification failed")
      }

      setSuccessMessage(data?.message || "Email verified successfully.")
      
      const emailPath = values.email.toLowerCase()
      if (emailPath.includes("director") || emailPath === "super_admin@mailinator.com") {
        router.replace("/director-screen/dashboard")
      } else if (emailPath.includes("branch_pastor") || emailPath.includes("regional_pastor")) {
        router.replace("/branchlead-pastor/dashboard")
      } else if (emailPath.includes("accountant")) {
        router.replace("/branchaccount-pastor/dashboard")
      } else if (emailPath.includes("admin") || emailPath.includes("hr") || emailPath.includes("employee")) {
        router.replace("/branch-admin/dashboard")
      } else {
        router.replace(`/login?email=${encodeURIComponent(values.email.trim().toLowerCase())}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setResendMessage(null)
    const email = getValues("email")
    if (!email) {
      setError("Please enter your email to resend OTP.")
      return
    }
    try {
      await resendOtp({ email, purpose: "email_verification" })
      setResendMessage("OTP resent to your email.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP.")
    }
  }

  return (
    <div className="w-full h-screen bg-white overflow-y-auto md:overflow-hidden">
      <div className="relative w-full min-h-full grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="absolute top-[-30px] left-[-40px] w-[400px] h-[400px] md:w-[680px] md:h-[680px] overflow-hidden pointer-events-none opacity-[0.08] z-0">
          <Image
            src="/images/icon-shepherdwatch.svg"
            alt="Background decoration"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain object-top -translate-x-10 -translate-y-10 md:-translate-x-20 md:-translate-y-20 scale-[1.35] rotate-[-15deg]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 md:p-8 min-h-[100dvh] md:min-h-0">
          <div className="flex w-full max-w-[436px] flex-col gap-6 md:gap-8 items-center text-center">
            <div>
              <AuthHeader />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">Verify Email</h1>
              <p className="text-[14px] text-[#98A2B3]">
                Enter the 6-digit OTP sent to your email.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full text-left">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-[#98A2B3] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-[11px] text-rose-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-[13px] text-[#98A2B3] font-medium">OTP Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("code")}
                />
                {errors.code ? (
                  <p className="text-[11px] text-rose-600">{errors.code.message}</p>
                ) : null}
              </div>

              {successMessage ? (
                <p className="text-[12px] text-emerald-600 text-center">{successMessage}</p>
              ) : null}
              {resendMessage ? (
                <p className="text-[12px] text-emerald-600 text-center">{resendMessage}</p>
              ) : null}
              {error ? <p className="text-[12px] text-rose-600 text-center">{error}</p> : null}

              <div className="pt-6 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[44px] px-12 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
                >
                  {isSubmitting ? "Verifying..." : "Verify Email"}
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[12px] text-[#4F63FF] font-medium hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative w-full h-full p-4 lg:p-6 hidden md:block">
          <div className="relative w-full h-full rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-sm">
            <Image
              src="/images/login%20page%20picture.jpg"
              alt="Verification background"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex flex-col justify-between p-12">
              <div className="text-white">
                <h2 className="text-[48px] leading-[1.15] font-normal tracking-tight">
                  Secure your<br />
                  <span className="font-bold">ShepherdWatch</span>
                </h2>
                <p className="text-[15px] text-white/90 mt-2 font-medium">Global Harvest Church</p>
              </div>

              <div className="text-white/90 pb-4 text-[15px] font-medium">
                Verify once, access everywhere.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


