"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

/**
 * Centralized hook for URL-driven modal state.
 *
 * Why: previously every page hand-rolled `searchParams.get('modal') === 'foo'`
 * plus an ad-hoc `router.replace('/explicit/path')` close handler. That is
 * fragile because (1) the close path drifts from the actual route, (2) other
 * query params (filters, pagination) are silently dropped, and (3) opening a
 * modal from anywhere requires knowing the literal path.
 *
 * This hook preserves the current pathname + other query params, and only
 * mutates the `modal` parameter.
 */
export function useModalParam(modalName: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("modal") === modalName

  const buildHref = useCallback(
    (nextModal: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextModal) {
        params.set("modal", nextModal)
      } else {
        params.delete("modal")
      }
      const query = params.toString()
      return query ? `${pathname}?${query}` : pathname
    },
    [pathname, searchParams],
  )

  const open = useCallback(() => {
    router.replace(buildHref(modalName))
  }, [router, buildHref, modalName])

  const close = useCallback(() => {
    router.replace(buildHref(null))
  }, [router, buildHref])

  return { isOpen, open, close }
}
