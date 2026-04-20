'use client'

import { useRef, useState, useCallback } from 'react'
import type { GasMonthlyRecord } from '@/lib/gas/types'
import { recordsFromManual } from '@/lib/gas/parser'

interface Props {
  onRecords: (records: GasMonthlyRecord[]) => void
  loading: boolean
  onFileUpload: (file: File) => void
  instructions: string[]
}

// Generate the last N months as YYYY-MM strings
function lastNMonths(n: number): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

function periodToLabel(p: string): string {
  const [year, month] = p.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function GasUploadZone({ onRecords, loading, onFileUpload, instructions }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [tab, setTab] = useState<'upload' | 'manual'>('upload')
  const [manualEntries, setManualEntries] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    lastNMonths(12).forEach((p) => { init[p] = '' })
    return init
  })

  const defaultMonths = lastNMonths(12)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    const name = file.name.toLowerCase()
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.txt')) {
      alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
      return
    }
    onFileUpload(file)
  }

  const handleManualSubmit = useCallback(() => {
    const entries = Object.entries(manualEntries)
      .map(([period, raw]) => ({ period, therms: parseFloat(raw) }))
      .filter((e) => !isNaN(e.therms) && e.therms > 0)
    if (entries.length < 2) {
      alert('Enter at least 2 months of data to run the analysis.')
      return
    }
    onRecords(recordsFromManual(entries))
  }, [manualEntries, onRecords])

  return (
    <div className="gb-upload-zone">
      <div className="gb-tabs">
        <button className={`gb-tab ${tab === 'upload' ? 'gb-tab--active' : ''}`} onClick={() => setTab('upload')}>
          Upload file
        </button>
        <button className={`gb-tab ${tab === 'manual' ? 'gb-tab--active' : ''}`} onClick={() => setTab('manual')}>
          Enter manually
        </button>
      </div>

      {tab === 'upload' && (
        <>
          <div
            className={`pb-upload ${dragging ? 'pb-upload--active' : ''}`}
            style={{ marginTop: '0.75rem' }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => !loading && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {loading ? (
              <>
                <div className="pb-upload__spinner" />
                <p className="pb-upload__label">Analyzing…</p>
              </>
            ) : (
              <>
                <div className="pb-upload__icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="pb-upload__label">Drop your gas usage export here</p>
                <p className="pb-upload__hint">CSV or Excel · click or drag</p>
              </>
            )}
          </div>
          <div className="pb-how" style={{ marginTop: '1.25rem' }}>
            <p className="pb-how__title">How to get your usage data</p>
            <ol className="pb-how__steps">
              {instructions.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </>
      )}

      {tab === 'manual' && (
        <div className="gb-manual" style={{ marginTop: '0.75rem' }}>
          <p className="gb-manual__hint">
            Enter your therms used for each month. Find therms on your monthly gas bill statement.
          </p>
          <div className="gb-manual__grid">
            {defaultMonths.map((period) => (
              <label key={period} className="gb-manual__row">
                <span className="gb-manual__month">{periodToLabel(period)}</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="—"
                  className="gb-manual__input"
                  value={manualEntries[period] ?? ''}
                  onChange={(e) => setManualEntries((prev) => ({ ...prev, [period]: e.target.value }))}
                />
                <span className="gb-manual__unit">therms</span>
              </label>
            ))}
          </div>
          <button className="gb-manual__submit" onClick={handleManualSubmit} disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze plans →'}
          </button>
        </div>
      )}
    </div>
  )
}
