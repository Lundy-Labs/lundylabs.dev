import * as XLSX from 'xlsx'
import type { DailyRecord, BillingPeriod } from './types'
import { SUMMER_MONTHS } from './rates'

export function parseGPCFile(file: File): Promise<DailyRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        // GPC export: row 1 = disclaimer, row 2 = account, row 3 = headers, row 4+ = data
        const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as string[][]

        const records: DailyRecord[] = []
        for (let i = 3; i < rows.length; i++) {
          const row = rows[i]
          if (!row || row.length < 3) continue
          const billPeriod = String(row[0] ?? '').trim()
          const dayStr = String(row[1] ?? '').trim()
          const kWh = parseFloat(String(row[2] ?? '0'))
          const highTemp = parseFloat(String(row[3] ?? '0'))
          const lowTemp = parseFloat(String(row[4] ?? '0'))
          if (!dayStr || isNaN(kWh)) continue
          const date = new Date(dayStr + 'T12:00:00')
          if (isNaN(date.getTime())) continue
          records.push({ billPeriod, date, kWh, highTemp, lowTemp })
        }
        resolve(records)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export function groupByBillingPeriod(records: DailyRecord[]): BillingPeriod[] {
  const map = new Map<string, DailyRecord[]>()
  for (const r of records) {
    const existing = map.get(r.billPeriod) ?? []
    existing.push(r)
    map.set(r.billPeriod, existing)
  }

  const periods: BillingPeriod[] = []
  for (const [key, days] of map.entries()) {
    const sorted = [...days].sort((a, b) => a.date.getTime() - b.date.getTime())
    const totalKWh = sorted.reduce((s, d) => s + d.kWh, 0)
    const summerDays = sorted.filter((d) => SUMMER_MONTHS.has(d.date.getMonth() + 1)).length
    const isSummer = summerDays > sorted.length / 2

    const parts = key.split(' - ')
    const startDate = new Date((parts[0] ?? '') + 'T12:00:00')
    const endDate = new Date((parts[1] ?? '') + 'T12:00:00')

    periods.push({ key, startDate, endDate, days: sorted, totalKWh, isSummer })
  }

  return periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}
