import { useState, useCallback } from "react"

export type UseExportOptions = {
  /** Backend endpoint path (absolute URL or path starting with /). */
  endpoint: string
  /** Default download filename if Content-Disposition is absent. */
  fallbackFilename: string
  /** Default error message if response is not ok and payload has no message. */
  defaultErrorMessage?: string
}

export type UseExportReturn = {
  exporting: boolean
  error: string | null
  /** Trigger the export. Pass query params as a plain object; values are URL-encoded. */
  exportData: (params?: Record<string, string | number | undefined | null>) => Promise<void>
  /** Manually clear the error state. */
  clearError: () => void
  /** Manually set the error state (e.g. for client-side preconditions). */
  setError: (message: string | null) => void
}

/**
 * Hook that encapsulates the "fetch blob from backend export endpoint + parse
 * Content-Disposition + trigger browser download" pattern shared by multiple
 * pages. Returns an `exporting` flag, an `error` string, and a callable
 * `exportData` that accepts optional query params.
 */
export function useExport({
  endpoint,
  fallbackFilename,
  defaultErrorMessage = "Unable to export data.",
}: UseExportOptions): UseExportReturn {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const exportData = useCallback(
    async (params: Record<string, string | number | undefined | null> = {}) => {
      setExporting(true)
      setError(null)

      try {
        const search = new URLSearchParams()
        for (const [key, value] of Object.entries(params)) {
          if (value === undefined || value === null || value === "") continue
          search.append(key, String(value))
        }
        const qs = search.toString()
        const url = qs ? `${endpoint}?${qs}` : endpoint

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          const payload = await response.json().catch(async () => ({
            message: await response.text().catch(() => ""),
          }))
          throw new Error(payload?.message ?? defaultErrorMessage)
        }

        const blob = await response.blob()
        const disposition = response.headers.get("Content-Disposition") ?? ""
        const filenameMatch =
          disposition.match(/filename\*=UTF-8''([^;]+)/i) ??
          disposition.match(/filename="?([^";]+)"?/i)
        const filename = filenameMatch
          ? decodeURIComponent(filenameMatch[1])
          : fallbackFilename

        const objectUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = objectUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(objectUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : defaultErrorMessage)
      } finally {
        setExporting(false)
      }
    },
    [endpoint, fallbackFilename, defaultErrorMessage]
  )

  return { exporting, error, exportData, clearError, setError }
}
