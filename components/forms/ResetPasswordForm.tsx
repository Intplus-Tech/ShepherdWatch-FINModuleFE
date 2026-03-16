"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import AuthHeader from "../auth/AuthHeader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"

const resetSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

type ResetValues = z.infer<typeof resetSchema>

export default function ResetPasswordForm() {
  const router = useRouter()
  const { forgotPassword } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (values: ResetValues) => {
    setError(null)
    try {
      await forgotPassword(values.email)
      router.push("/reset-success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email")
    }
  }

  return (
    <div className="w-full h-screen bg-white overflow-y-auto md:overflow-hidden">
      <div className="relative w-full min-h-full grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* Background Watermark exactly matching User's preferred restored placement */}
        <div className="absolute top-[-30px] left-[-40px] w-[400px] h-[400px] md:w-[680px] md:h-[680px] overflow-hidden pointer-events-none opacity-[0.08] z-0">
          <Image
            src="/images/icon-shepherdwatch.svg"
            alt="Background decoration"
            fill
            className="object-contain object-top -translate-x-10 -translate-y-10 md:-translate-x-20 md:-translate-y-20 scale-[1.35] rotate-[-15deg]"
          />
        </div>

        {/* Form Container (Left Pane) */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 md:p-8 min-h-[100dvh] md:min-h-0">
          <div className="flex w-full max-w-[436px] flex-col gap-6 md:gap-8 items-center text-center">
            <div>
              <AuthHeader />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">Reset Password</h1>
              <p className="text-[14px] text-[#98A2B3]">
                Enter your email address and we&apos;ll send you an email with
                instructions to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full text-left">
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

              {error ? <p className="text-[12px] text-rose-600 text-center">{error}</p> : null}

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[44px] px-16 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
                >
                  {isSubmitting ? "Sending..." : "Reset"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Hero Image Container (Right Pane) */}
        <div className="relative w-full h-full p-4 lg:p-6 hidden md:block">
          <div className="relative w-full h-full rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-sm">
            <Image
              src="/images/login%20page%20picture.jpg"
              alt="Reset abstract background"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  )
}
