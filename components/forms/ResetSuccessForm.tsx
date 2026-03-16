"use client"

import AuthHeader from "../auth/AuthHeader"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ResetSuccess() {
  const router = useRouter()

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

        {/* Content Container (Left Pane) */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 md:p-8 min-h-[100dvh] md:min-h-0">
          <div className="flex w-full max-w-[436px] flex-col gap-6 md:gap-8 items-center text-center">
            <div>
              <AuthHeader />
            </div>

            <div className="flex flex-col items-center justify-center gap-6 mt-2">
              <div className="h-[64px] w-[64px] rounded-full flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M41 18.0003V24.0003C40.9982 27.669 39.8166 31.2405 37.6406 34.1611C35.4646 37.0816 32.4143 39.1865 28.9669 40.1436C25.5195 41.1006 21.8703 40.8525 18.5959 39.4447C15.3216 38.037 12.6071 35.5478 10.8872 32.3707C9.16738 29.1936 8.53673 25.5101 9.09117 21.9026C9.64561 18.2952 11.3533 14.966 13.9472 12.4338C16.5412 9.90159 19.8732 8.30796 23.4157 7.89321C26.9582 7.47846 30.5065 8.26477 33.4883 10.1342" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 23.9996L24 31.9996L44 11.9996" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="text-center w-full">
                <h1 className="text-[28px] md:text-[36px] font-bold text-[#1D4ED8] mb-3 md:mb-4">Success !</h1>
                <p className="text-[13px] md:text-[14px] text-[#475467] max-w-[340px] mx-auto leading-relaxed">
                  A email has been send to your email@domain.com.
                  Please check for an email from system and click on the
                  included link to reset your password.
                </p>
              </div>

              <div className="pt-4 flex justify-center w-full">
                <Button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="h-[44px] px-16 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
                >
                  Back to home
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image Container (Right Pane) */}
        <div className="relative w-full h-full p-4 lg:p-6 hidden md:block">
          <div className="relative w-full h-full rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-sm">
            <Image
              src="/images/login%20page%20picture.jpg"
              alt="Reset success background"
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
