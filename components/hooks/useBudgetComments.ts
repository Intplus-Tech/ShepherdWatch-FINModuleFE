import { useCallback, useEffect, useState } from "react"

export type BudgetComment = {
  id: string
  budgetId: string
  userId?: string
  userName: string
  message: string
  createdAt: string
  lineItemRefName?: string
  lineItemRefCode?: string
}

export type BudgetCommentsPagination = {
  total: number
  page: number
  limit: number
  pages: number
}

export function useBudgetComments(budgetId: string, page = 1, limit = 20) {
  const [comments, setComments] = useState<BudgetComment[]>([])
  const [pagination, setPagination] = useState<BudgetCommentsPagination | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    if (!budgetId) {
      setComments([])
      setPagination(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/core/financial/budgets/${encodeURIComponent(budgetId)}/comments?page=${page}&limit=${limit}`,
        { method: "GET", credentials: "include" }
      )
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to fetch budget comments.")
      }

      const rawItems = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
            ? payload
            : []

      const mapped = rawItems.map((item: Record<string, unknown>, index: number) => {
        const userValue = item.userId as Record<string, unknown> | string | undefined
        const userObject = userValue && typeof userValue === "object" ? userValue : null
        const firstName = String(userObject?.firstName ?? "")
        const lastName = String(userObject?.lastName ?? "")
        const combinedName = `${firstName} ${lastName}`.trim()
        const lineItem = item.lineItemRef as Record<string, unknown> | undefined

        return {
          id: String(item._id ?? item.id ?? `comment-${index}`),
          budgetId: String(item.budgetId ?? budgetId),
          userId: String((userObject?._id as string) ?? item.userId ?? ""),
          userName: combinedName || String(item.userName ?? item.authorName ?? "Budget Team"),
          message: String(item.message ?? ""),
          createdAt: String(item.createdAt ?? new Date().toISOString()),
          lineItemRefName: String(lineItem?.name ?? ""),
          lineItemRefCode: String(lineItem?.code ?? ""),
        } as BudgetComment
      })

      const meta = (payload?.pagination ?? {}) as Record<string, unknown>
      const nextPagination = {
        page: Number(meta.page ?? page) || page,
        pages: Number(meta.pages ?? 1) || 1,
        total: Number(meta.total ?? mapped.length) || 0,
        limit: Number(meta.limit ?? limit) || limit,
      }

      setComments(
        [...mapped].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      )
      setPagination(nextPagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load budget comments.")
      setComments([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [budgetId, page, limit])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  return { comments, pagination, loading, error, setComments, loadComments }
}
