"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import AuthHeader from "../auth/AuthHeader"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"

const signInSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
})

type SignInValues = z.infer<typeof signInSchema>

async function parseApiResponse(response: Response): Promise<Record<string, unknown> | null> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null)
  }

  const text = await response.text().catch(() => "")
  if (!text) return null
  return { message: text }
}

export default function SignInForm() {
  const router = useRouter()
  const { resendOtp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [emailCheckMessage, setEmailCheckMessage] = useState<string | null>(null)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [lastCheckedEmail, setLastCheckedEmail] = useState("")
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailValidationAvailable, setEmailValidationAvailable] = useState(true)
  const [showExistingAccountActions, setShowExistingAccountActions] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const checkEmailAvailability = async (rawEmail: string): Promise<boolean | null> => {
    if (!emailValidationAvailable) return null
    const email = rawEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null

    setCheckingEmail(true)
    try {
      const res = await fetch(`/api/v1/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: "GET",
        cache: "no-store",
      })
      const data = await parseApiResponse(res)
      if (!res.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Unable to validate email.")
      }

      if (data?.data?.validationSkipped) {
        setEmailValidationAvailable(false)
        setLastCheckedEmail("")
        setEmailExists(null)
        setEmailCheckMessage(null)
        return null
      }

      const exists = Boolean(data?.data?.exists)
      setLastCheckedEmail(email)
      setEmailExists(exists)
      setEmailCheckMessage(
        data?.message || (exists ? "Email is already registered." : "Email is available.")
      )
      return exists
    } catch {
      setEmailValidationAvailable(false)
      setLastCheckedEmail("")
      setEmailExists(null)
      setEmailCheckMessage(null)
      return null
    } finally {
      setCheckingEmail(false)
    }
  }

  const handleEmailBlur = async () => {
    await checkEmailAvailability(getValues("email"))
  }

  const getNormalizedEmail = () => getValues("email").trim().toLowerCase()

  const onSubmit = async (values: SignInValues) => {
    setError(null)
    setSuccessMessage(null)
    setResendMessage(null)
    setShowExistingAccountActions(false)
    const normalizedEmail = values.email.trim().toLowerCase()
    const knownExistingEmail = lastCheckedEmail === normalizedEmail ? emailExists === true : false
    if (knownExistingEmail) {
      setError("An account with this email already exists.")
      setShowExistingAccountActions(true)
      return
    }
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await parseApiResponse(res)

      if (!res.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Registration failed")
      }

      setSuccessMessage((data as { message?: string } | null)?.message || "Registration successful. Please verify your email.")
      router.push(`/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      const looksLikeExistingAccount =
        message.toLowerCase().includes("already exists") || message.toLowerCase().includes("already registered")
      setError(message)
      setShowExistingAccountActions(looksLikeExistingAccount)
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
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">Sign Up</h1>
              <p className="text-[14px] text-[#98A2B3]">Create your account to get started.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full text-left">

              {showExistingAccountActions ? (
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 text-left">
                      <h3 className="text-[13px] font-medium text-amber-800">Account already exists</h3>
                      <div className="mt-2 text-[12px] text-amber-700 space-y-2">
                        <p>This email is already registered, so no new OTP was sent for sign-up.</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>If your account is <strong>pending verification</strong>, click <button type="button" onClick={handleResendOtp} className="font-semibold underline hover:text-amber-900">Resend OTP</button>.</li>
                          <li>If your account is active, please <Link href="/login" className="font-semibold underline hover:text-amber-900">Log In</Link>.</li>
                          <li>If you forgot your password, <Link href="/forgot-password" className="font-semibold underline hover:text-amber-900">reset it here</Link>.</li>
                        </ul>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const email = getNormalizedEmail()
                            if (!email) {
                              setError("Please enter your email first.")
                              return
                            }
                            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
                          }}
                          className="flex items-center justify-center text-[13px] bg-[#3B5BDB] text-white px-4 py-2.5 rounded-[6px] font-medium hover:bg-[#2f4cc2] shadow-sm transition-all"
                        >
                          Verify Email
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="flex items-center justify-center text-[13px] bg-[#3B5BDB] text-white px-4 py-2.5 rounded-[6px] font-medium hover:bg-[#2f4cc2] shadow-sm transition-all"
                        >
                          Resend OTP
                        </button>
                        <Link
                          href="/login"
                          className="flex items-center justify-center text-[13px] bg-white text-[#3B5BDB] border border-[#3B5BDB] px-4 py-2.5 rounded-[6px] font-medium hover:bg-slate-50 transition-colors"
                        >
                          Log In Instead
                        </Link>
                      </div>

                      {resendMessage ? (
                        <div className="mt-3 p-2 bg-emerald-100 rounded-md border border-emerald-200">
                          <p className="text-[12px] text-emerald-800 font-semibold">{resendMessage}</p>
                        </div>
                      ) : null}

                      {error && error !== "An account with this email already exists." ? (
                        <div className="mt-3 p-2 bg-rose-100 rounded-md border border-rose-200">
                          <p className="text-[12px] text-rose-800 font-semibold">{error}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                error ? (
                  <p className="text-[12px] text-rose-600 text-center mb-4">{error}</p>
                ) : null
              )}

              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[13px] text-[#98A2B3] font-medium">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("firstName")}
                />
                {errors.firstName ? (
                  <p className="text-[11px] text-rose-600">{errors.firstName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[13px] text-[#98A2B3] font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("lastName")}
                />
                {errors.lastName ? (
                  <p className="text-[11px] text-rose-600">{errors.lastName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-[#98A2B3] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  {...register("email", {
                    onBlur: () => {
                      void handleEmailBlur()
                    },
                    onChange: () => {
                      if (emailCheckMessage || emailExists !== null || lastCheckedEmail) {
                        setEmailCheckMessage(null)
                        setEmailExists(null)
                        setLastCheckedEmail("")
                      }
                    },
                  })}
                />
                {errors.email ? (
                  <p className="text-[11px] text-rose-600">{errors.email.message}</p>
                ) : null}
                {!errors.email && emailCheckMessage ? (
                  <p className={`text-[11px] ${emailExists ? "text-rose-600" : "text-emerald-600"}`}>
                    {checkingEmail ? "Checking email..." : emailCheckMessage}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] text-[#98A2B3] font-medium">Password</Label>
                <PasswordInput
                  id="password"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-[11px] text-rose-600">{errors.password.message}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#BFC7FF] text-[#3B5BDB] focus:ring-[#5871F5]"
                    {...register("rememberMe")}
                  />
                  <span className="text-[13px] text-[#98A2B3]">Remember me?</span>
                </label>
                <Link href="/forgot-password" className="text-[13px] font-medium text-[#3B5BDB] hover:text-[#4F63FF] hover:underline">
                  Forgot password?
                </Link>
              </div>

              {successMessage ? (
                <div className="text-center space-y-2">
                  <p className="text-[12px] text-emerald-600">{successMessage}</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[12px] text-[#4F63FF] font-medium hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
              ) : null}


              <div className="pt-6 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[44px] px-12 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
                >
                  {isSubmitting ? "Signing up..." : "Sign up"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative w-full h-full p-4 lg:p-6 hidden md:block">
          <div className="relative w-full h-full rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-sm">
            <Image
              src="/images/login%20page%20picture.jpg"
              alt="Login abstract background"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
              fetchPriority="low"
              quality={75}
            />
            <div className="absolute inset-0 flex flex-col justify-between p-12">
              <div className="text-white">
                <h2 className="text-[48px] leading-[1.15] font-normal tracking-tight">
                  Welcome to<br />
                  <span className="font-bold">ShepherdWatch</span>
                </h2>
                <p className="text-[15px] text-white/90 mt-2 font-medium">Global Harvest Church</p>
              </div>

              <div className="text-white/90 pb-4 text-[15px] font-medium">
                All church workflow unified.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
