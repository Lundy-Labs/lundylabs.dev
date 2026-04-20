import * as XLSX from 'xlsx'
import type { GasMonthlyRecord } from './types'

const MONTH_NAMES: Record<string, number> = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
  april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
  august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10,
  november: 11, nov: 11, december: 12, dec: 12,
}

// Parse a wide variety of date/month strings into { year, month }
function parseMonthYear(raw: string): { year: number; month: number } | null {
  const s = String(raw).trim()
  if (!s) return null

  // YYYY-MM or YYYY/MM
  let m = s.match(/^(\d{4})[-/](\d{1,2})$/)
  if (m) return { year: parseInt(m[1]), month: parseInt(m[2]) }

  // MM/YYYY or M/YYYY
  m = s.match(/^(\d{1,2})[-/](\d{4})$/)
  if (m) return { year: parseInt(m[2]), month: parseInt(m[1]) }

  // "January 2024", "Jan 2024", "JANUARY 2024"
  m = s.match(/^([a-z]+)\s+(\d{4})$/i)
  if (m) {
    const monthNum = MONTH_NAMES[m[1].toLowerCase()]
    if (monthNum) return { year: parseInt(m[2]), month: monthNum }
  }

  // "2024 January", "2024 Jan"
  m = s.match(/^(\d{4})\s+([a-z]+)$/i)
  if (m) {
    const monthNum = MONTH_NAMES[m[2].toLowerCase()]
    if (monthNum) return { year: parseInt(m[1]), month: monthNum }
  }

  // Full date — extract month/year: "2024-01-15", "2024/01/15"
  m = s.match(/^(\d{4})[-/](\d{1,2})[-/]\d{1,2}/)
  if (m) return { year: parseInt(m[1]), month: parseInt(m[2]) }

  // "01/15/2024" (MM/DD/YYYY)
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return { year: parseInt(m[3]), month: parseInt(m[1]) }

  // Excel serial date (number)
  const num = parseFloat(s)
  if (!isNaN(num) && num > 40000 && num < 50000) {
    const d = XLSX.SSF.parse_date_code(num)
    if (d) return { year: d.y, month: d.m }
  }

  return null
}

function looksLikeThermsHeader(h: string): boolean {
  const s = h.toLowerCase()
  return ['therm', 'usage', 'ccf', 'therms', 'gas', 'mcf', 'amount'].some((k) => s.includes(k))
}

function looksLikeDateHeader(h: string): boolean {
  const s = h.toLowerCase()
  return ['month', 'date', 'period', 'billing', 'year', 'service'].some((k) => s.includes(k))
}

function rowsToRecords(rows: string[][]): GasMonthlyRecord[] {
  if (rows.length < 2) throw new Error('File has too few rows.')

  // Find header row (first row with recognizable headers, or row 0)
  let headerRowIdx = 0
  let dateColIdx = -1
  let thermsColIdx = -1

  for (let ri = 0; ri < Math.min(5, rows.length); ri++) {
    const row = rows[ri]
    let dIdx = -1, tIdx = -1
    for (let ci = 0; ci < row.length; ci++) {
      const cell = String(row[ci] ?? '').trim()
      if (dIdx < 0 && looksLikeDateHeader(cell)) dIdx = ci
      if (tIdx < 0 && looksLikeThermsHeader(cell)) tIdx = ci
    }
    if (dIdx >= 0 && tIdx >= 0) {
      headerRowIdx = ri
      dateColIdx = dIdx
      thermsColIdx = tIdx
      break
    }
  }

  // If headers weren't found, guess: col 0 = date, col 1 = therms
  const dataStart = dateColIdx >= 0 ? headerRowIdx + 1 : 0
  if (dateColIdx < 0) dateColIdx = 0
  if (thermsColIdx < 0) thermsColIdx = 1

  const seen = new Set<string>()
  const records: GasMonthlyRecord[] = []

  for (let ri = dataStart; ri < rows.length; ri++) {
    const row = rows[ri]
    if (!row || row.length < 2) continue

    const dateRaw = String(row[dateColIdx] ?? '').trim()
    const thermsRaw = String(row[thermsColIdx] ?? '').trim()

    const parsed = parseMonthYear(dateRaw)
    const therms = parseFloat(thermsRaw.replace(/[^0-9.-]/g, ''))

    if (!parsed || isNaN(therms) || therms < 0) continue

    const { year, month } = parsed
    if (year < 2000 || year > 2100 || month < 1 || month > 12) continue

    const period = `${year}-${String(month).padStart(2, '0')}`
    if (seen.has(period)) continue // take first occurrence if duplicates
    seen.add(period)

    const date = new Date(year, month - 1, 15)
    records.push({ period, therms, date })
  }

  if (records.length === 0) throw new Error('No valid month/therms rows found. Check that your file has a month column and a therms/usage column.')

  return records.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function parseGasFile(file: File): Promise<GasMonthlyRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw = e.target!.result

        if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          // Parse as CSV text
          const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw as ArrayBuffer)
          const lines = text.split(/\r?\n/)
          const rows = lines.map((l) => l.split(/,|\t/).map((c) => c.replace(/^"|"$/g, '').trim()))
          resolve(rowsToRecords(rows))
        } else {
          // Parse as XLSX/XLS
          const data = typeof raw === 'string'
            ? new Uint8Array(Buffer.from(raw, 'binary'))
            : new Uint8Array(raw as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' }) as string[][]
          resolve(rowsToRecords(rows))
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse file.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

// Build GasMonthlyRecord[] from manual entry: array of { period: 'YYYY-MM', therms: number }
export function recordsFromManual(entries: { period: string; therms: number }[]): GasMonthlyRecord[] {
  return entries
    .filter((e) => e.therms > 0 && /^\d{4}-\d{2}$/.test(e.period))
    .map((e) => {
      const [year, month] = e.period.split('-').map(Number)
      return { period: e.period, therms: e.therms, date: new Date(year, month - 1, 15) }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}
