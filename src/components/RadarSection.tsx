'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const C = { bgCard:'#FFFFFF', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', accent:'#CC785C', accentBg:'#F2E2D8', green:'#7A9B76' }

type Alert = { id: string; title: string; body: string; link: string }

function WarnIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export default function RadarSection() {
  const router = useRouter()
  const supabase = createClient()
  const [alerts, setAlerts] = useState<Alert[] | null>(null)

  useEffect(() => {
    fetch('/api/radar', { method: 'POST' }).then(r => r.json()).then(j => setAlerts(j.alerts || [])).catch(() => setAlerts([]))
  }, [])

  async function dismiss(id: string) {
    setAlerts(prev => (prev || []).filter(a => a.id !== id))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  if (alerts === null) return null

  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:13, fontWeight:700, letterSpacing:'-0.01em', display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ display:'flex', color:C.accent }}><WarnIcon /></span> Doppio Radar
        </span>
        {alerts.length > 0 && <span style={{ fontSize:11, fontWeight:700, color:C.accent, background:C.accentBg, borderRadius:20, padding:'1px 8px' }}>{alerts.length}</span>}
      </div>

      {alerts.length === 0 ? (
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.sub, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'12px 16px' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:C.green, flexShrink:0 }} /> All clear — no risks detected.
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:10 }}>
          {alerts.map(a => (
            <div key={a.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.accent}`, borderRadius:10, padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ marginTop:1, flexShrink:0 }}><WarnIcon /></span>
              <div style={{ flex:1, minWidth:0, cursor:'pointer' }} onClick={() => router.push(a.link)}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{a.title}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{a.body}</div>
              </div>
              <button onClick={() => dismiss(a.id)} aria-label="Dismiss" style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:16, lineHeight:1, padding:0, flexShrink:0 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
