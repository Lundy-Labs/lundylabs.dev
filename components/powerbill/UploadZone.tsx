'use client'

import { useRef, useState } from 'react'

interface Props {
  onFile: (file: File) => void
  loading: boolean
}

export default function UploadZone({ onFile, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)')
      return
    }
    onFile(file)
  }

  return (
    <div
      className={`upload-zone ${dragging ? 'upload-zone--active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      onClick={() => !loading && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".xlsx,.xls" className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      {loading ? (
        <div className="upload-zone__content">
          <div className="upload-zone__spinner" />
          <p className="upload-zone__label">Analyzing your usage…</p>
        </div>
      ) : (
        <div className="upload-zone__content">
          <div className="upload-zone__icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="upload-zone__label">Drop your Georgia Power usage file here</p>
          <p className="upload-zone__hint">or click to browse — .xlsx exported from georgiapower.com</p>
        </div>
      )}
    </div>
  )
}
