import * as XLSX from 'xlsx'

// Export a simple table (headers + rows) as CSV or a properly formatted .xlsx
// using the xlsx library. Only the rows passed in are exported, so callers hand
// over the currently visible / filtered / paginated data.
export function exportTable(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  format: 'csv' | 'xlsx'
) {
  const aoa = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Export')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }
}
