/**
 * Rewrite a bank's CSV export into the shape `POST /transactions/upload-csv`
 * parses: `date,description,amount,type` with `type` of income | expense
 * (plus a `transactionType` of credit | debit, the name the list API uses).
 *
 * Every bank names its columns differently ("Trans Date", "Narration",
 * "Debit"/"Credit", …), often puts account details in a few rows above the
 * header, formats amounts as "₦250,000.00" and dates as DD/MM/YYYY. None of
 * that is the accountant's problem to fix by hand, so it's handled here.
 */

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

/** RFC-4180-ish parse: quoted fields, doubled quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  // Excel and most banks prefix the file with a UTF-8 byte-order mark.
  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') quoted = true
    else if (ch === ",") {
      row.push(field)
      field = ""
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += ch
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""))
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

// ---------------------------------------------------------------------------
// Column recognition
// ---------------------------------------------------------------------------

type Role = "date" | "description" | "amount" | "debit" | "credit" | "type" | "reference"

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

/** Header aliases, most specific first so "value date" wins over "value". */
const ALIASES: [Role, string[]][] = [
  ["date", ["transaction date", "trans date", "txn date", "posting date", "post date", "value date", "tran date", "date posted", "date"]],
  ["description", ["transaction details", "transaction description", "description", "narration", "narrative", "remarks", "particulars", "details", "memo", "payee", "reference description"]],
  ["debit", ["debit amount", "debit", "withdrawal", "withdrawals", "money out", "paid out", "dr amount", "dr", "outflow"]],
  ["credit", ["credit amount", "credit", "deposit", "deposits", "money in", "paid in", "cr amount", "cr", "inflow", "lodgement"]],
  ["amount", ["transaction amount", "amount", "value", "txn amount"]],
  ["type", ["transaction type", "txn type", "dr cr", "cr dr", "type", "flow"]],
  ["reference", ["transaction reference", "transaction ref", "reference", "ref no", "ref", "cheque no", "chq no"]],
]

function roleOf(header: string): Role | null {
  const h = norm(header)
  if (!h) return null
  for (const [role, names] of ALIASES) {
    if (names.some((name) => h === name)) return role
  }
  for (const [role, names] of ALIASES) {
    if (names.some((name) => h.includes(name))) return role
  }
  return null
}

type ColumnMap = Partial<Record<Role, number>>

function mapColumns(row: string[]): ColumnMap {
  const map: ColumnMap = {}
  row.forEach((cell, index) => {
    const role = roleOf(cell)
    if (role && map[role] === undefined) map[role] = index
  })
  return map
}

function isUsable(map: ColumnMap): boolean {
  const hasAmount = map.amount !== undefined || map.debit !== undefined || map.credit !== undefined
  return map.date !== undefined && hasAmount
}

// ---------------------------------------------------------------------------
// Value normalisation
// ---------------------------------------------------------------------------

/** "₦250,000.00", "(1,500)", "1.500,00", "-45000" → a number, or null. */
export function parseAmount(raw: string): number | null {
  let s = raw.trim()
  if (!s) return null
  const negative = /^\(.*\)$/.test(s) || /^-/.test(s) || /-$/.test(s) || /\bdr\b/i.test(s)
  s = s.replace(/[^\d.,]/g, "")
  if (!s) return null
  // Decide which separator is decimal: the last one, if it's followed by ≤2 digits.
  const lastComma = s.lastIndexOf(",")
  const lastDot = s.lastIndexOf(".")
  const decimalSep = lastComma > lastDot ? "," : "."
  const tail = s.slice(Math.max(lastComma, lastDot) + 1)
  if (Math.max(lastComma, lastDot) >= 0 && tail.length <= 2) {
    s = s.replace(decimalSep === "," ? /\./g : /,/g, "").replace(decimalSep, ".")
  } else {
    s = s.replace(/[.,]/g, "")
  }
  const value = Number(s)
  if (!Number.isFinite(value)) return null
  return negative ? -Math.abs(value) : value
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
}

