"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import BudgetPage from "../budget/page"
import { X, Info, Paperclip, Send, Trash2 } from "lucide-react"
import { useBudgetComments } from "@/components/hooks/useBudgetComments"
import { useBudget } from "@/components/hooks/useBudget"

function formatTime(value: string): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean)
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "CM"
  )
}

function getCsrfToken() {
  if (typeof document === "undefined") return ""
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrf_token="))
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
}

function CommunicationPageInner() {
  const [message, setMessage] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const searchParams = useSearchParams()
  const budgetId = searchParams.get("budgetId") ?? ""
  const budgetTitleQuery = searchParams.get("title") ?? ""
  const { comments, pagination, loading, error, setComments, loadComments } = useBudgetComments(budgetId, page, 20)
  const { budget, loading: budgetLoading, error: budgetError, fetchBudget } = useBudget()

  useEffect(() => {
    if (!budgetId) return
    fetchBudget(budgetId).catch(() => null)
  }, [budgetId, fetchBudget])

  useEffect(() => {
    setPage(1)
  }, [budgetId])

  const budgetTitle =
    (typeof budget?.title === "string" && budget.title.trim()) ||
    (typeof budget?.name === "string" && budget.name.trim()) ||
    budgetTitleQuery ||
    "Budget Discussion"

  const handleDeleteComment = async (commentId: string) => {
    if (!budgetId || !commentId) return
    setDeletingId(commentId)
    setDeleteError(null)
    try {
      const response = await fetch(
        `/api/v1/core/financial/budgets/${encodeURIComponent(budgetId)}/comments/${encodeURIComponent(commentId)}`,
        {
          method: "DELETE",
          headers: {
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
        }
      )
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete comment.")
      }

      setComments((prev) => prev.filter((item) => item.id !== commentId))
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Unable to delete comment.")
    } finally {
      setDeletingId(null)
    }
  }

  const handlePostComment = async () => {
    if (!budgetId) {
      setPostError("Budget ID is required to post comments.")
      return
    }
    const text = message.trim()
    if (!text) {
      setPostError("Comment message is required.")
      return
    }

    setPosting(true)
    setPostError(null)
    try {
      const response = await fetch(`/api/v1/core/financial/budgets/${encodeURIComponent(budgetId)}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to add comment.")
      }

      setMessage("")
      await loadComments()
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Unable to add comment.")
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <BudgetPage />
      </div>

      <div className="w-[280px] xl:w-[320px] shrink-0 bg-white flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.03)] border-l border-[#EEF1F6] z-50">
        <div className="bg-[#F4F7FF] p-5 border-b border-[#EEF1F6]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#3B5BDB] font-bold text-[12px] tracking-wide">
              <Info className="h-4 w-4" strokeWidth={2.5} />
              ACTIVE THREAD
            </div>
            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <h2 className="text-[18px] font-bold text-[#111827] tracking-tight leading-tight">{budgetTitle}</h2>
          <p className="text-[13px] font-medium text-[#6B7280] mt-1.5">
            {!budgetId && "Select a budget to view comments"}
            {budgetId && budgetLoading && "Loading budget details..."}
            {budgetId && !budgetLoading && budget?.status && `Status: ${String(budget.status).replace(/_/g, " ")}`}
            {budgetId && !budgetLoading && !budget?.status && `Budget ID: ${budgetId.slice(0, 8)}...`}
          </p>
          {budgetError && <p className="text-[11px] font-medium text-rose-500 mt-1">{budgetError}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loading && <div className="text-[12px] text-[#6B7280]">Loading comments...</div>}
          {!loading && error && <div className="text-[12px] text-rose-600">{error}</div>}
          {!loading && !error && !budgetId && (
            <div className="text-[12px] text-[#6B7280]">No budget selected. Open this page with a `budgetId` query.</div>
          )}
          {!loading && !error && budgetId && comments.length === 0 && (
            <div className="text-[12px] text-[#6B7280]">No comments yet for this budget.</div>
          )}

          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-[#E0E7FF] text-[#3B5BDB] flex items-center justify-center font-bold text-[11px] shrink-0">
                {getInitials(comment.userName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#111827] text-[13px]">{comment.userName}</span>
                  <span className="text-[11px] font-medium text-[#9CA3AF]">{formatTime(comment.createdAt)}</span>
                </div>
                <div className="bg-[#F3F4F6] rounded-[12px] rounded-tl-none p-3.5 text-[13px] text-[#4B5563] leading-relaxed relative border border-[#EEF1F6]">
                  {comment.message}
                  {(comment.lineItemRefName || comment.lineItemRefCode) && (
                    <div className="mt-2 text-[11px] font-semibold text-[#6B7280]">
                      {comment.lineItemRefCode ? `${comment.lineItemRefCode} - ` : ""}
                      {comment.lineItemRefName}
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={deletingId === comment.id}
                    className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-rose-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === comment.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {deleteError && <div className="text-[12px] text-rose-600">{deleteError}</div>}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between gap-2 text-[11px] text-[#6B7280]">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.page <= 1}
                className="rounded border border-[#E5E7EB] px-2 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                disabled={pagination.page >= pagination.pages}
                className="rounded border border-[#E5E7EB] px-2 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[#EEF1F6] bg-white mt-auto">
          <div className="relative flex items-center border border-[#E5E7EB] rounded-[10px] bg-white shadow-sm p-1.5">
            <input
              type="text"
              placeholder="Type your budget feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handlePostComment()
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#111827] placeholder:text-[#9CA3AF] pl-3 py-2 font-medium h-[42px] min-w-0 w-full"
            />
            <div className="flex items-center gap-1.5 pr-1 shrink-0">
              <button className="h-9 w-9 flex items-center justify-center rounded-[8px] text-[#9CA3AF] hover:bg-gray-50 hover:text-[#4B5563] transition-colors">
                <Paperclip className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
              <button
                onClick={handlePostComment}
                disabled={posting || !budgetId}
                className="h-9 w-9 flex items-center justify-center rounded-[8px] bg-[#3B5BDB] text-white hover:bg-[#3451b2] transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                <Send className="h-4 w-4 -ml-[2px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          {postError && <div className="mt-2 text-[12px] text-rose-600">{postError}</div>}
        </div>
      </div>
    </div>
  )
}


export default function CommunicationPage() {
  return (
    <Suspense fallback={null}>
      <CommunicationPageInner />
    </Suspense>
  )
}
