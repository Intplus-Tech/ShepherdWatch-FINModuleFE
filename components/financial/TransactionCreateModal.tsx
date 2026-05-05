import { API_V1 } from "@/lib/api";
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

type CoaTreeNode = {
  id?: string
  _id?: string
  coaId?: string
  code?: string
  accountCode?: string
  name?: string
  accountName?: string
  title?: string
  accountType?: string
  children?: CoaTreeNode[]
}

type CoaEntry = {
  id: string
  code: string
  name: string
  accountType: string
  description?: string
}

function flattenCoaTree(nodes: CoaTreeNode[]): CoaTreeNode[] {
  const flat: CoaTreeNode[] = []
  const queue = [...nodes]
  while (queue.length > 0) {
    const node = queue.shift()
    if (!node) continue
    flat.push(node)
    if (Array.isArray(node.children) && node.children.length > 0) {
      queue.push(...node.children)
    }
  }
  return flat
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
  const [selectedCoa, setSelectedCoa] = useState<CoaEntry | null>(null)
  const [selectedCoaLoading, setSelectedCoaLoading] = useState(false)
  const [editCoaName, setEditCoaName] = useState("")
  const [editCoaDescription, setEditCoaDescription] = useState("")
  const [updatingCoa, setUpdatingCoa] = useState(false)
  const [coaUpdateMessage, setCoaUpdateMessage] = useState<string | null>(null)
  const [deletingCoa, setDeletingCoa] = useState(false)

  useEffect(() => {
    if (!open || !tenantId) return

    let isMounted = true

    const loadCoa = async () => {
      setCoaLoading(true)
      try {
        const accountType = flowType === "income" ? "revenue" : "expense"
        const url = `${API_V1}/financial/coa/tree?branchId=${encodeURIComponent(tenantId)}`
        const res = await fetch(url, { credentials: "include" })
        const payload = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(payload?.message ?? "Failed to load Chart of Accounts")
        }

        const rawTree = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload)
              ? payload
              : []

        const rawItems = flattenCoaTree(rawTree as CoaTreeNode[]).filter(
          (item) => String(item.accountType ?? "").toLowerCase() === accountType
        )

        const options = rawItems
          .map((item) => ({
            id: String(item.id ?? item._id ?? item.coaId ?? ""),
            label: `${item.code ?? item.accountCode ?? ""} - ${item.name ?? item.accountName ?? item.title}`.replace(/^- /, ""),
          }))
          .filter((item: { id: string }) => item.id)

        if (isMounted) {
          setCoaOptions(options)
          if (options.length > 0) {
            setChartOfAccountId((prev) => prev || options[0].id)
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

  useEffect(() => {
    if (!open || !chartOfAccountId) return
    let isMounted = true

    const loadCoaById = async () => {
      setSelectedCoaLoading(true)
      try {
        const res = await fetch(`${API_V1}/financial/coa/${encodeURIComponent(chartOfAccountId)}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(payload?.message ?? "Unable to fetch chart of account details.")
        }
        const item = (payload?.data ?? payload ?? {}) as Record<string, unknown>
        if (isMounted) {
          setSelectedCoa({
            id: String(item.id ?? item._id ?? chartOfAccountId),
            code: String(item.code ?? ""),
            name: String(item.name ?? item.accountName ?? item.title ?? ""),
            accountType: String(item.accountType ?? ""),
            description: String(item.description ?? ""),
          })
          setEditCoaName(String(item.name ?? item.accountName ?? item.title ?? ""))
          setEditCoaDescription(String(item.description ?? ""))
        }
      } catch {
        if (isMounted) {
          setSelectedCoa(null)
        }
      } finally {
        if (isMounted) {
          setSelectedCoaLoading(false)
        }
      }
    }

    loadCoaById()
    return () => {
      isMounted = false
    }
  }, [open, chartOfAccountId])

  const handleUpdateSelectedCoa = async () => {
    if (!selectedCoa) return
    if (!editCoaName.trim()) {
      setCoaUpdateMessage("Name is required.")
      return
    }

    setUpdatingCoa(true)
    setCoaUpdateMessage(null)
    try {
      const res = await fetch(`${API_V1}/financial/coa/${encodeURIComponent(selectedCoa.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: editCoaName.trim(),
          description: editCoaDescription.trim() || undefined,
        }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to update chart of account.")
      }

      const updated = (payload?.data ?? payload ?? {}) as Record<string, unknown>
      const updatedName = String(updated.name ?? editCoaName.trim())
      const updatedCode = String(updated.code ?? selectedCoa.code)
      const updatedDescription = String(updated.description ?? editCoaDescription.trim())

      setSelectedCoa((prev) =>
        prev
          ? {
              ...prev,
              name: updatedName,
              code: updatedCode,
              description: updatedDescription,
            }
          : prev
      )
      setCoaOptions((prev) =>
        prev.map((item) =>
          item.id === selectedCoa.id
            ? { ...item, label: `${updatedCode ? `${updatedCode} - ` : ""}${updatedName}` }
            : item
        )
      )
      setCoaUpdateMessage("Chart of account updated.")
    } catch (err) {
      setCoaUpdateMessage(err instanceof Error ? err.message : "Unable to update chart of account.")
    } finally {
      setUpdatingCoa(false)
    }
  }

  const handleDeleteSelectedCoa = async () => {
    if (!selectedCoa) return
    setDeletingCoa(true)
    setCoaUpdateMessage(null)
    try {
      const res = await fetch(`${API_V1}/financial/coa/${encodeURIComponent(selectedCoa.id)}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to delete chart of account.")
      }

      setCoaOptions((prev) => prev.filter((item) => item.id !== selectedCoa.id))
      setSelectedCoa(null)
      setChartOfAccountId("")
      setCoaUpdateMessage("Chart of account deleted.")
    } catch (err) {
      setCoaUpdateMessage(err instanceof Error ? err.message : "Unable to delete chart of account.")
    } finally {
      setDeletingCoa(false)
    }
  }

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

      const res = await fetch(`${API_V1}/financial/transactions`, {
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
            <p className="text-[11px] text-gray-500">
              {selectedCoaLoading
                ? "Loading selected account details..."
                : selectedCoa
                  ? `${selectedCoa.code ? `${selectedCoa.code} - ` : ""}${selectedCoa.name} (${selectedCoa.accountType || "n/a"})`
                  : "Select a chart of account to continue."}
            </p>
            {selectedCoa && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-2.5 space-y-2">
                <input
                  type="text"
                  value={editCoaName}
                  onChange={(e) => setEditCoaName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-[12px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Update account name"
                />
                <input
                  type="text"
                  value={editCoaDescription}
                  onChange={(e) => setEditCoaDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-[12px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Update description (optional)"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleUpdateSelectedCoa}
                    disabled={updatingCoa}
                    className="rounded-md bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
                  >
                    {updatingCoa ? "Saving..." : "Update COA"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedCoa}
                    disabled={deletingCoa}
                    className="rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 disabled:opacity-60"
                  >
                    {deletingCoa ? "Deleting..." : "Delete COA"}
                  </button>
                  {coaUpdateMessage && <span className="text-[11px] text-gray-600">{coaUpdateMessage}</span>}
                </div>
              </div>
            )}
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
