"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { FileText, Info, Paperclip, Send, X } from "lucide-react"
import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { describeApiError } from "@/lib/api-error"
import { useAuth } from "@/components/auth/AuthProvider"
import { fetchBudgetComments, mapComment, markThreadSeen, type ThreadComment } from "@/lib/budget-threads"

/**
 * The conversation on one budget line, for whoever is looking at it: the
 * accountant defending a figure, the pastor querying it. Messages post to the
 * budget's comment thread tagged with the line's account head, and only that
 * line's messages are shown.
 */
export type BudgetLineThreadProps = {
  budgetId: string
  /** Chart-of-account id of the line; empty shows the budget-wide thread. */
  lineItemRef: string
  lineName: string
  onClose: () => void
  /** Called after a message is sent or the thread is read, so indicators can refresh. */
  onActivity?: () => void
  /** `aside` sits in a page's right column; `overlay` floats over the page. */
  variant?: "aside" | "overlay"
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const sameDay = d.toDateString() === new Date().toDateString()
  return sameDay
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + " " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function BudgetLineThread({ budgetId, lineItemRef, lineName, onClose, onActivity, variant = "aside" }: BudgetLineThreadProps) {
  const { user } = useAuth()
  const userId = String((user as { id?: string } | null)?.id ?? "")

  const [comments, setComments] = useState<ThreadComment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const load = async () => {
    if (!budgetId) return
    setLoading(true)
    setError(null)
    try {
      setComments(await fetchBudgetComments(budgetId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load messages.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetId])

  const thread = useMemo(
    () => (lineItemRef ? comments.filter((c) => c.lineItemRef === lineItemRef) : comments),
    [comments, lineItemRef]
  )

  // Opening the thread reads it: remember the latest message as seen.
  useEffect(() => {
    if (loading || thread.length === 0) return
    markThreadSeen(userId, budgetId, lineItemRef, thread[thread.length - 1].id)
    onActivity?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, thread.length, budgetId, lineItemRef, userId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [thread.length])

  const currentUserName = useMemo(() => {
    const u = (user ?? {}) as Record<string, unknown>
    const combined = `${typeof u.firstName === "string" ? u.firstName : ""} ${typeof u.lastName === "string" ? u.lastName : ""}`.trim()
    return combined || (typeof u.name === "string" && u.name) || "You"
  }, [user])

  const handleSend = async () => {
    setSendError(null)
    const message = draft.trim()
    if (!message || !budgetId) return
    setSending(true)
    try {
      const res = await fetch(`${API_V1}/financial/budgets/${encodeURIComponent(budgetId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
        credentials: "include",
        body: JSON.stringify({ message, ...(lineItemRef ? { lineItemRef } : {}) }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(describeApiError(json, "Unable to send the message."))
      setDraft("")
      const data = (json as { data?: Record<string, unknown> } | null)?.data
      const sent = data ? mapComment(data, budgetId) : null
      setComments((prev) => [
        ...prev,
        sent ?? { id: `local-${Date.now()}`, budgetId, lineItemRef, lineName, userId, userName: currentUserName, message, createdAt: new Date().toISOString() },
      ])
      onActivity?.()
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Unable to send the message.")
    } finally {
      setSending(false)
    }
  }

  const panel = (
    <aside
      className={
        variant === "overlay"
          ? "fixed inset-y-0 right-0 z-50 w-full max-w-[400px] border-l border-[#EEF1F6] bg-white flex flex-col shadow-2xl"
          : "w-[380px] border-l border-[#EEF1F6] bg-white h-screen flex flex-col shrink-0"
      }
      role="dialog"
      aria-label={`Thread: ${lineName || "Budget discussion"}`}
    >
      <div className="border-b border-[#EEF1F6] bg-[#F8FAFC] p-5 min-h-[72px] flex items-center justify-between shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <Info className="h-4.5 w-4.5 text-[#2563EB] mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-[#2563EB] tracking-wider uppercase">Active Thread</div>
            <div className="text-[14px] font-bold text-[#111827] leading-tight mt-1 truncate">{lineName || "Budget Discussion"}</div>
            <div className="text-[11.5px] text-[#6B7280] font-medium mt-0.5">
              {thread.length === 0 ? "No messages yet" : `${thread.length} ${thread.length === 1 ? "message" : "messages"}`}
            </div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close thread" className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6">
        {loading && <div className="text-[12px] text-[#6B7280]">Loading messages...</div>}
        {error && <div className="text-[12px] text-rose-600">{error}</div>}
        {!loading && !error && thread.length === 0 && (
          <div className="text-[12px] text-[#6B7280]">No messages yet. Start the conversation below.</div>
        )}
        {thread.map((c) => {
          const isMe = !!userId && c.userId === userId
          const time = formatTime(c.createdAt)
          if (isMe) {
            return (
              <div key={c.id} className="flex flex-col items-end">
                <div className="flex items-center justify-end w-full gap-2 mb-1.5">
                  <span className="text-[10.5px] text-[#9CA3AF] font-medium">{time}</span>
                  <span className="text-[12.5px] font-semibold text-[#111827]">You</span>
                </div>
                <div className="flex gap-3 justify-end w-full">
                  <div className="bg-[#EEF2FF] rounded-[14px] rounded-tr-[4px] p-3.5 text-[13px] text-[#1E3A8A] leading-relaxed shadow-sm border border-[#E0E7FF] max-w-[85%] whitespace-pre-wrap break-words">
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-semibold text-[#111827] truncate">{c.userName}</span>
                  <span className="text-[10.5px] text-[#9CA3AF] font-medium shrink-0">{time}</span>
                </div>
                <div className="bg-[#F3F4F6] rounded-[14px] rounded-tl-[4px] p-3.5 mt-1.5 text-[13px] text-[#374151] leading-relaxed shadow-sm whitespace-pre-wrap break-words">
                  {c.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-5 border-t border-[#EEF1F6] bg-white shrink-0">
        {sendError && <div className="mb-2 text-[11px] text-rose-600">{sendError}</div>}
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
            placeholder={budgetId ? "Type your message..." : "Open a budget line to start a thread"}
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
              className="h-10 w-10 rounded-[10px] bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

  if (variant === "overlay") {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
        {panel}
      </>
    )
  }
  return panel
}
