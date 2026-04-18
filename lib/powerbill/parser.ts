import * as XLSX from 'xlsx'
import type { DailyRecord, HourlyRecord, BillingPeriod } from './types'
import { SUMMER_MONTHS } from './rates'

export function parseGPCFile(file: File): Promise<DailyRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        // GPC hourly export: row 1 = disclaimer, row 2 = account, row 3 = headers (Hour/kWh/Temp), row 4+ = data
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as unknown[][]

        const hourlyByDate = new Map<string, HourlyRecord[]>()

        for (let i = 3; i < rows.length; i++) {
          const row = rows[i]
          if (!row || row.length < 2) continue
          const hourStr = String(row[0] ?? '').trim()
          const kWh = parseFloat(String(row[1] ?? '0'))
          const temp = parseFloat(String(row[2] ?? '0'))
          if (!hourStr || isNaN(kWh)) continue

          // hourStr format: "2026-04-15 23:00"
          const spaceIdx = hourStr.lastIndexOf(' ')
          if (spaceIdx === -1) continue
          const datePart = hourStr.slice(0, spaceIdx)
          const timePart = hourStr.slice(spaceIdx + 1)
          const hour = parseInt(timePart.split(':')[0])
          if (isNaN(hour)) continue

          const datetime = new Date(datePart + 'T' + timePart + ':00')
          if (isNaN(datetime.getTime())) continue

          const existing = hourlyByDate.get(datePart) ?? []
          existing.push({ datetime, hour, kWh, temp })
          hourlyByDate.set(datePart, existing)
        }

        if (hourlyByDate.size === 0) throw new Error('No usage data found in file.')

        const records: DailyRecord[] = []
        for (const [datePart, hours] of hourlyByDate.entries()) {
          const date = new Date(datePart + 'T12:00:00')
          if (isNaN(date.getTime())) continue
          const totalKWh = hours.reduce((s, h) => s + h.kWh, 0)
          const temps = hours.map((h) => h.temp).filter((t) => !isNaN(t))
          const highTemp = temps.length ? Math.max(...temps) : 0
          const lowTemp = temps.length ? Math.min(...temps) : 0
          // calendar month as billing period key
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const billPeriod = `${year}-${month}`
          records.push({ billPeriod, date, kWh: totalKWh, highTemp, lowTemp, hours })
        }

        records.sort((a, b) => a.date.getTime() - b.date.getTime())
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

    // key is "YYYY-MM"
    const [yearStr, monthStr] = key.split('-')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr) - 1
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    periods.push({ key, startDate, endDate, days: sorted, totalKWh, isSummer })
  }

  return periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}
