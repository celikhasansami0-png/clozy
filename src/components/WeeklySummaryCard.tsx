'use client'
import { useState } from 'react'

const C = { bgCard:'#FFFFFF', border:'#DEDBD2', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', accent:'#CC785C', dim:'#C2BFB5' }

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function WeeklySummaryCard({ initialSummary, initialAt }: { initialSummary: string; initialAt: string | null }) {
  const [summary, setSummary] = useState(initialSummary)
  const [at, setAt] = useState(initialAt)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/weekly-summary', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error === 'rate_limited' ? 'Already generated today — try again tomorrow.' : (json.error || 'Failed'))
      setSummary(json.summary); setAt(json.generatedAt)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to generate') }
    setLoading(false)
  }

  const bullets = summary.split('\n').map(l => l.trim()).filter(l => l.startsWith('- ')).map(l => l.slice(2))

  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', marginBottom:24, boxShadow:'0 1px 3px rgba(60,50,40,0.05)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ color:C.accent }}>✦</span> This Week&apos;s AI Summary
        </div>
        {at && <span style={{ fontSize:11, color:C.dim }}>Generated {timeAgo(at)}</span>}
      </div>

      {summary ? (
        <ul style={{ margin:0, paddingLeft:18, display:'flex', flexDirection:'column', gap:6 }}>
          {(bullets.length ? bullets : [summary]).map((b, i) => (
            <li key={i} style={{ fontSize:13, color:C.sub, lineHeight:1.55 }}>{b}</li>
          ))}
        </ul>
      ) : (
        <div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:12 }}>No summary yet. Generate a friendly weekly health summary of your projects.</div>
          <button onClick={generate} disabled={loading} style={{ background:C.accent, border:'none', color:'#FFFFFF', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Generating…' : 'Generate Summary Now'}</button>
          {error && <div style={{ fontSize:12, color:'#C2574A', marginTop:8 }}>{error}</div>}
        </div>
      )}
    </div>
  )
}
