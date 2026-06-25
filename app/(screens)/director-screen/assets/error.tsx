"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

/**
 * Segment-level error boundary for the Asset area. Prevents the generic
 * app-wide "An unexpected error occurred" screen from taking over when an
 * asset data fetch or render hiccups — shows a contextual, recoverable state
 * instead.
 */
export default function AssetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[assets] segment error:", error)
    }
  }, [error])

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#F8FAFC] px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3B5BDB]">
          <RefreshCw className="h-5 w-5" />
        </div>
        <h1 className="text-[18px] font-bold text-[#111827]">
          We couldn&apos;t load the asset data
        </h1>
        <p className="text-[13px] text-[#6B7280]">
          This is usually a temporary network issue with the asset service. Please
          try again in a moment.
        </p>
        <div className="flex gap-3 pt-1">
          <Button onClick={reset} className="bg-[#3B5BDB] hover:bg-[#2C46B4]">
            Try again
          </Button>
          <Button variant="outline" onClick={() => router.push("/director-screen/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
