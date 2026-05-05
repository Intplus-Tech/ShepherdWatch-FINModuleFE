/**
 * Lightweight CSV export utilities. Generates a CSV string from rows of objects
 * (or pre-built sections) and triggers a browser download. Used for client-side
 * exports when a dedicated backend export endpoint is not available.
 */

export type CsvRow = Record<string, string | number | boolean | null | undefined>

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function rowsToCsv(rows: CsvRow[], headers?: string[]): string {
  if (rows.length === 0 && (!headers || headers.length === 0)) return ""
  const cols = headers && headers.length > 0 ? headers : Object.keys(rows[0] ?? {})
  const headerLine = cols.map(escapeCsvCell).join(",")
  const lines = rows.map((row) => cols.map((c) => escapeCsvCell(row[c])).join(","))
  return [headerLine, ...lines].join("\r\n")
}

export type CsvSection = {
  title?: string
  rows: CsvRow[]
  headers?: string[]
}

export function sectionsToCsv(sections: CsvSection[]): string {
  return sections
    .map((section) => {
      const titleLine = section.title ? `${escapeCsvCell(section.title)}\r\n` : ""
      return `${titleLine}${rowsToCsv(section.rows, section.headers)}`
    })
    .join("\r\n\r\n")
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  const safe = filename.endsWith(".csv") ? filename : `${filename}.csv`
  link.download = safe
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function todayStamp(): string {
  return new Date().toISOString().split("T")[0]
}