/** Many bank formats → "YYYY-MM-DD". Ambiguous numeric dates are read DD/MM (Nigeria). */
export function parseDate(raw: string): string | null {
  const s = raw.trim().replace(/\s+\d{1,2}:\d{2}(:\d{2})?(\s*[ap]m)?$/i, "")
  if (!s) return null

  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (m) return build(m[1], m[2], m[3])

  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})$/)
  if (m) {
    const [, a, b] = m
    let y = m[3]
    if (y.length === 2) y = `20${y}`
    // DD/MM unless the first part can't be a day.
    const first = Number(a)
    const second = Number(b)
    const [day, month] = first > 12 && second <= 12 ? [a, b] : second > 12 && first <= 12 ? [b, a] : [a, b]
    return build(y, month, day)
  }

  m = s.match(/^(\d{1,2})[-\s]([a-z]{3,9})[-\s,]*(\d{4}|\d{2})$/i)
  if (m) {
    const month = MONTHS[m[2].slice(0, 4).toLowerCase()] ?? MONTHS[m[2].slice(0, 3).toLowerCase()]
    if (month) return build(m[3].length === 2 ? `20${m[3]}` : m[3], String(month), m[1])
  }

  m = s.match(/^([a-z]{3,9})[-\s]+(\d{1,2}),?[-\s]+(\d{4})$/i)
  if (m) {
    const month = MONTHS[m[1].slice(0, 4).toLowerCase()] ?? MONTHS[m[1].slice(0, 3).toLowerCase()]
    if (month) return build(m[3], String(month), m[2])
  }

  const parsed = new Date(s)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)

  function build(y: string, mo: string, d: string): string | null {
    const month = Number(mo)
    const day = Number(d)
    if (month < 1 || month > 12 || day < 1 || day > 31) return null
    return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }
}

function typeFromLabel(raw: string): "income" | "expense" | null {
  const t = norm(raw)
  if (!t) return null
  if (/^(cr|credit|income|inflow|deposit|c)$/.test(t) || t.includes("credit") || t.includes("income")) return "income"
  if (/^(dr|debit|expense|outflow|withdrawal|d)$/.test(t) || t.includes("debit") || t.includes("expense")) return "expense"
  return null
}

// ---------------------------------------------------------------------------
// The rewrite
// ---------------------------------------------------------------------------

export type NormalizedStatement = {
  csv: string
  rows: number
  skipped: number
  /** How the bank's columns were read — shown in errors and useful for support. */
  mapping: Record<string, string>
}

export function normalizeStatementCsv(text: string): NormalizedStatement {
  const table = parseCsv(text)
  if (table.length === 0) throw new Error("The file is empty.")

  // The header is the first row we can make sense of; anything above it is
  // the bank's preamble (account name, period, opening balance…).
  let headerIndex = -1
  let columns: ColumnMap = {}
  for (let i = 0; i < Math.min(table.length, 40); i++) {
    const candidate = mapColumns(table[i])
    if (isUsable(candidate)) {
      headerIndex = i
      columns = candidate
      break
    }
  }
  if (headerIndex < 0) {
    const sample = table
      .slice(0, 3)
      .map((r) => r.filter(Boolean).slice(0, 6).join(" | "))
      .join("\n")
    throw new Error(
      `Couldn't find the transaction columns in this file. It needs a date column and an amount (or debit/credit) column. The first rows read:\n${sample}`
    )
  }

  const header = table[headerIndex]
  const mapping: Record<string, string> = {}
  for (const [role, index] of Object.entries(columns)) {
    if (index !== undefined) mapping[role] = header[index]
  }

  // The API creates transactions with type=income|expense but lists them with
  // transactionType=credit|debit; emit both so the importer finds whichever
  // name it reads. Extra columns are ignored.
  const out: string[] = ["date,description,amount,type,transactionType"]
  let skipped = 0

  for (const row of table.slice(headerIndex + 1)) {
    const cell = (role: Role) => (columns[role] === undefined ? "" : (row[columns[role]!] ?? ""))

    const date = parseDate(cell("date"))
    if (!date) {
      skipped++
      continue
    }

    let amount: number | null = null
    let type: "income" | "expense" | null = null

    if (columns.debit !== undefined || columns.credit !== undefined) {
      const debit = parseAmount(cell("debit"))
      const credit = parseAmount(cell("credit"))
      if (credit && credit !== 0) {
        amount = Math.abs(credit)
        type = "income"
      } else if (debit && debit !== 0) {
        amount = Math.abs(debit)
        type = "expense"
      }
    }
    if (amount === null && columns.amount !== undefined) {
      const value = parseAmount(cell("amount"))
      if (value !== null && value !== 0) {
        amount = Math.abs(value)
        type = typeFromLabel(cell("type")) ?? (value < 0 ? "expense" : "income")
      }
    }
    if (amount === null || amount === 0 || !type) {
      skipped++
      continue
    }
    // An explicit Dr/Cr column overrides a sign guess.
    type = typeFromLabel(cell("type")) ?? type

    const description =
      [cell("description"), cell("reference")].map((s) => s.trim()).filter(Boolean).join(" · ") || "Bank statement entry"

    out.push([date, csvCell(description), amount.toFixed(2), type, type === "income" ? "credit" : "debit"].join(","))
  }

  const rows = out.length - 1
  if (rows === 0) {
    throw new Error(
      `No transactions could be read. Columns were read as ${JSON.stringify(mapping)} but every row was missing a date or an amount.`
    )
  }

  return { csv: out.join("\r\n"), rows, skipped, mapping }
}
