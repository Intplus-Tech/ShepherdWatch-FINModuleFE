"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type TransactionCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  flowType: "income" | "expense"
  tenantId: string
}

export function TransactionCreateModal({
  open,
  onOpenChange,
  onSuccess,
  flowType,
  tenantId,
}: TransactionCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [chartOfAccountId, setChartOfAccountId] = useState("")
  const [transactionDate, setTransactionDate] = useState(() => {
    return new Date().toISOString().slice(0, 10)
  })

  const [coaOptions, setCoaOptions] = useState<Array<{ id: string; label: string }>>([])
  const [coaLoading, setCoaLoading] = useState(true)

  useEffect(() => {
    if (!open || !tenantId) return

    let isMounted = true

    const loadCoa = async () => {
      setCoaLoading(true)
      try {
        const type = flowType.toUpperCase()
        const url = `/api/core/financial/coa?type=${type}&tenantId=${encodeURIComponent(tenantId)}`
        const res = await fetch(url, { credentials: "include" })
        const payload = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(payload?.message ?? "Failed to load Chart of Accounts")
        }

        const rawItems = Array.isArray(payload?.data?.content)
          ? payload.data.content
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload)
                ? payload
                : []
                
        const options = rawItems.map((item: any) => ({
          id: String(item.id ?? item.coaId),
          label: `${item.code ?? item.accountCode ?? ""} - ${item.name ?? item.accountName ?? item.title}`.replace(/^- /, ""),
        }))

        if (isMounted) {
          setCoaOptions(options)
          if (options.length > 0 && !chartOfAccountId) {
            setChartOfAccountId(options[0].id)
          }
        }
      } catch (err) {
        console.error("COA load error:", err)
      } finally {
        if (isMounted) setCoaLoading(false)
      }
    }

    loadCoa()

    return () => {
      isMounted = false
    }
  }, [open, tenantId, flowType])

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        type: flowType,
        amount: Number(amount),
        description,
        branchId: tenantId,
        chartOfAccountId,
        transactionDate,
      }

      const res = await fetch("/api/core/financial/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to create transaction")
      }

      setAmount("")
      setDescription("")
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] font-sans">
        <DialogHeader>
          <DialogTitle>Record {flowType === "income" ? "Income" : "Expense"}</DialogTitle>
          <DialogDescription>
            Enter the details for this new transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 15000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Sunday Offering"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Date</label>
            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Category (COA)</label>
            <select
              required
              value={chartOfAccountId}
              onChange={(e) => setChartOfAccountId(e.target.value)}
              disabled={coaLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">{coaLoading ? "Loading..." : "Select account"}</option>
              {coaOptions.map((coa) => (
                <option key={coa.id} value={coa.id}>
                  {coa.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || coaLoading}>
              {loading ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
