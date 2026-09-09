"use client"

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react"

export type HrQueryResult<T> = {
  data: T
  loading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Fetch primitive shared by every HR hook. Pass `null` as the fetcher to skip
 * (e.g. while a required id is still empty) — the previous data is kept and
 * `loading` drops to false rather than spinning forever.
 *
 * `deps` drives re-fetching; the fetcher itself is read from a ref so callers
 * can pass an inline closure without memoizing it.
 */
export function useHrQuery<T>(
  fetcher: (() => Promise<T>) | null,
  deps: DependencyList,
  fallback: T
): HrQueryResult<T> {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState<boolean>(Boolean(fetcher))
  const [error, setError] = useState<string | null>(null)
  const [reloadIndex, setReloadIndex] = useState(0)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refresh = useCallback(() => setReloadIndex((index) => index + 1), [])

  useEffect(() => {
    const run = fetcherRef.current
    if (!run) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    run()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Unable to load HR data.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadIndex])

  return { data, loading, error, refresh }
}
