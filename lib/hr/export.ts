import { downloadCsv, rowsToCsv, todayStamp, type CsvRow } from "@/lib/export-csv"

/**
 * CSV export used by the HR tables. The backend has no HR export endpoint, so
 * the currently loaded page of rows is what gets written.
 */
export function exportHrRows(name: string, rows: CsvRow[]): boolean {
  if (!rows.length) return false
  downloadCsv(`${name}-${todayStamp()}`, rowsToCsv(rows))
  return true
}
