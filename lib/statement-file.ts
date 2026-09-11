/**
 * The statement import endpoint (`POST /transactions/upload-csv`) only parses
 * CSV. Excel workbooks are converted here, in the browser, so the accountant
 * can hand over whatever their bank exported without a backend change.
 */

import { normalizeStatementCsv } from "./statement-csv"

const CSV_TYPES = new Set(["text/csv", "application/csv"])
const XLSX_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
])

export type StatementKind = "csv" | "xlsx" | "xls" | "pdf" | "unknown"

export function classifyStatementFile(file: File): StatementKind {
  const name = file.name.toLowerCase()
  if (name.endsWith(".csv") || CSV_TYPES.has(file.type)) return "csv"
  if (name.endsWith(".xlsx") || XLSX_TYPES.has(file.type)) return "xlsx"
  if (name.endsWith(".xls") || file.type === "application/vnd.ms-excel") return "xls"
  if (name.endsWith(".pdf") || file.type === "application/pdf") return "pdf"
  return "unknown"
}

/** Why a file can't be imported, or null when it can. */
export function statementFileProblem(file: File): string | null {
  switch (classifyStatementFile(file)) {
    case "csv":
    case "xlsx":
      return null
    case "xls":
      return `${file.name} is a legacy Excel file. Open it in Excel and save it as .xlsx (or export as CSV), then upload again.`
    case "pdf":
      return `${file.name} is a PDF. Statements can't be read from PDF yet — export it from your bank as CSV or Excel instead.`
    default:
      return `${file.name} isn't a CSV or Excel file.`
  }
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  let text: string
  if (value instanceof Date) {
    text = Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10)
  } else if (typeof value === "object") {
    // ExcelJS returns rich text, formulas and hyperlinks as objects; take the
    // displayed value from each.
    const cell = value as { text?: unknown; result?: unknown; richText?: { text: string }[] }
    if (Array.isArray(cell.richText)) text = cell.richText.map((part) => part.text).join("")
    else if (cell.result !== undefined) return csvCell(cell.result)
    else if (cell.text !== undefined) text = String(cell.text)
    else text = ""
  } else {
    text = String(value)
  }
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Convert the first worksheet of an .xlsx file to a CSV `File` the import
 * endpoint can read. The library is loaded on demand — it's the size of a
 * small app and most uploads never need it.
 */
export async function excelToCsvFile(file: File): Promise<File> {
  const ExcelJS = await import("exceljs")
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())

  const sheet = workbook.worksheets[0]
  if (!sheet) throw new Error(`${file.name} has no worksheets.`)

  const lines: string[] = []
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as unknown[]
    // ExcelJS row values are 1-indexed; slot 0 is always empty.
    lines.push(values.slice(1).map(csvCell).join(","))
  })
  if (lines.length === 0) throw new Error(`${file.name} is empty.`)

  const csvName = file.name.replace(/\.xlsx$/i, "") + ".csv"
  return new File([lines.join("\r\n")], csvName, { type: "text/csv", lastModified: file.lastModified })
}

/**
 * The file to send. Excel is converted to CSV first; then every file is
 * rewritten into the columns the import endpoint expects, because no bank
 * exports them that way.
 */
export async function toImportableStatement(file: File): Promise<{ file: File; rows: number; skipped: number }> {
  const csvFile = classifyStatementFile(file) === "xlsx" ? await excelToCsvFile(file) : file
  const { csv, rows, skipped } = normalizeStatementCsv(await csvFile.text())
  return {
    file: new File([csv], csvFile.name, { type: "text/csv", lastModified: file.lastModified }),
    rows,
    skipped,
  }
}
