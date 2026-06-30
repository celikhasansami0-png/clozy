'use client'
import { useEffect } from 'react'

const C = { bgCard:'#FFFFFF', border:'#DEDBD2', text:'#1F1E1C', muted:'#8C8980' }

export default function Modal({ title, subtitle, onClose, children, width = 440 }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  return (
    <div onMouseDown={onClose} style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(31,30,28,0.35)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onMouseDown={e => e.stopPropagation()} style={{ width, maxWidth:'100%', maxHeight:'90vh', overflowY:'auto', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:'22px 24px', boxShadow:'0 12px 40px rgba(60,50,40,0.18)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em', color:C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background:'none', border:'none', color:C.muted, fontSize:22, lineHeight:1, cursor:'pointer', padding:0, marginLeft:12 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
