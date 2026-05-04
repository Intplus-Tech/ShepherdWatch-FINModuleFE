import React, { Suspense } from "react"
import VerifyEmailForm from "@/components/forms/VerifyEmailForm"

export const dynamic = "force-dynamic"

function page() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-0">
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  )
}

export default page
