"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  FileText,
  Landmark,
  Receipt,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { AmountInput, parseAmount } from "@/components/ui/amount-input"
import { useToast } from "@/components/ui/toast"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import {
  allocateStatementLine,
  buildSafeView,
  createLedgerEntry,
  entryRef,
  importStatement,
  loadAccountHeads,
  loadBankAccounts,
  loadMatchCandidates,
  loadPostableRequisitions,
  longDate,
  matchStatementLine,
  ngn,
  shortDate,
  unmatchStatementLine,
  type AccountHead,
  type BankAccountRow,
  type LedgerEntry,
  type MatchCandidate,
  type RequisitionOption,
  type StatementLine,
} from "@/lib/ledger"

const mono = "font-mono tracking-tight"
const inputCls =
  "w-full h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] font-medium text-[#111827] outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 disabled:bg-[#F9FAFB] disabled:text-[#6B7280]"
const labelCls = "text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#6B7280]"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#111827] mt-6 mb-2.5">{children}</h4>
}

function Header({ title, subtitle, onClose, dark }: { title: React.ReactNode; subtitle?: string; onClose: () => void; dark?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-6 py-4 rounded-t-[12px] ${dark ? "bg-[#0F172A] text-white" : "bg-[#FFF1F2] border-b border-rose-100"}`}>
      <div className="min-w-0">
        <div className={`text-[15px] sm:text-[17px] font-extrabold tracking-tight ${dark ? "text-white" : "text-[#111827]"}`}>{title}</div>
        {subtitle && <div className={`text-[10px] font-semibold uppercase tracking-[0.12em] mt-0.5 ${dark ? "text-slate-300" : "text-[#6B7280]"}`}>{subtitle}</div>}
      </div>
      <button onClick={onClose} aria-label="Close" className={`shrink-0 h-8 w-8 rounded-[6px] flex items-center justify-center ${dark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]"}`}>
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function Stat({ label, value, tag, dark, icon }: { label: string; value: string; tag?: string; dark?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`rounded-[10px] p-4 ${dark ? "bg-[#0F172A] text-white" : "bg-[#F8FAFC] border border-[#EEF1F6]"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className={`text-[10px] font-bold uppercase tracking-[0.1em] ${dark ? "text-slate-300" : "text-[#6B7280]"}`}>{label}</div>
        {tag ? (
          <span className="rounded-[4px] bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 whitespace-nowrap">{tag}</span>
        ) : icon ? (
          <span className="h-7 w-7 rounded-[6px] bg-rose-50 text-rose-600 flex items-center justify-center">{icon}</span>
        ) : null}
      </div>
      <div className={`mt-3 text-[22px] sm:text-[26px] font-extrabold tracking-tight ${dark ? "text-white" : "text-[#111827]"}`}>{value}</div>
    </div>
  )
}

function DropZone({ file, onFile, onClear, hint, accept }: { file: File | null; onFile: (f: File) => void; onClear: () => void; hint: string; accept?: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [drag, setDrag] = useState(false)
  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-9 w-9 rounded-[6px] bg-rose-50 text-rose-600 flex items-center justify-center"><FileText className="h-4 w-4" /></span>
          <div className="min-w-0"><div className="text-[12.5px] font-bold text-[#111827] truncate">{file.name}</div><div className="text-[10.5px] text-[#6B7280]">{(file.size / 1024 / 1024).toFixed(2)} MB</div></div>
        </div>
        <button type="button" onClick={onClear} className="text-rose-500 hover:text-rose-700" aria-label="Remove file"><Trash2 className="h-4 w-4" /></button>
      </div>
    )
  }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f) }}
      onClick={() => inputRef.current?.click()}
      className={`rounded-[10px] border-2 border-dashed p-7 text-center cursor-pointer transition-colors ${drag ? "border-rose-500 bg-rose-50" : "border-[#E5E7EB] bg-[#F8FAFC] hover:border-rose-200"}`}
    >
      <input ref={inputRef} type="file" accept={accept ?? ".pdf,.png,.jpg,.jpeg"} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = "" }} />
      <span className="mx-auto h-11 w-11 rounded-[8px] bg-rose-50 text-rose-600 flex items-center justify-center"><CloudUpload className="h-5 w-5" /></span>
      <div className="mt-3 text-[13px] font-bold text-[#111827]">{hint}</div>
      <div className="text-[11px] text-[#6B7280] mt-1">Drag &amp; drop here, or click to browse.</div>
      <span className="inline-flex mt-3 rounded-[6px] bg-rose-50 text-rose-600 px-3 py-1.5 text-[11px] font-bold">Browse System Files</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// The cash safe: income recorded but not yet confirmed by the bank.
// ---------------------------------------------------------------------------

export function SafeBatchModal({
  open,
  onClose,
  branchName,
  entries,
  /** When set, the modal shows that one collection rather than the whole safe. */
  entry,
  onCashPaidIn,
}: {
  open: boolean
  onClose: () => void
  branchName?: string
  entries: LedgerEntry[]
  entry?: LedgerEntry | null
  onCashPaidIn?: (entry: LedgerEntry | null) => void
}) {
  const safe = useMemo(() => buildSafeView(entry ? [entry] : entries), [entries, entry])
  const reconciled = Boolean(entry && entry.reconciliationStatus === "reconciled")
  const title = entry ? entryRef(entry) : `CASH SAFE BALANCE${branchName ? ` — ${branchName}` : ""}`

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <Header
        title={
          entry ? (
            <span className={mono}>{title}</span>
          ) : (
            <span className="flex items-center gap-2"><span className="h-5 w-1.5 rounded-full bg-rose-500" />{title}</span>
          )
        }
        subtitle={entry ? undefined : "Counted and recorded, not yet in the bank"}
        onClose={onClose}
      />
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <Stat label="Total held outside the bank" value={ngn(safe.total, { decimals: true })} tag={reconciled ? "Reconciled" : safe.total > 0 ? "Pending bank run" : undefined} dark />
          <Stat label="Physical cash" value={ngn(safe.physicalCash, { decimals: true })} icon={<Landmark className="h-3.5 w-3.5" />} />
          <Stat label="Cheques in safe" value={ngn(safe.cheques, { decimals: true })} icon={<FileText className="h-3.5 w-3.5" />} />
        </div>

        <SectionTitle>Section 1: Safe ledger — unbanked collections</SectionTitle>
        <div className="rounded-[8px] overflow-hidden border border-[#EEF1F6]">
          <table className="w-full text-[12px]">
            <thead className="bg-rose-50 text-rose-700">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wide">
                <th className="px-3 py-2.5">Batch ref</th><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Collection</th><th className="px-3 py-2.5 text-right">Total counted</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {safe.batches.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-[#9CA3AF]">{reconciled ? "This collection has been banked." : "Nothing is waiting to be banked."}</td></tr>
              )}
              {safe.batches.map((b) => (
                <tr key={b.id} className="bg-white">
                  <td className="px-3 py-3"><span className={`${mono} rounded-[4px] bg-rose-50 text-rose-600 px-1.5 py-0.5 text-[11px] font-bold`}>{entryRef(b)}</span></td>
                  <td className="px-3 py-3 text-[#374151] font-medium whitespace-nowrap">{longDate(b.date)}</td>
                  <td className="px-3 py-3 text-[#374151] font-medium">{b.description || b.notes || "Collection"}</td>
                  <td className={`px-3 py-3 text-right font-bold text-[#111827] ${mono}`}>{ngn(b.amount, { decimals: true })}</td>
                  <td className="px-3 py-3"><span className="inline-flex items-center gap-1 rounded-[4px] bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />In safe · pending bank run</span></td>
                  <td className="px-3 py-3 text-right">
                    <button type="button" onClick={() => onCashPaidIn?.(b)} title="Reconcile this collection against the bank deposit" className="inline-flex rounded-[6px] bg-rose-600 text-white px-3 py-1.5 text-[11px] font-bold hover:bg-rose-700 transition-colors whitespace-nowrap">
                      Cash Paid In
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionTitle>Section 2: Fund breakdown</SectionTitle>
        <div className="rounded-[8px] overflow-hidden border border-[#EEF1F6]">
          <table className="w-full text-[12px]">
            <thead className="bg-rose-50 text-rose-700">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wide">
                <th className="px-3 py-2.5">Fund / GL account specification</th><th className="px-3 py-2.5 text-right">Cash</th><th className="px-3 py-2.5 text-right">Cheque</th><th className="px-3 py-2.5 text-right">Remaining in safe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {safe.funds.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-[#9CA3AF]">No unbanked income.</td></tr>}
              {safe.funds.map((f) => (
                <tr key={f.coaId || f.name} className="bg-white">
                  <td className="px-3 py-3 font-bold text-[#111827]">{f.name}{f.code ? <span className={`${mono} font-medium text-[#6B7280]`}> · {f.code}</span> : null}</td>
                  <td className={`px-3 py-3 text-right font-semibold text-[#111827] ${mono}`}>{f.cash > 0 ? ngn(f.cash, { decimals: true }) : "—"}</td>
                  <td className="px-3 py-3 text-right">
                    {f.cheque > 0 ? (
                      <div className="inline-flex flex-col items-end gap-0.5">
                        <span className={`font-semibold text-[#111827] ${mono}`}>{ngn(f.cheque, { decimals: true })}</span>
                        <span className="flex flex-wrap justify-end items-center gap-1.5">
                          {f.chequeDocs.map((c) =>
                            c.url ? (
                              <a key={c.ref} href={c.url} target="_blank" rel="noreferrer" title={`${c.ref} · ${ngn(c.amount, { decimals: true })}`} className="text-[9.5px] font-bold uppercase tracking-wide text-rose-600 hover:underline inline-flex items-center gap-1"><Receipt className="h-3 w-3" />View</a>
                            ) : (
                              <span key={c.ref} title={`${c.ref} · no scan uploaded`} className="text-[9.5px] font-bold uppercase tracking-wide text-[#9CA3AF] inline-flex items-center gap-1"><Receipt className="h-3 w-3" />No scan</span>
                            )
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">—</span>
                    )}
                  </td>
                  <td className={`px-3 py-3 text-right font-bold text-[#111827] ${mono}`}>{ngn(f.total, { decimals: true })}</td>
                </tr>
              ))}
              {safe.funds.length > 0 && (
                <tr className="bg-[#F8FAFC]">
                  <td className="px-3 py-3 font-extrabold text-[#111827]">TOTAL LOCKED BALANCE:</td>
                  <td className={`px-3 py-3 text-right font-extrabold text-[#111827] ${mono}`}>{ngn(safe.physicalCash, { decimals: true })}</td>
                  <td className={`px-3 py-3 text-right font-extrabold text-[#111827] ${mono}`}>{safe.cheques > 0 ? ngn(safe.cheques, { decimals: true }) : "—"}</td>
                  <td className={`px-3 py-3 text-right font-extrabold text-emerald-600 ${mono}`}>{ngn(safe.total, { decimals: true })}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {entry?.receiptUrl && (
          <>
            <SectionTitle>Section 3: Counting form / receipt</SectionTitle>
            <div className="rounded-[8px] border border-[#EEF1F6] bg-white p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0"><Receipt className="h-4 w-4 text-rose-500 shrink-0" /><span className="text-[12.5px] font-semibold text-[#111827] truncate">{entryRef(entry)}</span></div>
              <a href={entry.receiptUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase text-rose-600 hover:underline">View</a>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Bank balance across the branch's accounts.
// ---------------------------------------------------------------------------

export function BankBalanceModal({
  open,
  onClose,
  branchName,
  accounts,
  entries,
  onAddAccount,
}: {
  open: boolean
  onClose: () => void
  branchName?: string
  accounts: BankAccountRow[]
  entries: LedgerEntry[]
  onAddAccount: () => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const total = accounts.reduce((s, a) => s + a.balance, 0)
  const reconciledFor = (id: string) => entries.filter((e) => e.bankAccountId === id && e.reconciliationStatus === "reconciled")
  const latestFor = (id: string) => reconciledFor(id)[0] ?? null
  const sum = (id: string, type: "income" | "expense") => reconciledFor(id).filter((e) => e.entryType === type).reduce((s, e) => s + e.amount, 0)
  const tone = ["bg-rose-500", "bg-[#0F172A]", "bg-[#F59E0B]", "bg-[#10B981]", "bg-[#8B5CF6]"]

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <Header title={<span className="flex items-center gap-2"><span className="h-5 w-1.5 rounded-full bg-rose-500" />BANK BALANCE{branchName ? ` — ${branchName}` : ""}</span>} onClose={onClose} />
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="sm:col-span-2"><Stat label="Total consolidated position" value={ngn(total, { decimals: true })} dark /></div>
          <div className="rounded-[10px] bg-[#F8FAFC] border border-[#EEF1F6] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Operating accounts</div><Landmark className="h-4 w-4 text-rose-500" /></div>
            <div><div className="text-[24px] font-extrabold text-[#111827]">{accounts.length}</div><div className="text-[10.5px] text-[#6B7280]">Accounts</div></div>
            <button onClick={onAddAccount} className="mt-2 h-8 rounded-[6px] bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700">+ Add Account</button>
          </div>
        </div>

        <SectionTitle><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" />Authorized branch ledgers</span></SectionTitle>
        <div className="rounded-[8px] overflow-hidden border border-[#EEF1F6]">
          <table className="w-full text-[12px]">
            <thead className="bg-[#F8FAFC] text-[#6B7280]">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wide">
                <th className="px-3 py-2.5">#</th><th className="px-3 py-2.5">Financial institution</th><th className="px-3 py-2.5">Acc no.</th><th className="px-3 py-2.5">Purpose</th><th className="px-3 py-2.5 text-right">Settled balance (NGN)</th><th className="px-3 py-2.5 text-right">Latest pay-in</th><th className="px-3 py-2.5">Timestamp</th><th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {accounts.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-[#6B7280]">No bank accounts yet. Add one to see its ledger here.</td></tr>}
              {accounts.map((a, i) => {
                const latest = latestFor(a.id)
                const isOpen = expanded === a.id
                return (
                  <React.Fragment key={a.id}>
                    <tr className="bg-white">
                      <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5"><span className={`h-4 w-1 rounded-full ${tone[i % tone.length]}`} />{String(i + 1).padStart(2, "0")}</span></td>
                      <td className="px-3 py-3 font-bold text-[#111827]">{a.bankName}</td>
                      <td className={`px-3 py-3 ${mono} text-[#374151]`}>{a.accountNumber}</td>
                      <td className="px-3 py-3"><span className={`${mono} rounded-[4px] bg-rose-50 text-rose-600 px-1.5 py-0.5 text-[10.5px] font-bold`}>{a.accountName}</span></td>
                      <td className={`px-3 py-3 text-right font-bold text-[#111827] ${mono}`}>{ngn(a.balance, { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} text-emerald-600 font-semibold`}>{latest ? `+${ngn(latest.amount, { decimals: true })}` : "—"}</td>
                      <td className="px-3 py-3 text-[#6B7280] whitespace-nowrap">{latest ? longDate(latest.date) : "—"}</td>
                      <td className="px-3 py-3 text-right"><button onClick={() => setExpanded(isOpen ? null : a.id)} className="h-7 w-7 rounded-full hover:bg-rose-50 text-[#6B7280] inline-flex items-center justify-center" aria-label="Toggle details">{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button></td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-rose-50/30">
                        <td colSpan={8} className="px-4 pb-4 pt-1">
                          <div className="rounded-[8px] border border-rose-100 bg-white p-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="text-[12px] font-bold text-[#111827]">{a.bankName} — {a.accountName} <span className={`${mono} text-[#6B7280] font-medium`}>({a.accountNumber})</span></div>
                              <div className="text-[10px] font-bold uppercase text-[#6B7280]">Current ledger balance: <span className={`${mono} text-[#111827]`}>{ngn(a.balance, { decimals: true })}</span></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                              <div><div className={labelCls}>Reconciled debits</div><div className={`${mono} text-[13px] font-bold text-[#111827] mt-1`}>{ngn(sum(a.id, "expense"), { decimals: true })}</div></div>
                              <div><div className={labelCls}>Reconciled credits</div><div className={`${mono} text-[13px] font-bold text-[#111827] mt-1`}>{ngn(sum(a.id, "income"), { decimals: true })}</div></div>
                              <div><div className={labelCls}>Latest pay-in</div><div className={`${mono} text-[13px] font-bold text-emerald-600 mt-1`}>{latest ? `+${ngn(latest.amount, { decimals: true })}` : "—"}</div>{latest && <div className="text-[10px] text-[#6B7280]">{entryRef(latest)}</div>}</div>
                            </div>
                            <div className="mt-3 text-[10.5px] text-[#6B7280]">Statement lines for this account are under Reports.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// New Entry — POST /general-ledger, multipart, receipt required.
// ---------------------------------------------------------------------------

/**
 * Income reaches the branch two ways. Over the counter the accountant takes
 * it in person; a service collection is counted, written up on a form and
 * locked in the safe for the next bank run. Both are banked as cash, which is
 * how the matching modal finds them against the bank run.
 */
const COLLECTIONS = [
  { value: "office", label: "Office collection", hint: "Handed in at the church office — tithe, donation or gift, in cash or cheque." },
  { value: "service", label: "Service collection", hint: "Counted after a service and locked in the safe for the bank run. Attach the counting form." },
] as const
type CollectionType = (typeof COLLECTIONS)[number]["value"]

const PAYMENT_METHODS = [
  { value: "transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
  { value: "pos", label: "POS" },
] as const
type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"]

export function NewEntryModal({
  open,
  onClose,
  accounts,
  onPosted,
}: {
  open: boolean
  onClose: () => void
  accounts: BankAccountRow[]
  onPosted?: () => void
}) {
  const { pushToast } = useToast()
  const { branchId } = useBranchContext()
  const [kind, setKind] = useState<"expense" | "income">("expense")
  const [collection, setCollection] = useState<CollectionType>("service")
  const [date, setDate] = useState("")
  const [requisitions, setRequisitions] = useState<RequisitionOption[]>([])
  const [requisitionId, setRequisitionId] = useState("")
  const [incomeHeads, setIncomeHeads] = useState<AccountHead[]>([])
  const [expenseHeads, setExpenseHeads] = useState<AccountHead[]>([])
  const [coaId, setCoaId] = useState("")
  const [amount, setAmount] = useState("")
  const [payee, setPayee] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("transfer")
  const [bankAccountId, setBankAccountId] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loadingLists, setLoadingLists] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setKind("expense")
    setCollection("service")
    setDate(new Date().toISOString().slice(0, 10))
    setRequisitionId("")
    setCoaId("")
    setAmount("")
    setPayee("")
    setMethod("transfer")
    setBankAccountId("")
    setDescription("")
    setFile(null)
    setSaving(false)
    setError(null)
    setFieldErrors({})
    let active = true
    setLoadingLists(true)
    Promise.all([
      loadPostableRequisitions().catch(() => [] as RequisitionOption[]),
      loadAccountHeads(branchId, "income").catch(() => [] as AccountHead[]),
      loadAccountHeads(branchId, "expense").catch(() => [] as AccountHead[]),
    ])
      .then(([r, inc, exp]) => {
        if (!active) return
        setRequisitions(r)
        setIncomeHeads(inc)
        setExpenseHeads(exp)
      })
      .finally(() => {
        if (active) setLoadingLists(false)
      })
    return () => {
      active = false
    }
  }, [open, branchId])

  // Collections are banked as cash: that is how matching pairs them with the
  // bank run. The accountant can still override it.
  useEffect(() => {
    if (kind === "income") setMethod("cash")
    else setMethod("transfer")
  }, [kind])

  const requisition = requisitions.find((r) => r.id === requisitionId) ?? null
  useEffect(() => {
    if (!requisition) return
    setAmount((prev) => prev || String(requisition.amount))
    setDescription((prev) => prev || requisition.justification)
    setCoaId((prev) => prev || requisition.coaId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requisitionId])

  const heads = kind === "income" ? incomeHeads : expenseHeads

  const post = async () => {
    setError(null)
    setFieldErrors({})
    const value = parseAmount(amount)
    if (!date) return setError("Pick the entry's effective date.")
    if (kind === "expense" && !requisitionId)
      return setError(
        requisitions.length === 0
          ? "A church expense must be posted against an approved requisition, and none are awaiting payment. Raise and approve one first."
          : "Select the approved requisition this payment is for."
      )
    if (!coaId) return setError(kind === "income" ? "Choose the income stream this belongs to." : "Choose the expense account.")
    if (!(value > 0)) return setError("Enter an amount greater than zero.")
    if (kind === "expense" && !payee.trim()) return setError("Enter the payee / vendor.")
    if (kind === "income" && !payee.trim()) return setError(collection === "service" ? "Enter which service this collection came from." : "Enter who the money was received from.")
    if (kind === "expense" && requisition && value > requisition.amount) return setError(`The amount may not exceed the requisition's approved ${ngn(requisition.amount)}.`)
    if (!file) return setError(kind === "expense" ? "Attach the payment receipt — entries can't be posted without one." : collection === "service" ? "Attach a photo of the signed counting form." : "Attach the receipt or cheque for this collection.")

    setSaving(true)
    try {
      await createLedgerEntry({
        entryType: kind,
        transactionDate: date,
        chartOfAccountId: coaId,
        amount: value,
        receipt: file,
        paymentMethod: method,
        ...(kind === "expense" ? { payee: payee.trim(), requisitionId } : {}),
        ...(bankAccountId && method !== "cash" ? { bankAccountId } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(kind === "income" ? { notes: `${collection === "service" ? "Service collection" : "Office collection"} — ${payee.trim()}` } : {}),
      })
      pushToast(kind === "expense" ? "Expense posted — awaiting the bank debit." : "Income posted — awaiting the bank deposit.", "success")
      onPosted?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post the entry.")
      const detail = (err as { errors?: Record<string, string[]> }).errors
      if (detail) setFieldErrors(Object.fromEntries(Object.entries(detail).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])))
    } finally {
      setSaving(false)
    }
  }

  const fieldError = (name: string) => (fieldErrors[name] ? <p className="mt-1 text-[11px] font-medium text-rose-600">{fieldErrors[name]}</p> : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <Header title="NEW ENTRY" onClose={onClose} dark />
      <div className="px-6 py-3 border-b border-[#EEF1F6] flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-bold text-[#6B7280]">Transaction Type:</span>
        <div className="inline-flex rounded-[8px] bg-[#EEF1F6] p-1">
          <button type="button" onClick={() => { setKind("expense"); setCoaId("") }} className={`h-8 px-3 rounded-[6px] text-[11.5px] font-bold inline-flex items-center gap-1.5 ${kind === "expense" ? "bg-[#0F172A] text-white" : "text-[#6B7280]"}`}><ArrowUpFromLine className="h-3.5 w-3.5" />Expense Entry</button>
          <button type="button" onClick={() => { setKind("income"); setCoaId("") }} className={`h-8 px-3 rounded-[6px] text-[11.5px] font-bold inline-flex items-center gap-1.5 ${kind === "income" ? "bg-[#0F172A] text-white" : "text-[#6B7280]"}`}><ArrowDownToLine className="h-3.5 w-3.5" />Income Entry</button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4 max-h-[62vh] overflow-y-auto">
        {kind === "income" && (
          <div>
            <div className={labelCls}>How was this collected? <span className="text-rose-500">*</span></div>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COLLECTIONS.map((c) => (
                <button key={c.value} type="button" onClick={() => setCollection(c.value)} className={`text-left rounded-[8px] border p-3 transition-colors ${collection === c.value ? "border-rose-500 bg-rose-50" : "border-[#E5E7EB] bg-white hover:border-[#CBD5E1]"}`}>
                  <div className="flex items-center gap-2"><span className={`h-3.5 w-3.5 rounded-full border-2 ${collection === c.value ? "border-rose-500 bg-rose-500" : "border-[#CBD5E1]"}`} /><span className="text-[12.5px] font-bold text-[#111827]">{c.label}</span></div>
                  <div className="text-[11px] text-[#6B7280] mt-1 leading-snug">{c.hint}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {kind === "expense" && (
          <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
            <TriangleAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div><div className="text-[12px] font-bold text-[#111827]">Fiduciary validation enforces audit compliance</div><div className="text-[11.5px] text-[#6B7280] mt-0.5">An expense cannot be posted without an approved requisition and a proof-of-payment receipt. Posting settles the requisition.</div></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-4">
          <div>
            <div className={labelCls}>Entry effective date <span className="text-rose-500">*</span></div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-1.5`} />
            {fieldError("transactionDate")}
          </div>
          {kind === "expense" ? (
            <div>
              <div className="flex items-center justify-between gap-2"><span className={labelCls}>Requisition <span className="text-rose-500">*</span></span><span className="text-[10px] text-[#9CA3AF] truncate">(Approved, not yet posted)</span></div>
              <div className="relative mt-1.5">
                <select value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                  <option value="">{loadingLists ? "Loading requisitions…" : requisitions.length === 0 ? "No approved requisitions awaiting payment" : "Select requisition…"}</option>
                  {requisitions.map((r) => <option key={r.id} value={r.id}>{r.requisitionNumber} — {ngn(r.amount)} — {r.justification || "Requisition"}{r.requestedBy ? ` (${r.requestedBy})` : ""}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
              {fieldError("requisitionId")}
            </div>
          ) : (
            <div>
              <div className={labelCls}>{collection === "service" ? "Service" : "Received from"} <span className="text-rose-500">*</span></div>
              <div className="relative mt-1.5"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" /><input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder={collection === "service" ? "e.g. Sunday 1st Service" : "e.g. Bro. Chidi Okafor — tithe"} className={`${inputCls} pl-9`} /></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-4">
          <div>
            <div className={labelCls}>{kind === "income" ? "Income stream (credit account)" : "Expense account (debit account)"} <span className="text-rose-500">*</span></div>
            <div className="relative mt-1.5">
              <select value={coaId} onChange={(e) => setCoaId(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                <option value="">{loadingLists ? "Loading accounts…" : heads.length === 0 ? `No ${kind} accounts in the chart of accounts` : "Select account…"}</option>
                {heads.map((h) => <option key={h.id} value={h.id}>{h.name}{h.code ? ` (GL ${h.code})` : ""}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
            </div>
            {fieldError("chartOfAccountId")}
          </div>
          <div>
            <div className="flex items-center justify-between"><span className={labelCls}>Gross amount <span className="text-rose-500">*</span></span>{requisition && <span className={`${mono} text-[10px] font-bold text-rose-600`}>Max {ngn(requisition.amount)}</span>}</div>
            <div className="relative mt-1.5"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] font-bold">₦</span><AmountInput value={amount} onValueChange={setAmount} className={`${inputCls} pl-8 text-right ${mono} text-[15px] font-extrabold`} placeholder="0.00" /></div>
            {fieldError("amount")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kind === "expense" && (
            <div>
              <div className={labelCls}>Payee / beneficiary vendor <span className="text-rose-500">*</span></div>
              <div className="relative mt-1.5"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" /><input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="e.g. Grace Building Supplies" className={`${inputCls} pl-9`} /></div>
              {fieldError("payee")}
            </div>
          )}
          <div className={kind === "income" ? "md:col-span-2" : ""}>
            <div className={labelCls}>{kind === "expense" ? "Disbursement method & credit account" : "Deposit method & receiving account"}</div>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={`${inputCls} appearance-none pr-9`}>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
              <div className="relative">
                <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} disabled={method === "cash"} className={`${inputCls} appearance-none pr-9`}>
                  <option value="">{method === "cash" ? "Cash — banked later" : accounts.length === 0 ? "No bank accounts yet" : "Branch default account"}</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.bankName} — {a.accountName}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
            {fieldError("bankAccountId")}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between"><span className={labelCls}>Auditable transaction description</span><span className="text-[10px] text-[#9CA3AF]">Built automatically if left blank</span></div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 250))} rows={3} placeholder={kind === "expense" ? "Payment for church auditorium roof repairs (Vestry & Altar ceiling leak reinforcement)" : collection === "service" ? "Sunday 1st service tithes & offerings — counting batch 01" : "Tithe received at the church office, in cash"} className="mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-3 text-[12.5px] text-[#111827] outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className={labelCls}>{kind === "expense" ? "Upload payment receipt" : collection === "service" ? "Upload the counting form" : "Upload the receipt or cheque"} <span className="text-rose-500">*</span></span>
            <span className="text-[10px] text-[#9CA3AF]">PDF, JPG or PNG, up to 10MB</span>
          </div>
          <div className="mt-1.5"><DropZone file={file} onFile={setFile} onClear={() => setFile(null)} hint={kind === "expense" ? "Upload the receipt stamped paid" : collection === "service" ? "Photograph the signed counting form" : "Upload the receipt or cheque"} /></div>
          {fieldError("receipt")}
        </div>

        {error && <p className="text-[12px] font-medium text-rose-600">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button onClick={onClose} className="text-[12px] font-bold text-[#4B5563]">Cancel</button>
        <button onClick={post} disabled={saving} className="h-9 rounded-[6px] bg-rose-600 px-4 text-[12px] font-bold text-white hover:bg-rose-700 disabled:opacity-60">{saving ? "Posting…" : "Post Entry to Ledger"}</button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Allocate Now — an inflow with no entry behind it goes to an income stream.
// ---------------------------------------------------------------------------

export function AllocateModal({ open, onClose, line, onAllocated }: { open: boolean; onClose: () => void; line: StatementLine | null; onAllocated?: () => void }) {
  const { pushToast } = useToast()
  const { branchId } = useBranchContext()
  const [heads, setHeads] = useState<AccountHead[]>([])
  const [coaId, setCoaId] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !line) return
    setCoaId(line.coaId)
    setNotes("")
    setError(null)
    setLoading(true)
    loadAccountHeads(branchId, "income")
      .then(setHeads)
      .catch(() => setHeads([]))
      .finally(() => setLoading(false))
  }, [open, line, branchId])

  const save = async () => {
    if (!line) return
    if (!coaId) return setError("Choose the income stream this belongs to.")
    setSaving(true)
    setError(null)
    try {
      await allocateStatementLine(line.id, coaId, notes.trim() || undefined)
      pushToast(`Allocated to ${heads.find((h) => h.id === coaId)?.name ?? "the stream"} — the line is reconciled.`, "success")
      onAllocated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to allocate.")
    } finally {
      setSaving(false)
    }
  }

  if (!line) return null
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      <Header title="ALLOCATE NOW" subtitle="Categorise this bank inflow" onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        <div className="rounded-[8px] bg-[#F8FAFC] border border-[#EEF1F6] p-4">
          <div className="flex items-center justify-between gap-3"><span className={`${mono} text-[11px] font-bold text-rose-600`}>{line.reference || "Statement line"}</span><span className="text-[11px] text-[#6B7280]">{longDate(line.date)}</span></div>
          <div className="text-[13px] font-bold text-[#111827] mt-2">{line.description || "Bank statement line"}</div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">{line.bankName} {line.accountNumber}</div>
          <div className={`${mono} text-[16px] font-extrabold mt-1 ${line.transactionType === "credit" ? "text-emerald-600" : "text-rose-600"}`}>{line.transactionType === "credit" ? "+" : "-"}{ngn(line.amount, { decimals: true })}</div>
        </div>
        {line.transactionType !== "credit" && (
          <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11.5px] text-amber-800">Only inflows can be allocated. Match this outflow to the expense entries behind it instead.</div>
        )}
        <div>
          <div className={labelCls}>Income stream <span className="text-rose-500">*</span></div>
          <div className="relative mt-1.5">
            <select value={coaId} onChange={(e) => setCoaId(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
              <option value="">{loading ? "Loading…" : heads.length === 0 ? "No income accounts found" : "Select stream…"}</option>
              {heads.map((h) => <option key={h.id} value={h.id}>{h.name}{h.code ? ` (GL ${h.code})` : ""}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
        <div>
          <div className={labelCls}>Notes</div>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Online tithe — J. Doe" className={`${inputCls} mt-1.5`} />
        </div>
        {error && <p className="text-[12px] font-medium text-rose-600">{error}</p>}
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#EEF1F6]">
        <button onClick={onClose} className="h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-[12px] font-bold text-[#4B5563]">Cancel</button>
        <button onClick={save} disabled={saving || line.transactionType !== "credit"} className="h-9 rounded-[6px] bg-rose-600 px-4 text-[12px] font-bold text-white hover:bg-rose-700 disabled:opacity-60">{saving ? "Allocating…" : "Allocate"}</button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Bank pay-in matching — tie a statement line to the entries behind it.
// ---------------------------------------------------------------------------

export function MatchModal({
  open,
  onClose,
  line,
  onReconciled,
}: {
  open: boolean
  onClose: () => void
  line: StatementLine | null
  onReconciled?: () => void
}) {
  const { pushToast } = useToast()
  const [candidates, setCandidates] = useState<MatchCandidate[]>([])
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [cashOnly, setCashOnly] = useState(true)
  const [windowDays, setWindowDays] = useState(30)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [undoing, setUndoing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reconciled = line?.displayStatus === "reconciled"

  useEffect(() => {
    if (!open || !line || reconciled) return
    let active = true
    setLoading(true)
    setError(null)
    setNotes("")
    loadMatchCandidates(line.id, { ...(cashOnly ? { paymentMethod: "cash" } : {}), windowDays })
      .then((res) => {
        if (!active) return
        setCandidates(res.candidates)
        // The single exact-amount entry, when there is exactly one, is pre-ticked.
        setPicked(new Set(res.suggestedEntryIds))
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load matching entries.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, line, cashOnly, windowDays, reconciled])

  const selectedTotal = useMemo(
    () => candidates.filter((c) => picked.has(c.entry.id)).reduce((s, c) => s + c.entry.amount, 0),
    [candidates, picked]
  )
  const lineAmount = line?.amount ?? 0
  // Reconcile only when the ticked entries add up to the line, to the kobo.
  const balanced = Math.abs(selectedTotal - lineAmount) < 0.005 && picked.size > 0
  const difference = selectedTotal - lineAmount

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const confirm = async () => {
    if (!line || !balanced) return
    setSaving(true)
    setError(null)
    try {
      await matchStatementLine(line.id, [...picked], notes.trim() || undefined)
      pushToast(`${picked.size} ${picked.size === 1 ? "entry" : "entries"} reconciled against this deposit.`, "success")
      onReconciled?.()
      onClose()
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 409) {
        pushToast("Someone reconciled this line first — the list has been refreshed.", "info")
        onReconciled?.()
        onClose()
        return
      }
      setError(err instanceof Error ? err.message : "Unable to reconcile.")
    } finally {
      setSaving(false)
    }
  }

  const undo = async () => {
    if (!line) return
    setUndoing(true)
    setError(null)
    try {
      await unmatchStatementLine(line.id)
      pushToast("Match reversed — the line and its entries are unreconciled again.", "success")
      onReconciled?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to undo the match.")
    } finally {
      setUndoing(false)
    }
  }

  if (!line) return null
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <Header title="BANK PAY-IN MATCHING" subtitle="Tie this bank line to the entries that explain it" onClose={onClose} />

      <div className="px-6 py-4 border-b border-[#EEF1F6] bg-[#F8FAFC]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><span className={`${mono} text-[11px] font-bold text-rose-600`}>{line.reference || "Statement line"}</span><span className="text-[11px] text-[#6B7280]">{longDate(line.date)}</span></div>
            <div className="text-[13px] font-bold text-[#111827] mt-1 truncate">{line.description}</div>
            <div className="text-[11px] text-[#6B7280]">{line.bankName} {line.accountNumber}</div>
          </div>
          <div className="text-right"><div className={labelCls}>Statement amount</div><div className={`${mono} text-[20px] font-extrabold ${line.transactionType === "credit" ? "text-emerald-600" : "text-rose-600"}`}>{line.transactionType === "credit" ? "+" : "-"}{ngn(line.amount, { decimals: true })}</div></div>
        </div>
      </div>

      {reconciled ? (
        <div className="px-6 py-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-emerald-50 text-emerald-700 px-3 py-1.5 text-[12px] font-bold"><CheckCircle2 className="h-4 w-4" />This line is reconciled{line.reconciliationMethod ? ` (${line.reconciliationMethod})` : ""}</span>
          <p className="text-[12px] text-[#6B7280] mt-3">{line.matchedEntryIds.length > 0 ? `${line.matchedEntryIds.length} ledger ${line.matchedEntryIds.length === 1 ? "entry is" : "entries are"} tied to it.` : "It was allocated straight to a stream."}</p>
          {error && <p className="mt-3 text-[12px] font-medium text-rose-600">{error}</p>}
        </div>
      ) : (
        <>
          <div className="px-6 py-3 flex flex-wrap items-center gap-3 border-b border-[#EEF1F6]">
            <label className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-[#374151]">
              <input type="checkbox" checked={cashOnly} onChange={(e) => setCashOnly(e.target.checked)} className="h-3.5 w-3.5 accent-rose-600" />
              Cash pay-ins only
            </label>
            <label className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-[#374151]">
              Within
              <select value={windowDays} onChange={(e) => setWindowDays(Number(e.target.value))} className="h-7 rounded-[6px] border border-[#E5E7EB] bg-white px-2 text-[11.5px]">
                {[7, 14, 30, 60, 90].map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </label>
            <span className="ml-auto text-[11px] text-[#6B7280]">{candidates.length} candidate {candidates.length === 1 ? "entry" : "entries"}</span>
          </div>

          <div className="px-6 py-4 max-h-[42vh] overflow-y-auto">
            {loading && <div className="py-8 text-center text-[12px] text-[#9CA3AF]">Loading matching entries…</div>}
            {!loading && candidates.length === 0 && (
              <div className="py-8 text-center text-[12px] text-[#9CA3AF]">No unreconciled entries fit this line. Widen the date range, untick &quot;cash pay-ins only&quot;, or allocate the line to a stream instead.</div>
            )}
            <ul className="space-y-2">
              {candidates.map((c) => {
                const on = picked.has(c.entry.id)
                return (
                  <li key={c.entry.id}>
                    <button type="button" onClick={() => toggle(c.entry.id)} className={`w-full text-left rounded-[8px] border p-3 transition-colors ${on ? "border-rose-500 bg-rose-50" : "border-[#E5E7EB] bg-white hover:border-[#CBD5E1]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className={`mt-0.5 h-4 w-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 ${on ? "border-rose-500 bg-rose-500" : "border-[#CBD5E1]"}`}>{on && <CheckCircle2 className="h-3 w-3 text-white" />}</span>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-bold text-[#111827] truncate">{c.entry.description || c.entry.payee || "Ledger entry"}</div>
                            <div className="text-[10.5px] text-[#6B7280] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className={mono}>{entryRef(c.entry)}</span>
                              <span>{shortDate(c.entry.date)}</span>
                              {c.entry.coaName && <span className="text-rose-600 font-semibold">{c.entry.coaName}</span>}
                              {c.entry.paymentMethod && <span className="uppercase">{c.entry.paymentMethod}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`${mono} text-[13px] font-extrabold text-[#111827]`}>{ngn(c.entry.amount, { decimals: true })}</div>
                          <div className="text-[10px] mt-0.5">
                            {c.exactAmount ? <span className="font-bold uppercase text-emerald-600">Exact amount</span> : <span className="text-[#9CA3AF]">{ngn(Math.abs(c.amountDifference))} apart</span>}
                            {c.daysApart > 0 && <span className="text-[#9CA3AF]"> · {c.daysApart}d</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="px-6 py-3 border-t border-[#EEF1F6] bg-[#F8FAFC]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={labelCls}>Selected total</span>
              <div className="text-right">
                <span className={`${mono} text-[15px] font-extrabold ${balanced ? "text-emerald-600" : "text-[#111827]"}`}>{ngn(selectedTotal, { decimals: true })}</span>
                <span className="text-[11px] text-[#6B7280]"> of {ngn(lineAmount, { decimals: true })}</span>
              </div>
            </div>
            {!balanced && picked.size > 0 && (
              <p className={`mt-1 text-[11px] font-semibold ${difference > 0 ? "text-rose-600" : "text-amber-600"}`}>{difference > 0 ? `${ngn(difference, { decimals: true })} over the statement amount` : `${ngn(Math.abs(difference), { decimals: true })} still to account for`}</p>
            )}
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes, e.g. Sunday services, banked Monday" className={`${inputCls} mt-2 h-9 text-[12px]`} />
            {error && <p className="mt-2 text-[12px] font-medium text-rose-600">{error}</p>}
          </div>
        </>
      )}

      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button onClick={onClose} className="h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-[12px] font-bold text-[#4B5563]">Close</button>
        {reconciled ? (
          <button onClick={undo} disabled={undoing} className="h-9 rounded-[6px] border border-rose-200 bg-white px-4 text-[12px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60">{undoing ? "Reversing…" : "Undo Match"}</button>
        ) : (
          <button onClick={confirm} disabled={!balanced || saving} title={balanced ? "" : "The ticked entries must add up to the statement amount"} className="h-9 rounded-[6px] bg-rose-600 px-4 text-[12px] font-bold text-white hover:bg-rose-700 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed">{saving ? "Reconciling…" : "Reconcile"}</button>
        )}
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Statement import — POST /reconciliation/statements/import.
// ---------------------------------------------------------------------------

export function StatementImportModal({
  open,
  onClose,
  accounts,
  onImported,
}: {
  open: boolean
  onClose: () => void
  accounts: BankAccountRow[]
  onImported?: () => void
}) {
  const { pushToast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [bankAccountId, setBankAccountId] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ imported: number; duplicates: number; skipped: number; errors: { row: number; reason: string }[] } | null>(null)

  useEffect(() => {
    if (!open) return
    setFile(null)
    setBankAccountId(accounts[0]?.id ?? "")
    setBusy(false)
    setError(null)
    setResult(null)
  }, [open, accounts])

  const run = async () => {
    setError(null)
    if (!bankAccountId) return setError("Choose the account this statement belongs to.")
    if (!file) return setError("Choose the statement CSV to import.")
    setBusy(true)
    try {
      const res = await importStatement(file, bankAccountId)
      setResult(res)
      pushToast(`${res.imported} imported · ${res.duplicates} already there${res.skipped ? ` · ${res.skipped} skipped` : ""}`, res.imported > 0 ? "success" : "info")
      onImported?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import the statement.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      <Header title="UPLOAD BANK STATEMENT" subtitle="CSV import · duplicates are skipped" onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        <div>
          <div className={labelCls}>Target account <span className="text-rose-500">*</span></div>
          <div className="relative mt-1.5">
            <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
              <option value="">{accounts.length === 0 ? "No bank accounts yet — add one first" : "Select account…"}</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.bankName} — {a.accountName} ({a.accountNumber})</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between"><span className={labelCls}>Statement file <span className="text-rose-500">*</span></span><span className="text-[10px] text-[#9CA3AF]">CSV, up to 10MB</span></div>
          <div className="mt-1.5"><DropZone file={file} onFile={setFile} onClear={() => setFile(null)} hint="Upload the bank statement CSV" accept=".csv" /></div>
          <p className="mt-2 text-[10.5px] text-[#9CA3AF]">Columns are matched loosely: Date / Value Date, Narration / Description, Reference, and either Credit + Debit or Amount + Type (CR/DR).</p>
        </div>

        {result && (
          <div className="rounded-[8px] border border-[#EEF1F6] bg-[#F8FAFC] p-4">
            <div className="flex flex-wrap gap-4 text-[12px]">
              <span><span className={`${mono} font-extrabold text-emerald-600`}>{result.imported}</span> imported</span>
              <span><span className={`${mono} font-extrabold text-[#6B7280]`}>{result.duplicates}</span> already there</span>
              <span><span className={`${mono} font-extrabold text-amber-600`}>{result.skipped}</span> skipped</span>
            </div>
            {result.errors.length > 0 && (
              <ul className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => <li key={`${e.row}-${i}`} className="text-[11px] text-rose-600">Row {e.row}: {e.reason}</li>)}
              </ul>
            )}
          </div>
        )}

        {error && <p className="text-[12px] font-medium text-rose-600">{error}</p>}
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#EEF1F6]">
        <button onClick={onClose} className="h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-[12px] font-bold text-[#4B5563]">{result ? "Done" : "Cancel"}</button>
        <button onClick={run} disabled={busy} className="h-9 rounded-[6px] bg-rose-600 px-4 text-[12px] font-bold text-white hover:bg-rose-700 disabled:opacity-60">{busy ? "Importing…" : result ? "Import another" : "Import Statement"}</button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------

export function useLedgerAccounts(branchId: string, refreshKey = 0) {
  const [accounts, setAccounts] = useState<BankAccountRow[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    let active = true
    setLoading(true)
    loadBankAccounts(branchId)
      .then((a) => {
        if (active) setAccounts(a)
      })
      .catch(() => {
        if (active) setAccounts([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [branchId, refreshKey])
  return { accounts, loading }
}
