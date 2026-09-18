"use client"

import React, { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BudgetReviewContent } from "../budget-review/page"
import BudgetLineThread from "@/components/budgets/BudgetLineThread"

/**
 * The pastor's review with one line's thread open beside it. The line comes
 * from the query string: `budgetId`, `lineItemRef` (its account head) and
 * `lineName` for the heading.
 */
function BudgetCommunicationInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const budgetId = searchParams.get("budgetId") ?? ""
  const lineItemRef = searchParams.get("lineItemRef") ?? ""
  const lineName = searchParams.get("lineName") ?? ""

  const rightSidebar = (
    <BudgetLineThread
      budgetId={budgetId}
      lineItemRef={lineItemRef}
      lineName={lineName}
      onClose={() => router.push("/branchlead-pastor/budget-review")}
    />
  )

  return <BudgetReviewContent rightSidebar={rightSidebar} />
}

export default function BudgetCommunicationPage() {
  return (
    <Suspense fallback={null}>
      <BudgetCommunicationInner />
    </Suspense>
  )
}
