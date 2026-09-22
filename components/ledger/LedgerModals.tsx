"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  Calendar,
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
import { loadBudgetLineOptions, type BudgetLineOption } from "@/lib/budget-threads"
import {
  allocateEntry,
  createEntry,
  entryRef,
  loadAccountHeads,
  loadBankAccounts,
  longDate,
  MOCK_SAFE,
  ngn,
  updateEntry,
  uploadDocument,
  verifyEntry,
  type AccountHead,
  type BankAccountRow,
  type LedgerEntry,
} from "@/lib/ledger"
import { API_V1 } from "@/lib/api"
import { describeApiError } from "@/lib/api-error"
import { getCsrfTokenFromCookie } from "@/lib/csrf"

const mono = "font-mono tracking-tight"
const inputCls =
  "w-full h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]/20 disabled:bg-[#F9FAFB] disabled:text-[#6B7280]"
const labelCls = "text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#6B7280]"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#111827] mt-6 mb-2.5">{children}</h4>
}

function Header({ title, subtitle, onClose, dark }: { title: React.ReactNode; subtitle?: string; onClose: () => void; dark?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-6 py-4 rounded-t-[12px] ${dark ? "bg-[#0F172A] text-white" : "bg-[#F1F5FF] border-b border-[#E0E7FF]"}`}>
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
          <span className="h-7 w-7 rounded-[6px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">{icon}</span>
        ) : null}
      </div>
      <div className={`mt-3 text-[22px] sm:text-[26px] font-extrabold tracking-tight ${dark ? "text-white" : "text-[#111827]"}`}>{value}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cash safe / journal voucher view. Sample data until the safe API exists;
// a real entry, when given, supplies the amount, date and heading.
// ---------------------------------------------------------------------------

export function SafeBatchModal({
  open,
  onClose,
  mode,
  branchName,
  entry,
}: {
  open: boolean
  onClose: () => void
  /** `safe`: what is locked in the safe. `journal`: the voucher after the bank run. */
  mode: "safe" | "journal"
  branchName?: string
  entry?: LedgerEntry | null
}) {
  const safe = MOCK_SAFE
  const total = entry ? entry.amount : safe.total
  const reconciled = mode === "journal"
  const teller = entry?.meta?.teller as { slipName?: string; slipUrl?: string } | undefined
  const funds = entry
    ? [{ name: entry.coaName || entry.description || "Fund", gl: entry.coaCode || "—", counted: entry.amount, remaining: entry.amount }]
    : safe.funds
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <Header
        title={
          reconciled ? (
            <span className={mono}>{entry ? entryRef(entry) : safe.journal.ref}</span>
          ) : (
            <span className="flex items-center gap-2"><span className="h-5 w-1.5 rounded-full bg-[#10B981]" />CASH SAFE BALANCE{branchName ? ` — ${branchName}` : ""}</span>
          )
        }
        onClose={onClose}
      />
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <Stat label="Total cash safe physical balance" value={ngn(total, { decimals: true })} tag={reconciled ? "Reconciled" : "Pending bank run"} dark />
          <Stat label="Physical cash" value={ngn(entry ? total : safe.physicalCash, { decimals: true })} icon={<Landmark className="h-3.5 w-3.5" />} />
          <Stat label="Cheques in safe" value={ngn(entry ? 0 : safe.cheques, { decimals: true })} icon={<FileText className="h-3.5 w-3.5" />} />
        </div>

        <SectionTitle>Section 1: Safe ledger — locked batches</SectionTitle>
        <div className="rounded-[8px] overflow-hidden border border-[#EEF1F6]">
          <table className="w-full text-[12px]">
            <thead className="bg-[#EEF2FF] text-[#3B5BDB]">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wide">
                <th className="px-3 py-2.5">Batch ref</th>
                <th className="px-3 py-2.5">Service date</th>
                <th className="px-3 py-2.5">Service type</th>
                <th className="px-3 py-2.5 text-right">Total counted</th>
                <th className="px-3 py-2.5">Status</th>
                {!reconciled && <th className="px-3 py-2.5" />}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-3 py-3"><span className={`${mono} rounded-[4px] bg-[#EEF2FF] text-[#3B5BDB] px-1.5 py-0.5 text-[11px] font-bold`}>{entry ? entryRef(entry) : safe.batch.ref}</span></td>
                <td className="px-3 py-3 text-[#374151] font-medium whitespace-nowrap"><Calendar className="inline h-3.5 w-3.5 mr-1 text-[#9CA3AF]" />{longDate(entry?.date ?? safe.batch.serviceDate)}</td>
                <td className="px-3 py-3 text-[#374151] font-medium">{entry ? entry.description || "Service collection" : safe.batch.serviceType}</td>
                <td className={`px-3 py-3 text-right font-bold text-[#111827] ${mono}`}>{ngn(total, { decimals: true })}</td>
                <td className="px-3 py-3">
                  {reconciled ? (
                    <span className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 text-emerald-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide"><CheckCircle2 className="h-3 w-3" />Reconciled</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-[4px] bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{safe.batch.status}</span>
                  )}
                </td>
                {!reconciled && (
                  <td className="px-3 py-3 text-right"><span className="inline-flex rounded-[6px] bg-[#3B5BDB] text-white px-3 py-1.5 text-[11px] font-bold">Cash debited</span></td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        <SectionTitle>Section 2: Fund breakdown — batch {entry ? entryRef(entry) : safe.batch.ref}</SectionTitle>
        <div className="rounded-[8px] overflow-hidden border border-[#EEF1F6]">
          <table className="w-full text-[12px]">
            <thead className="bg-[#EEF2FF] text-[#3B5BDB]">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wide">
                <th className="px-3 py-2.5">Fund / GL account specification</th>
                <th className="px-3 py-2.5 text-right">Counted</th>
                <th className="px-3 py-2.5 text-right">Remaining in safe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {funds.map((f) => (
                <tr key={f.name} className="bg-white">
                  <td className="px-3 py-3"><div className="font-bold text-[#111827]">{f.name}</div><div className={`${mono} text-[10.5px] text-[#6B7280]`}>GL {f.gl}</div></td>
                  <td className={`px-3 py-3 text-right font-semibold text-[#111827] ${mono}`}>{ngn(f.counted, { decimals: true })}</td>
                  <td className={`px-3 py-3 text-right font-bold text-[#111827] ${mono}`}>{ngn(reconciled ? 0 : f.remaining, { decimals: true })}</td>
                </tr>
              ))}
              <tr className="bg-[#F8FAFC]">
                <td className="px-3 py-3 font-extrabold text-[#111827]">TOTAL LOCKED BALANCE:</td>
                <td className={`px-3 py-3 text-right font-extrabold text-[#111827] ${mono}`}>{ngn(total, { decimals: true })}</td>
                <td className={`px-3 py-3 text-right font-extrabold text-[#10B981] ${mono}`}>{ngn(reconciled ? 0 : total, { decimals: true })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <SectionTitle>Section 3: Signatories &amp; lock document</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {safe.signatories.map((s) => (
            <div key={s.name} className="rounded-[8px] border border-[#EEF1F6] bg-[#F8FAFC] p-3.5">
              <div className="text-[13px] font-bold text-[#111827]">{s.name}</div>
              <div className="text-[11px] text-[#6B7280] mt-0.5">{s.role}</div>
            </div>
          ))}
          <div className="rounded-[8px] border border-[#EEF1F6] bg-white p-3.5 flex items-center justify-between gap-2">
            <div className={`${mono} text-[11px] text-[#6B7280] truncate`}>{safe.lockDocument}</div>
            <span className="text-[10px] font-bold uppercase text-[#3B5BDB] underline">View</span>
          </div>
        </div>

        {reconciled && (
          <>
            <SectionTitle>Section 4: Bank teller</SectionTitle>
            <div className="rounded-[8px] border border-[#EEF1F6] bg-white p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="text-[12.5px] font-semibold text-[#111827] truncate">{teller?.slipName ?? safe.journal.teller}</span>
              </div>
              {teller?.slipUrl ? (
                <a href={teller.slipUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase text-[#3B5BDB] underline">View</a>
              ) : (
                <span className="text-[10px] font-bold uppercase text-[#3B5BDB] underline">View</span>
              )}
            </div>
          </>
        )}

        {!entry && (
          <p className="mt-5 text-[11px] text-[#9CA3AF] flex items-center gap-1.5"><TriangleAlert className="h-3.5 w-3.5" />Sample figures — the counting-room safe has no API yet.</p>
        )}
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Bank balance: the branch's accounts (real) and the latest batch (sample).
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
  const latestFor = (id: string) => entries.find((e) => e.bankAccountId === id && e.status === "verified") ?? null
  const debits = (id: string) => entries.filter((e) => e.bankAccountId === id && e.type === "expense" && e.status === "verified").reduce((s, e) => s + e.amount, 0)
  const credits = (id: string) => entries.filter((e) => e.bankAccountId === id && e.type === "income" && e.status === "verified").reduce((s, e) => s + e.amount, 0)
  const tone = ["bg-[#10B981]", "bg-[#0F172A]", "bg-[#F59E0B]", "bg-[#EF4444]", "bg-[#3B5BDB]"]
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <Header title={<span className="flex items-center gap-2"><span className="h-5 w-1.5 rounded-full bg-[#10B981]" />BANK BALANCE{branchName ? ` — ${branchName}` : ""}</span>} onClose={onClose} />
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="sm:col-span-2"><Stat label="Total consolidated position" value={ngn(total, { decimals: true })} dark /></div>
          <div className="rounded-[10px] bg-[#F8FAFC] border border-[#EEF1F6] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Operating accounts</div><Landmark className="h-4 w-4 text-[#10B981]" /></div>
            <div><div className="text-[24px] font-extrabold text-[#111827]">{accounts.length}</div><div className="text-[10.5px] text-[#6B7280]">Accounts</div></div>
            <button onClick={onAddAccount} className="mt-2 h-8 rounded-[6px] bg-[#3B5BDB] text-white text-[11px] font-bold">+ Add Account</button>
          </div>
        </div>

        <SectionTitle>Branch bank balance</SectionTitle>
        <div className="rounded-[8px] overflow-hidden border border-[#EEF1F6]">
          <table className="w-full text-[12px]">
            <thead className="bg-[#EEF2FF] text-[#3B5BDB]">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wide">
                <th className="px-3 py-2.5">Batch ref</th><th className="px-3 py-2.5">Service date</th><th className="px-3 py-2.5">Service type</th><th className="px-3 py-2.5 text-right">Total counted</th><th className="px-3 py-2.5">Status</th><th />
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-3 py-3"><span className={`${mono} rounded-[4px] bg-[#EEF2FF] text-[#3B5BDB] px-1.5 py-0.5 text-[11px] font-bold`}>{MOCK_SAFE.batch.ref}</span></td>
                <td className="px-3 py-3 text-[#374151] font-medium whitespace-nowrap">{longDate(MOCK_SAFE.batch.serviceDate)}</td>
                <td className="px-3 py-3 text-[#374151] font-medium">{MOCK_SAFE.batch.serviceType}</td>
                <td className={`px-3 py-3 text-right font-bold ${mono}`}>{ngn(MOCK_SAFE.batch.total, { decimals: true })}</td>
                <td className="px-3 py-3"><span className="inline-flex items-center gap-1 rounded-[4px] bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-bold uppercase"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />In safe (pending bank run)</span></td>
                <td className="px-3 py-3 text-right"><span className="inline-flex rounded-[6px] bg-[#3B5BDB] text-white px-3 py-1.5 text-[11px] font-bold">Cash debited</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <SectionTitle><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3B5BDB]" />Authorized branch ledgers</span></SectionTitle>
        <div className="rounded-[8px] overflow-hidden border border-[#EEF1F6]">
          <table className="w-full text-[12px]">
            <thead className="bg-[#F8FAFC] text-[#6B7280]">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wide">
                <th className="px-3 py-2.5">#</th><th className="px-3 py-2.5">Financial institution</th><th className="px-3 py-2.5">Acc no.</th><th className="px-3 py-2.5">Purpose</th><th className="px-3 py-2.5 text-right">Settled balance (NGN)</th><th className="px-3 py-2.5 text-right">Latest batch</th><th className="px-3 py-2.5">Timestamp</th><th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {accounts.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-[#6B7280]">No bank accounts yet. Add one to see its ledger here.</td></tr>
              )}
              {accounts.map((a, i) => {
                const latest = latestFor(a.id)
                const isOpen = expanded === a.id
                return (
                  <React.Fragment key={a.id}>
                    <tr className={`bg-white ${isOpen ? "bg-[#F0FDF4]/60" : ""}`}>
                      <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5"><span className={`h-4 w-1 rounded-full ${tone[i % tone.length]}`} />{String(i + 1).padStart(2, "0")}</span></td>
                      <td className="px-3 py-3 font-bold text-[#111827]">{a.bankName}</td>
                      <td className={`px-3 py-3 ${mono} text-[#374151]`}>{a.accountNumber}</td>
                      <td className="px-3 py-3"><span className={`${mono} rounded-[4px] bg-[#EEF2FF] text-[#3B5BDB] px-1.5 py-0.5 text-[10.5px] font-bold`}>{a.accountName}</span></td>
                      <td className={`px-3 py-3 text-right font-bold text-[#111827] ${mono}`}>{ngn(a.balance, { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} text-emerald-600 font-semibold`}>{latest ? `+${ngn(latest.amount, { decimals: true })}` : "—"}</td>
                      <td className="px-3 py-3 text-[#6B7280] whitespace-nowrap">{latest ? longDate(latest.date) : "—"}</td>
                      <td className="px-3 py-3 text-right"><button onClick={() => setExpanded(isOpen ? null : a.id)} className="h-7 w-7 rounded-full hover:bg-[#EEF2FF] text-[#6B7280] inline-flex items-center justify-center">{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button></td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-[#F0FDF4]/40">
                        <td colSpan={8} className="px-4 pb-4 pt-1">
                          <div className="rounded-[8px] border border-[#D1FAE5] bg-white p-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="text-[12px] font-bold text-[#111827]">{a.bankName} — {a.accountName} <span className={`${mono} text-[#6B7280] font-medium`}>({a.accountNumber})</span></div>
                              <div className="text-[10px] font-bold uppercase text-[#6B7280]">Current ledger balance: <span className={`${mono} text-[#111827]`}>{ngn(a.balance, { decimals: true })}</span></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                              <div><div className={labelCls}>Total debit</div><div className={`${mono} text-[13px] font-bold text-[#111827] mt-1`}>{ngn(debits(a.id), { decimals: true })}</div></div>
                              <div><div className={labelCls}>Total credit</div><div className={`${mono} text-[13px] font-bold text-[#111827] mt-1`}>{ngn(credits(a.id), { decimals: true })}</div></div>
                              <div><div className={labelCls}>Latest teller pay-in</div><div className={`${mono} text-[13px] font-bold text-emerald-600 mt-1`}>{latest ? `+${ngn(latest.amount, { decimals: true })}` : "—"}</div>{latest && <div className="text-[10px] text-[#6B7280]">{entryRef(latest)}</div>}</div>
                            </div>
                            <div className="mt-3 text-[10.5px] text-[#6B7280]">Statements uploaded for this account appear in Reports.</div>
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
// Record bank teller deposit: closes an income entry against a bank pay-in.
// Real: uploads the slip, stores the teller details, verifies the entry.
// ---------------------------------------------------------------------------

function DropZone({ file, onFile, onClear, hint }: { file: File | null; onFile: (f: File) => void; onClear: () => void; hint: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [drag, setDrag] = useState(false)
  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-9 w-9 rounded-[6px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center"><FileText className="h-4 w-4" /></span>
          <div className="min-w-0"><div className="text-[12.5px] font-bold text-[#111827] truncate">{file.name}</div><div className="text-[10.5px] text-[#6B7280]">{(file.size / 1024 / 1024).toFixed(1)} MB</div></div>
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
      className={`rounded-[10px] border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${drag ? "border-[#3B5BDB] bg-[#EEF2FF]" : "border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#C7D2FE]"}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = "" }} />
      <span className="mx-auto h-11 w-11 rounded-[8px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center"><CloudUpload className="h-5 w-5" /></span>
      <div className="mt-3 text-[13px] font-bold text-[#111827]">{hint}</div>
      <div className="text-[11px] text-[#6B7280] mt-1">Drag &amp; drop here, or click to browse. Accepted: JPG, PNG, PDF (max 5MB)</div>
      <span className="inline-flex mt-3 rounded-[6px] bg-[#EEF2FF] text-[#3B5BDB] px-3 py-1.5 text-[11px] font-bold">Browse System Files</span>
    </div>
  )
}

export function RecordTellerModal({
  open,
  onClose,
  entry,
  accounts,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  entry: LedgerEntry | null
  accounts: BankAccountRow[]
  onSaved?: () => void
}) {
  const { pushToast } = useToast()
  const { branchId } = useBranchContext()
  const [bankAccountId, setBankAccountId] = useState("")
  const [tellerDate, setTellerDate] = useState("")
  const [tellerRef, setTellerRef] = useState("")
  const [amount, setAmount] = useState("")
  const [tender, setTender] = useState<"cash" | "cheque" | "mixed">("cash")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState<"draft" | "post" | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !entry) return
    const teller = (entry.meta?.teller ?? {}) as Record<string, unknown>
    setBankAccountId(String(teller.bankAccountId ?? entry.bankAccountId ?? accounts[0]?.id ?? ""))
    setTellerDate(String(teller.date ?? new Date().toISOString().slice(0, 10)))
    setTellerRef(String(teller.ref ?? ""))
    setAmount(String(teller.amount ?? entry.amount))
    setTender((teller.tender as "cash" | "cheque" | "mixed") ?? "cash")
    setNotes(String(teller.notes ?? ""))
    setFile(null)
    setSaving(null)
    setError(null)
  }, [open, entry, accounts])

  const account = accounts.find((a) => a.id === bankAccountId)

  const save = async (post: boolean) => {
    if (!entry) return
    setError(null)
    const value = parseAmount(amount)
    if (!bankAccountId) return setError("Choose the bank account the money was paid into.")
    if (!tellerDate) return setError("Enter the teller date.")
    if (!tellerRef.trim()) return setError("Enter the teller / reference number from the slip.")
    if (!(value > 0)) return setError("Enter the amount deposited.")
    if (post && Math.abs(value - entry.amount) > 0.005) return setError(`The deposit (${ngn(value)}) must match the entry (${ngn(entry.amount)}) to close it. Save as draft if the bank run was partial.`)
    if (post && !file && !(entry.meta?.teller as { slipUrl?: string } | undefined)?.slipUrl) return setError("Attach the teller slip or deposit receipt.")
    setSaving(post ? "post" : "draft")
    try {
      let slip = (entry.meta?.teller as { slipUrl?: string; slipName?: string } | undefined) ?? {}
      if (file) {
        const up = await uploadDocument(file, "teller-slips", branchId)
        slip = { slipUrl: up.url, slipName: up.fileName }
      }
      await updateEntry(entry.id, {
        reference: tellerRef.trim(),
        meta: {
          teller: {
            bankAccountId,
            bankAccountName: account ? `${account.bankName} — ${account.accountName}` : "",
            date: tellerDate,
            ref: tellerRef.trim(),
            amount: value,
            tender,
            notes: notes.trim(),
            ...slip,
            status: post ? "attached" : "draft",
          },
        },
      })
      if (post) await verifyEntry(entry.id, { notes: notes.trim() || `Teller ${tellerRef.trim()} attached to ${entryRef(entry)}.` })
      pushToast(post ? `Teller ${tellerRef.trim()} attached — ${entryRef(entry)} is reconciled.` : "Teller details saved as draft.", "success")
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the teller.")
    } finally {
      setSaving(null)
    }
  }

  if (!entry) return null
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <Header title="RECORD BANK TELLER DEPOSIT" subtitle="Fiduciary custody transfer & bank slip attribution" onClose={onClose} />
      <div className="px-6 py-4 border-b border-[#EEF1F6] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className={`${inputCls} flex items-center justify-between ${mono}`}>{entryRef(entry)}<ChevronDown className="h-4 w-4 text-[#9CA3AF]" /></div>
        <div><div className={labelCls}>Safe batch origin</div><div className="text-[12.5px] font-bold text-[#111827] mt-0.5 truncate">{entry.description || "Service collection"} ({longDate(entry.date)})</div></div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 h-[42px] flex items-center justify-between"><span className={labelCls}>Batch balance:</span><span className={`${mono} text-[14px] font-extrabold text-[#3B5BDB]`}>{ngn(entry.amount, { decimals: true })}</span></div>
      </div>

      <div className="px-6 py-5">
        <h4 className="text-[13.5px] font-bold text-[#111827] mb-3">Teller &amp; Deposit Slip Details</h4>
        <div className="rounded-[10px] bg-[#F8FAFC] border border-[#EEF1F6] p-4 space-y-4">
          <div>
            <div className={labelCls}>Fund / GL category</div>
            <div className={`${inputCls} mt-1.5 flex items-center justify-between`}><span className="truncate">{entry.coaName || "Uncategorised"}{entry.coaCode ? ` (GL #${entry.coaCode})` : ""}</span><ChevronDown className="h-4 w-4 text-[#9CA3AF]" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-3">
            <div>
              <div className="flex items-center justify-between"><span className={labelCls}>Destination bank account</span>{entry.coaCode && <span className={`${mono} text-[10px] font-bold text-[#3B5BDB]`}>Ledger #{entry.coaCode}</span>}</div>
              <div className="relative mt-1.5">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3B5BDB]" />
                <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className={`${inputCls} pl-9 appearance-none`}>
                  <option value="">Select bank account…</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.bankName} — {a.accountName} (Acct: {a.accountNumber})</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between"><span className={labelCls}>Teller date</span><span className="text-[10px] text-[#9CA3AF]">≥ {longDate(entry.date)}</span></div>
              <input type="date" value={tellerDate} min={entry.date.slice(0, 10)} onChange={(e) => setTellerDate(e.target.value)} className={`${inputCls} mt-1.5`} />
            </div>
            <div>
              <div className={labelCls}>Teller / ref number</div>
              <input value={tellerRef} onChange={(e) => setTellerRef(e.target.value)} placeholder="e.g. 4912" className={`${inputCls} mt-1.5 ${mono}`} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between"><span className={labelCls}>Total deposit amount</span><span className={`${mono} text-[10px] font-bold text-[#3B5BDB]`}>Max avail: {ngn(entry.amount, { decimals: true })}</span></div>
              <div className="relative mt-1.5"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] font-bold">₦</span><AmountInput value={amount} onValueChange={setAmount} className={`${inputCls} pl-8 text-right ${mono} text-[15px] font-extrabold`} /></div>
              <div className="text-[10px] text-[#9CA3AF] mt-1">Physical funds extracted from safe batch {entryRef(entry)}</div>
            </div>
            <div>
              <div className={labelCls}>Tender / deposit type</div>
              <div className="mt-1.5 grid grid-cols-3 rounded-[8px] bg-[#EEF1F6] p-1">
                {(["cash", "cheque", "mixed"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTender(t)} className={`h-8 rounded-[6px] text-[11.5px] font-semibold capitalize inline-flex items-center justify-center gap-1.5 ${tender === t ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280]"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${tender === t ? "bg-[#10B981]" : "bg-[#CBD5E1]"}`} />{t}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-1">Denomination count verified at safe opening</div>
            </div>
          </div>
        </div>

        <h4 className="text-[13.5px] font-bold text-[#111827] mt-5 mb-3">Teller Slip Upload</h4>
        <DropZone file={file} onFile={setFile} onClear={() => setFile(null)} hint="Upload Teller Slip / Deposit Receipt" />
        {!file && (entry.meta?.teller as { slipName?: string } | undefined)?.slipName && (
          <div className="mt-2 text-[11px] text-[#6B7280]">A slip is already attached: <span className="font-semibold text-[#111827]">{(entry.meta?.teller as { slipName?: string }).slipName}</span>. Upload another to replace it.</div>
        )}

        <div className="mt-5 flex items-center justify-between"><h4 className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#111827]">4. Teller custody notes &amp; bank messenger remarks</h4><span className="text-[10px] font-bold uppercase text-[#9CA3AF]">Max 500 characters</span></div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))} rows={3} placeholder="e.g. Cash deposited by Trustee at the Ikeja branch on …" className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-3 text-[12.5px] text-[#111827] outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]/20" />

        {error && <p className="mt-3 text-[12px] font-medium text-rose-600">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#EEF1F6] bg-[#F8FAFC] rounded-b-[12px]">
        <button onClick={onClose} className="h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-[12px] font-bold text-[#4B5563]">Cancel</button>
        <div className="flex items-center gap-2">
          <button onClick={() => save(false)} disabled={saving !== null} className="h-9 rounded-[6px] bg-[#1E3A8A] px-4 text-[12px] font-bold text-white disabled:opacity-60">{saving === "draft" ? "Saving…" : "Save as Draft"}</button>
          <button onClick={() => save(true)} disabled={saving !== null} className="h-9 rounded-[6px] bg-[#0F172A] px-4 text-[12px] font-bold text-white disabled:opacity-60">{saving === "post" ? "Attaching…" : "Save Teller & Attach to Safe Batch"}</button>
        </div>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// New entry: an expense (against an approved requisition, with its receipt)
// or an income counted, posted to the ledger as a pending transaction.
// ---------------------------------------------------------------------------

type RequisitionOption = { id: string; reference: string; amount: number; purpose: string; approver: string; coaId: string; coaName: string }

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
  const [date, setDate] = useState("")
  const [requisitions, setRequisitions] = useState<RequisitionOption[]>([])
  const [requisitionId, setRequisitionId] = useState("")
  const [lines, setLines] = useState<BudgetLineOption[]>([])
  const [revenueHeads, setRevenueHeads] = useState<AccountHead[]>([])
  const [expenseHeads, setExpenseHeads] = useState<AccountHead[]>([])
  const [lineId, setLineId] = useState("")
  const [coaId, setCoaId] = useState("")
  const [amount, setAmount] = useState("")
  const [payee, setPayee] = useState("")
  const [method, setMethod] = useState("Bank Transfer")
  const [bankAccountId, setBankAccountId] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loadingLists, setLoadingLists] = useState(false)
  const [saving, setSaving] = useState<"draft" | "post" | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setKind("expense")
    setDate(new Date().toISOString().slice(0, 10))
    setRequisitionId("")
    setLineId("")
    setCoaId("")
    setAmount("")
    setPayee("")
    setMethod("Bank Transfer")
    setBankAccountId(accounts[0]?.id ?? "")
    setDescription("")
    setFile(null)
    setSaving(null)
    setError(null)
    if (!branchId) return
    let active = true
    setLoadingLists(true)
    const reqs = fetch(`${API_V1}/financial/requisitions?branchId=${encodeURIComponent(branchId)}&status=approved&limit=100`, { credentials: "include" })
      .then((r) => r.json().catch(() => null))
      .then((j) => {
        const list = Array.isArray(j?.data) ? j.data : Array.isArray(j?.data?.content) ? j.data.content : []
        return (list as Record<string, unknown>[]).map((r): RequisitionOption => {
          const coa = (r.budgetHeadId ?? r.chartOfAccountId) as Record<string, unknown> | string | undefined
          const approver = (r.approvedBy ?? r.directorApprovedBy ?? r.leadPastorApprovedBy) as Record<string, unknown> | undefined
          return {
            id: String(r._id ?? r.id ?? ""),
            reference: String(r.reference ?? r.requisitionNumber ?? `REQ-${String(r._id ?? "").slice(-6).toUpperCase()}`),
            amount: Number(r.amount ?? 0),
            purpose: String(r.justification ?? r.purpose ?? r.description ?? ""),
            approver: approver && typeof approver === "object" ? `${approver.firstName ?? ""} ${approver.lastName ?? ""}`.trim() : "",
            coaId: coa && typeof coa === "object" ? String((coa as { _id?: string })._id ?? "") : String(coa ?? ""),
            coaName: coa && typeof coa === "object" ? String((coa as { name?: string }).name ?? "") : "",
          }
        }).filter((r) => r.id)
      })
      .catch(() => [] as RequisitionOption[])
    Promise.all([reqs, loadBudgetLineOptions(branchId).catch(() => []), loadAccountHeads(branchId, "revenue").catch(() => []), loadAccountHeads(branchId, "expense").catch(() => [])])
      .then(([r, l, rev, exp]) => {
        if (!active) return
        setRequisitions(r)
        setLines(l)
        setRevenueHeads(rev)
        setExpenseHeads(exp)
      })
      .finally(() => {
        if (active) setLoadingLists(false)
      })
    return () => {
      active = false
    }
  }, [open, branchId, accounts])

  const requisition = requisitions.find((r) => r.id === requisitionId) ?? null
  // Picking a requisition fills what it already knows.
  useEffect(() => {
    if (!requisition) return
    if (!amount) setAmount(String(requisition.amount))
    if (!description) setDescription(requisition.purpose)
    if (requisition.coaId && !lineId && !coaId) {
      const line = lines.find((l) => l.chartOfAccountId === requisition.coaId)
      if (line) setLineId(line.id)
      else setCoaId(requisition.coaId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requisitionId])

  const selectedLine = lines.find((l) => l.id === lineId) ?? null
  const chartOfAccountId = kind === "expense" ? (selectedLine?.chartOfAccountId ?? coaId) : coaId

  const post = async (draft: boolean) => {
    setError(null)
    const value = parseAmount(amount)
    if (!branchId) return setError("No branch is available for your account.")
    if (!date) return setError("Pick the effective date.")
    if (kind === "expense" && requisitions.length > 0 && !requisitionId) return setError("Select the approved requisition this payment is for.")
    if (!chartOfAccountId) return setError(kind === "expense" ? "Choose the expense account (budget line)." : "Choose the income account.")
    if (!(value > 0)) return setError("Enter the gross amount.")
    if (!payee.trim()) return setError(kind === "expense" ? "Enter the payee / beneficiary." : "Enter the source of the income.")
    if (kind === "expense" && !draft && !file) return setError("Attach the proof-of-payment receipt — expense entries can't be posted without one.")
    setSaving(draft ? "draft" : "post")
    try {
      const attachments: string[] = []
      if (file) attachments.push((await uploadDocument(file, kind === "expense" ? "receipts" : "income-slips", branchId)).url)
      const created = await createEntry({
        type: kind,
        amount: value,
        description: description.trim() || payee.trim(),
        branchId,
        chartOfAccountId,
        transactionDate: date,
        ...(bankAccountId && method !== "Cash" ? { bankAccountId } : {}),
        ...(requisition ? { reference: requisition.reference } : {}),
        ...(attachments.length ? { attachments } : {}),
      })
      // What the API doesn't take on create rides on meta.
      if (created.id) {
        await updateEntry(created.id, {
          meta: {
            payee: payee.trim(),
            paymentMethod: method,
            draft,
            ...(requisition ? { requisitionId: requisition.id, requisitionRef: requisition.reference } : {}),
            ...(selectedLine ? { budgetAllocationId: selectedLine.id, budgetLine: selectedLine.name, budgetGroup: selectedLine.group } : {}),
            ...(file ? { receiptName: file.name } : {}),
          },
        }).catch(() => undefined)
      }
      // A posted payment settles its requisition.
      if (!draft && requisition) {
        const res = await fetch(`${API_V1}/financial/requisitions/${encodeURIComponent(requisition.id)}/pay`, {
          method: "PATCH",
          headers: { "x-csrf-token": getCsrfTokenFromCookie() },
          credentials: "include",
        })
        if (!res.ok) pushToast(describeApiError(await res.json().catch(() => null), "Entry posted, but the requisition could not be marked paid."), "info")
      }
      pushToast(draft ? "Entry saved as draft." : `${kind === "expense" ? "Expense" : "Income"} posted to the ledger — awaiting bank confirmation.`, "success")
      onPosted?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post the entry.")
    } finally {
      setSaving(null)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <Header title="NEW ENTRY" onClose={onClose} dark />
      <div className="px-6 py-3 border-b border-[#EEF1F6] flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-bold text-[#6B7280]">Transaction Type:</span>
        <div className="inline-flex rounded-[8px] bg-[#EEF1F6] p-1">
          <button type="button" onClick={() => setKind("expense")} className={`h-8 px-3 rounded-[6px] text-[11.5px] font-bold inline-flex items-center gap-1.5 ${kind === "expense" ? "bg-[#0F172A] text-white" : "text-[#6B7280]"}`}><ArrowUpFromLine className="h-3.5 w-3.5" />Expense Entry</button>
          <button type="button" onClick={() => setKind("income")} className={`h-8 px-3 rounded-[6px] text-[11.5px] font-bold inline-flex items-center gap-1.5 ${kind === "income" ? "bg-[#0F172A] text-white" : "text-[#6B7280]"}`}><ArrowDownToLine className="h-3.5 w-3.5" />Income Entry</button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {kind === "expense" && (
          <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
            <TriangleAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div><div className="text-[12px] font-bold text-[#111827]">Fiduciary Validation Enforces Audit Compliance</div><div className="text-[11.5px] text-[#6B7280] mt-0.5">Expense entries cannot be posted without an approved requisition voucher and an authentic proof-of-payment receipt. Unlinked debits are flagged for the Finance Controller.</div></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-4">
          <div>
            <div className={labelCls}>Entry effective date <span className="text-rose-500">*</span></div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-1.5`} />
          </div>
          {kind === "expense" ? (
            <div>
              <div className="flex items-center justify-between gap-2"><span className={labelCls}>Requisition <span className="text-rose-500">*</span></span><span className="text-[10px] text-[#9CA3AF] truncate">(Only approved requisitions with remaining balance appear)</span></div>
              <div className="relative mt-1.5">
                <select value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                  <option value="">{loadingLists ? "Loading requisitions…" : requisitions.length === 0 ? "No approved requisitions awaiting payment" : "Select requisition…"}</option>
                  {requisitions.map((r) => <option key={r.id} value={r.id}>{r.reference} - {ngn(r.amount)} - {r.purpose || "Requisition"}{r.approver ? ` (Approved: ${r.approver})` : ""}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
          ) : (
            <div>
              <div className={labelCls}>Income account (credit account) <span className="text-rose-500">*</span></div>
              <div className="relative mt-1.5">
                <select value={coaId} onChange={(e) => setCoaId(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                  <option value="">{loadingLists ? "Loading…" : revenueHeads.length === 0 ? "No income heads in the chart of accounts" : "Select income account…"}</option>
                  {revenueHeads.map((h) => <option key={h.id} value={h.id}>{h.name}{h.code ? ` (GL ${h.code})` : ""}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-4">
          {kind === "expense" ? (
            <div>
              <div className={labelCls}>Expense account (debit account) <span className="text-rose-500">*</span></div>
              <div className="relative mt-1.5">
                {lines.length > 0 ? (
                  <select value={lineId} onChange={(e) => { setLineId(e.target.value); setCoaId("") }} className={`${inputCls} appearance-none pr-9`}>
                    <option value="">Select budget line…</option>
                    {lines.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.group}{l.code ? ` (GL ${l.code})` : ""}</option>)}
                  </select>
                ) : (
                  <select value={coaId} onChange={(e) => setCoaId(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                    <option value="">{loadingLists ? "Loading…" : expenseHeads.length === 0 ? "No expense heads yet" : "Select expense account…"}</option>
                    {expenseHeads.map((h) => <option key={h.id} value={h.id}>{h.name}{h.code ? ` (GL ${h.code})` : ""}</option>)}
                  </select>
                )}
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
          ) : (
            <div>
              <div className={labelCls}>Source / service <span className="text-rose-500">*</span></div>
              <div className="relative mt-1.5"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" /><input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="e.g. Sunday 1st Service" className={`${inputCls} pl-9`} /></div>
            </div>
          )}
          <div>
            <div className={labelCls}>Transaction gross amount <span className="text-rose-500">*</span></div>
            <div className="relative mt-1.5"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] font-bold">₦</span><AmountInput value={amount} onValueChange={setAmount} className={`${inputCls} pl-8 text-right ${mono} text-[15px] font-extrabold`} placeholder="0.00" /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kind === "expense" && (
            <div>
              <div className={labelCls}>Payee / beneficiary vendor <span className="text-rose-500">*</span></div>
              <div className="relative mt-1.5"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" /><input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="e.g. Grace Building Supplies" className={`${inputCls} pl-9`} /></div>
            </div>
          )}
          <div className={kind === "income" ? "md:col-span-2" : ""}>
            <div className={labelCls}>{kind === "expense" ? "Disbursement method & credit account" : "Deposit method & receiving account"} <span className="text-rose-500">*</span></div>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <select value={method} onChange={(e) => setMethod(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                  {["Bank Transfer", "Cheque", "Cash", "Card", "POS"].map((m) => <option key={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
              <div className="relative">
                <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} disabled={method === "Cash"} className={`${inputCls} appearance-none pr-9`}>
                  <option value="">{method === "Cash" ? "Cash — no bank account" : accounts.length === 0 ? "No bank accounts yet" : "Select bank account…"}</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.bankName} — {a.accountName}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between"><span className={labelCls}>Auditable transaction description</span><span className="text-[10px] text-[#9CA3AF]">Max. 250 characters</span></div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 250))} rows={3} placeholder={kind === "expense" ? "Payment for church auditorium roof repairs (Vestry & Altar ceiling leak reinforcement)" : "Sunday 1st service tithes & offerings — counting batch 01"} className="mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-3 text-[12.5px] text-[#111827] outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]/20" />
        </div>

        <div>
          <div className="flex items-center justify-between"><span className={labelCls}>{kind === "expense" ? "Upload payment receipt" : "Upload counting sheet (optional)"} {kind === "expense" && <span className="text-rose-500">*</span>}</span><span className="text-[10px] text-[#9CA3AF]">pdf, png, jpeg up to 10MB</span></div>
          <div className="mt-1.5"><DropZone file={file} onFile={setFile} onClear={() => setFile(null)} hint={kind === "expense" ? "Upload the receipt stamped paid" : "Upload the counting sheet"} /></div>
        </div>

        {error && <p className="text-[12px] font-medium text-rose-600">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button onClick={onClose} className="text-[12px] font-bold text-[#4B5563]">Cancel</button>
        <div className="flex items-center gap-2">
          <button onClick={() => post(true)} disabled={saving !== null} className="h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-[12px] font-bold text-[#4B5563] disabled:opacity-60">{saving === "draft" ? "Saving…" : "Save Draft"}</button>
          <button onClick={() => post(false)} disabled={saving !== null} className="h-9 rounded-[6px] bg-[#3B5BDB] px-4 text-[12px] font-bold text-white disabled:opacity-60">{saving === "post" ? "Posting…" : "Post Entry to Ledger"}</button>
        </div>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Allocate: put an unclassified statement line under an account head.
// ---------------------------------------------------------------------------

export function AllocateModal({ open, onClose, entry, onAllocated }: { open: boolean; onClose: () => void; entry: LedgerEntry | null; onAllocated?: () => void }) {
  const { pushToast } = useToast()
  const { branchId } = useBranchContext()
  const [heads, setHeads] = useState<AccountHead[]>([])
  const [coaId, setCoaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !entry) return
    setCoaId(entry.coaId)
    setError(null)
    setLoading(true)
    loadAccountHeads(branchId, entry.type === "income" ? "revenue" : "expense")
      .then(setHeads)
      .catch(() => setHeads([]))
      .finally(() => setLoading(false))
  }, [open, entry, branchId])

  const filtered = useMemo(() => heads, [heads])

  const save = async () => {
    if (!entry) return
    if (!coaId) return setError("Choose the fund / account head this belongs to.")
    setSaving(true)
    setError(null)
    try {
      await allocateEntry(entry.id, coaId)
      pushToast(`${entryRef(entry)} allocated to ${heads.find((h) => h.id === coaId)?.name ?? "the account"}.`, "success")
      onAllocated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to allocate.")
    } finally {
      setSaving(false)
    }
  }

  if (!entry) return null
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      <Header title="ALLOCATE STATEMENT LINE" subtitle="Categorise this bank movement under a fund" onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        <div className="rounded-[8px] bg-[#F8FAFC] border border-[#EEF1F6] p-4">
          <div className="flex items-center justify-between gap-3"><span className={`${mono} text-[11px] font-bold text-[#3B5BDB]`}>{entryRef(entry)}</span><span className="text-[11px] text-[#6B7280]">{longDate(entry.date)}</span></div>
          <div className="text-[13px] font-bold text-[#111827] mt-2">{entry.description || "Bank statement line"}</div>
          <div className={`${mono} text-[16px] font-extrabold mt-1 ${entry.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>{entry.type === "income" ? "+" : "-"}{ngn(entry.amount, { decimals: true })}</div>
        </div>
        <div>
          <div className={labelCls}>{entry.type === "income" ? "Fund / income account" : "Expense account"} <span className="text-rose-500">*</span></div>
          <div className="relative mt-1.5">
            <select value={coaId} onChange={(e) => setCoaId(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
              <option value="">{loading ? "Loading…" : filtered.length === 0 ? "No account heads found" : "Select account…"}</option>
              {filtered.map((h) => <option key={h.id} value={h.id}>{h.name}{h.code ? ` (GL ${h.code})` : ""}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
        {error && <p className="text-[12px] font-medium text-rose-600">{error}</p>}
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#EEF1F6]">
        <button onClick={onClose} className="h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-[12px] font-bold text-[#4B5563]">Cancel</button>
        <button onClick={save} disabled={saving} className="h-9 rounded-[6px] bg-[#3B5BDB] px-4 text-[12px] font-bold text-white disabled:opacity-60">{saving ? "Allocating…" : "Allocate"}</button>
      </div>
    </ModalShell>
  )
}

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
