'use client'
import { useEffect, useRef, useState } from 'react'
import { exportTable } from '@/lib/export'

const C = { bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', text:'#1F1E1C', muted:'#8C8980' }

// Secondary-styled Export button with a CSV / Excel dropdown. `rows` should be
// only the currently visible (filtered + paginated) data.
export default function ExportButton({ filename, headers, rows }: { filename: string; headers: string[]; rows: (string | number)[][] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function run(format: 'csv' | 'xlsx') {
    setOpen(false)
    if (rows.length === 0) return
    exportTable(filename, headers, rows, format)
  }

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background:'#FFFFFF', border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
        ↓ Export
        <span style={{ fontSize:9, color:C.muted }}>▼</span>
      </button>
      {open && (
        <div style={{ position:'absolute', right:0, top:38, zIndex:20, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, boxShadow:'0 8px 24px rgba(60,50,40,0.12)', overflow:'hidden', minWidth:150 }}>
          <button onClick={() => run('csv')} style={{ display:'block', width:'100%', textAlign:'left', background:'transparent', border:'none', color:C.text, fontSize:13, padding:'9px 12px', cursor:'pointer', fontFamily:'inherit' }} onMouseEnter={e=>e.currentTarget.style.background=C.bgElevated} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>Export as CSV</button>
          <button onClick={() => run('xlsx')} style={{ display:'block', width:'100%', textAlign:'left', background:'transparent', border:'none', color:C.text, fontSize:13, padding:'9px 12px', cursor:'pointer', fontFamily:'inherit' }} onMouseEnter={e=>e.currentTarget.style.background=C.bgElevated} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>Export as Excel</button>
        </div>
      )}
    </div>
  )
}
