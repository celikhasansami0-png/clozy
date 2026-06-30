'use client'
import { useMemo, useState } from 'react'
import { Tag, ProgressBar, jobStatusColor, accent } from './ui'
import { Skeleton } from './Skeleton'
import { riskAlerts, flaggedDocuments } from '@/lib/insights'
import type { Job, Task, Doc } from '@/lib/types'

const C = { bg:'#FAF9F5', bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5', highBg:'rgba(204,120,92,0.07)', highBorder:'rgba(204,120,92,0.18)' }
const DAY = 24 * 60 * 60 * 1000

export default function ReportsView({ jobs, tasks, documents }: { jobs:Job[], tasks:Task[], documents:Doc[] }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const done = tasks.filter(t => t.status === 'done').length
  const open = tasks.length - done
  const avgCompletion = jobs.length ? Math.round(jobs.reduce((s, j) => s + j.completion, 0) / jobs.length) : 0
  const risks = useMemo(() => riskAlerts(tasks), [tasks])
  const flagged = useMemo(() => flaggedDocuments(documents), [documents])

  // Activity chart filtered by a selectable date range (default: last 30 days).
  const [range, setRange] = useState(30)
  const activity = useMemo(() => {
    const now = Date.now()
    const start = now - range * DAY
    const n = range <= 7 ? 7 : range <= 30 ? 6 : range <= 90 ? 9 : 12
    const size = range / n
    const buckets = Array.from({ length: n }, (_, i) => {
      const d = new Date(start + i * size * DAY)
      const label = range <= 7
        ? d.toLocaleDateString('en', { weekday: 'short' })
        : d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
      return { label, count: 0 }
    })
    for (const t of tasks) {
      if (!t.created_at) continue
      const c = new Date(t.created_at).getTime()
      if (c >= start && c <= now) buckets[Math.min(n - 1, Math.floor((c - start) / (size * DAY)))].count++
    }
    return buckets
  }, [tasks, range])
  const maxAct = Math.max(1, ...activity.map(a => a.count))
  const RANGES = [{ v: 7, l: 'Last 7 days' }, { v: 30, l: 'Last 30 days' }, { v: 90, l: 'Last 90 days' }, { v: 365, l: 'This year' }]

  const stats = [
    { label:'Projects',          value:jobs.length },
    { label:'Avg. Completion',   value:`${avgCompletion}%` },
    { label:'Open Tasks',        value:open },
    { label:'At-Risk',           value:risks.length },
  ]

  async function generateSummary() {
    setLoading(true); setError(''); setSummary('')
    try {
      const res = await fetch('/api/ai/summary', { method:'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSummary(data.summary)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  function exportCsv() {
    const rows = [
      ['Project', 'Status', 'Phase', 'Completion %', 'Open Tasks'],
      ...jobs.map(j => [
        j.name,
        j.status,
        j.phase,
        String(j.completion),
        String(tasks.filter(t => t.job_id === j.id && t.status !== 'done').length),
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = `doppio-report-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Reports</div>
          <div style={{ fontSize:14, color:C.muted }}>Portfolio health across all your projects.</div>
        </div>
        <button onClick={exportCsv} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>
          ↓ Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'18px 20px' }}>
            <div style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.04em', color:C.text, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:12, color:C.muted, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600 }}>Activity — tasks created</div>
          <select value={range} onChange={e => setRange(Number(e.target.value))} style={{ background:C.bgElevated, color:C.text, border:`1px solid ${C.border}`, borderRadius:7, padding:'6px 10px', fontSize:12, fontFamily:'inherit', cursor:'pointer', outline:'none' }}>
            {RANGES.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:120 }}>
          {activity.map((a, i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, minWidth:0 }}>
              <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end' }}>
                <div title={`${a.count} tasks`} style={{ width:'100%', height:`${(a.count / maxAct) * 100}%`, minHeight:2, background:accent.base, borderRadius:'4px 4px 0 0', transition:'height 0.4s ease' }} />
              </div>
              <div style={{ fontSize:9.5, color:C.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>{a.label}</div>
              <div style={{ fontSize:11, color:C.sub, fontWeight:600 }}>{a.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Project breakdown */}
      <div style={{ fontSize:11, fontWeight:600, color:C.dim, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Projects</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:24 }}>
        {jobs.map(j => (
          <div key={j.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 18px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:14, fontWeight:600 }}>{j.name}</span>
              <Tag label={j.status} color={jobStatusColor[j.status]} />
            </div>
            <ProgressBar value={j.completion} />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:7, fontSize:11, color:C.muted }}>
              <span>{j.phase}</span><span>{j.completion}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Report agent */}
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:600 }}>AI Project Health Summary</div>
          <button onClick={generateSummary} disabled={loading} style={{ background:'#CC785C', border:'none', color:'#FFFFFF', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'inherit', opacity:loading?0.6:1 }}>
            {loading ? 'Generating…' : '✦ Generate AI Summary'}
          </button>
        </div>
        {flagged.length > 0 && (
          <div style={{ fontSize:12, color:C.sub, marginBottom:10 }}>{flagged.length} document(s) flagged · {risks.length} task(s) at risk</div>
        )}
        {loading && <div style={{ display:'flex', flexDirection:'column', gap:8 }}><Skeleton width="90%" /><Skeleton width="96%" /><Skeleton width="70%" /></div>}
        {error && <div style={{ fontSize:13, color:'#C2574A' }}>{error}</div>}
        {summary && <pre style={{ fontSize:13, color:C.text, whiteSpace:'pre-wrap', fontFamily:'inherit', lineHeight:1.6, margin:0 }}>{summary}</pre>}
        {!summary && !loading && !error && <div style={{ fontSize:13, color:C.muted }}>Generate a grounded health summary across all projects, risks and documents.</div>}
      </div>
    </div>
  )
}
