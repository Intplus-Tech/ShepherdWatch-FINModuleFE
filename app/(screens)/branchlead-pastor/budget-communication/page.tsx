"use client"

import { API_V1 } from "@/lib/api";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BudgetReviewContent } from "../budget-review/page"
import { Info, X, FileText, Send, Paperclip } from "lucide-react"
import { useBudgetComments } from "@/components/hooks/useBudgetComments"
import { useAuth } from "@/components/auth/AuthProvider"

function getCsrfToken(): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.split("; ").find((row) => row.startsWith("csrf_token="))
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  } catch {
    return ""
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function BudgetCommunicationInner() {
  const searchParams = useSearchParams()
  const budgetId = searchParams.get("budgetId") ?? ""
  const lineItemRef = searchParams.get("lineItemRef") ?? ""
  const { user } = useAuth()

  const { comments, loading, error, setComments, loadComments } = useBudgetComments(budgetId)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const orderedComments = useMemo(
    () => [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments]
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [orderedComments.length])

  const currentUserName = useMemo(() => {
    if (!user) return "You"
    const u = user as Record<string, unknown>
    const first = typeof u.firstName === "string" ? u.firstName : ""
    const last = typeof u.lastName === "string" ? u.lastName : ""
    const combined = `${first} ${last}`.trim()
    if (combined) return combined
    if (typeof u.name === "string" && u.name) return u.name
    return "You"
  }, [user])

  const handleSend = async () => {
    setSendError(null)
    const message = draft.trim()
    if (!message) return
    if (!budgetId) {
      setSendError("Select a budget to start a thread (missing budgetId).")
      return
    }
    setSending(true)
    try {
      const response = await fetch(
        `${API_V1}/financial/budgets/${encodeURIComponent(budgetId)}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify({ message, ...(lineItemRef ? { lineItemRef } : {}) }),
        }
      )
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to send message.")
      }
      setDraft("")
      const data = payload?.data as Record<string, unknown> | undefined
      const newId = String(data?._id ?? data?.id ?? `local-${Date.now()}`)
      setComments((prev) => [
        ...prev,
        {
          id: newId,
          budgetId,
          userId: (user?.id as string | undefined) ?? "",
          userName: currentUserName,
          message,
          createdAt: new Date().toISOString(),
          lineItemRefName: lineItemRef,
          lineItemRefCode: "",
        },
      ])
      loadComments()
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Unable to send message.")
    } finally {
      setSending(false)
    }
  }

  const rightSidebar = (
    <aside className="w-[380px] border-l border-[#EEF1F6] bg-white h-screen flex flex-col shrink-0">

      {/* Thread Header */}
      <div className="border-b border-[#EEF1F6] bg-[#F8FAFC] p-5 h-[72px] flex items-center justify-between shrink-0">
        <div className="flex items-start gap-3">
          <Info className="h-4.5 w-4.5 text-[#2563EB] mt-0.5" />
          <div>
            <div className="text-[10px] font-bold text-[#2563EB] tracking-wider uppercase">Active Thread</div>
            <div className="text-[14px] font-bold text-[#111827] leading-tight mt-1">
              {lineItemRef || "Budget Discussion"}
            </div>
            <div className="text-[11.5px] text-[#6B7280] font-medium mt-0.5">
              {budgetId ? `Budget: ${budgetId}` : "Open from a budget to start a thread"}
            </div>
          </div>
        </div>
        <button aria-label="Close thread" className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6">
        {loading && (
          <div className="text-[12px] text-[#6B7280]">Loading messages...</div>
        )}
        {error && (
          <div className="text-[12px] text-rose-600">{error}</div>
        )}
        {!loading && !error && orderedComments.length === 0 && (
          <div className="text-[12px] text-[#6B7280]">
            {budgetId ? "No messages yet. Start the conversation below." : "No active thread selected."}
          </div>
        )}
        {orderedComments.map((c) => {
          const isMe = !!user?.id && c.userId === user.id
          const time = formatTime(c.createdAt)
          if (isMe) {
            return (
              <div key={c.id} className="flex flex-col items-end">
                <div className="flex items-center justify-end w-full gap-2 mb-1.5">
                  <span className="text-[10.5px] text-[#9CA3AF] font-medium">{time}</span>
                  <span className="text-[12.5px] font-semibold text-[#111827]">You</span>
                </div>
                <div className="flex gap-3 justify-end w-full">
                  <div className="bg-[#EEF2FF] rounded-[14px] rounded-tr-[4px] p-3.5 text-[13px] text-[#1E3A8A] leading-relaxed shadow-sm border border-[#E0E7FF] max-w-[85%]">
                    {c.message}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    {initialsOf(currentUserName)}
                  </div>
                </div>
              </div>
            )
          }
          return (
            <div key={c.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-[#E0E7FF] text-[#3B5BDB] flex items-center justify-center font-bold text-[11px] shrink-0">
                {initialsOf(c.userName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold text-[#111827]">{c.userName}</span>
                  <span className="text-[10.5px] text-[#9CA3AF] font-medium">{time}</span>
                </div>
                <div className="bg-[#F3F4F6] rounded-[14px] rounded-tl-[4px] p-3.5 mt-1.5 text-[13px] text-[#374151] leading-relaxed shadow-sm">
                  {c.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Box */}
      <div className="p-5 border-t border-[#EEF1F6] bg-white shrink-0">
        {sendError && (
          <div className="mb-2 text-[11px] text-rose-600">{sendError}</div>
        )}
        <div className="relative flex items-end bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB] p-2 hover:border-[#D1D5DB] transition-colors focus-within:border-[#3B5BDB] focus-within:ring-1 focus-within:ring-[#3B5BDB]">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (!sending) void handleSend()
              }
            }}
            placeholder={budgetId ? "Type your feedback..." : "Open a budget to start a thread"}
            disabled={!budgetId || sending}
            className="flex-1 max-h-[100px] min-h-[40px] bg-transparent resize-none border-0 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:ring-0 py-2.5 px-3 outline-none leading-relaxed disabled:cursor-not-allowed"
            rows={1}
          />
          <div className="flex items-center gap-1 shrink-0 bg-transparent pl-2">
            <button aria-label="Attach file" disabled className="h-10 w-10 text-[#9CA3AF] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              <Paperclip className="h-4.5 w-4.5" />
            </button>
            <button
              aria-label="Send message"
              type="button"
              onClick={() => void handleSend()}
              disabled={!budgetId || sending || !draft.trim()}
              className="h-10 w-10.5 rounded-[10px] bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4.5 w-4.5 -ml-0.5" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-[#9CA3AF]">
          <FileText className="h-3 w-3" />
          <span>Attachments coming soon</span>
        </div>
      </div>

    </aside>
  )

  return <BudgetReviewContent rightSidebar={rightSidebar} activeRowId={lineItemRef || "maintenance"} />
}

export default function BudgetCommunicationPage() {
  return (
    <Suspense fallback={null}>
      <BudgetCommunicationInner />
    </Suspense>
  )
}
