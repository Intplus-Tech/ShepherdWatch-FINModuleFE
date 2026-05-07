"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AuthHeader from "../auth/AuthHeader"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"
import { getDashboardPathForUser } from "@/lib/auth-redirect"

type LoginFormProps = {
  initialEmail?: string
}

export default function LoginForm({ initialEmail = "" }: LoginFormProps) {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const normalizedEmail = email.trim()
    const normalizedPassword = password
    let hasError = false

    if (!normalizedEmail) {
      setEmailError("Email is required")
      hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Enter a valid email")
      hasError = true
    } else {
      setEmailError(null)
    }

    if (!normalizedPassword) {
      setPasswordError("Password is required")
      hasError = true
    } else {
      setPasswordError(null)
    }

    return { hasError, normalizedEmail, normalizedPassword }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const { hasError, normalizedEmail, normalizedPassword } = validate()
    if (hasError) return

    setIsSubmitting(true)
    try {
      const authUser = await login({
        email: normalizedEmail,
        password: normalizedPassword,
      })
      const nextPath = getDashboardPathForUser({ role: authUser?.role, email: normalizedEmail })
      router.replace(nextPath)
    } catch (err) {
      const code = (err as { code?: string } | null | undefined)?.code
      if (code === "email_not_verified") {
        // Invited / unverified users: bounce them to the OTP verification screen
        // with the email pre-filled so they can verify and continue.
        router.replace(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`)
        return
      }
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailErrorId = "login-email-error"
  const passwordErrorId = "login-password-error"
  const formErrorId = "login-form-error"

  return (
    <div className="w-full min-h-[100dvh] bg-white">
      <div className="relative grid min-h-[100dvh] grid-cols-1 md:grid-cols-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -top-8 z-0 hidden h-[25rem] w-[25rem] overflow-hidden opacity-[0.08] md:block md:h-[42rem] md:w-[42rem]"
        >
          <Image
            src="/images/icon-shepherdwatch.svg"
            alt="Background decoration"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain object-top -translate-x-10 -translate-y-10 md:-translate-x-20 md:-translate-y-20 scale-[1.35] rotate-[-15deg]"
          />
        </div>

        <div className="relative z-10 flex min-h-[100dvh] w-full items-center justify-center p-6 md:min-h-0 md:p-8">
          <div className="flex w-full max-w-[28rem] flex-col items-center gap-6 text-center md:gap-8">
            <div>
              <AuthHeader />
            </div>

            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_18px_rgba(59,91,219,0.18)] md:h-18 md:w-18">
              <Image
                src="/images/Beared%20Guy02-min%201.jpg"
                alt="User avatar"
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">Welcome Back</h1>
              <p className="text-[14px] text-[#98A2B3]">
                Sign in with your email and password
              </p>
            </div>

            <form onSubmit={onSubmit} className="w-full space-y-6 text-left" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-[#98A2B3] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="h-11 rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (emailError) setEmailError(null)
                    if (error) setError(null)
                  }}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? emailErrorId : undefined}
                />
                {emailError ? (
                  <p id={emailErrorId} className="text-[11px] text-rose-600">{emailError}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] text-[#98A2B3] font-medium">Password</Label>
                <PasswordInput
                  id="password"
                  className="h-11 rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (passwordError) setPasswordError(null)
                    if (error) setError(null)
                  }}
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={passwordError ? passwordErrorId : undefined}
                />
                {!passwordError ? (
                  <p className="text-[11px] text-[#98A2B3]">
                    Tip: Passwords are case-sensitive.
                  </p>
                ) : null}
                {passwordError ? (
                  <p id={passwordErrorId} className="text-[11px] text-rose-600">{passwordError}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-end pt-1">
                <Link href="/forgot-password" className="text-[13px] text-[#4F63FF] font-medium hover:underline">
                  Forgot Password
                </Link>
              </div>

              {error ? (
                <p id={formErrorId} role="alert" className="text-[12px] text-rose-600 text-center">
                  {error}
                </p>
              ) : null}

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  aria-describedby={error ? formErrorId : undefined}
                  className="h-11 px-16 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative hidden h-full w-full p-4 [content-visibility:auto] md:block lg:p-6">
          <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-sm">
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
          </div>
        </div>

      </div>
    </div>
  )
}


