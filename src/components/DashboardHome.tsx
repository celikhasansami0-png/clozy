'use client'
import { accent } from './ui'
import type { Job, Task, Permit, CrewMember } from '@/lib/types'
import { riskAlerts, flaggedPermits, suggestAssignee } from '@/lib/insights'
import { useRouter } from 'next/navigation'

const C = { bg:'#080808', bgCard:'#0F0F0F', bgElevated:'#161616', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030' }

export default function DashboardHome({ jobs, tasks, permits, crew = [] }: { jobs:Job[], tasks:Task[], permits:Permit[], crew?:CrewMember[] }) {
  const router = useRouter()

  const done = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const open = tasks.length - done
  const onTrack = jobs.filter(j => j.status === 'On Track' || j.status === 'In Progress').length
  const avg = jobs.length ? Math.round(jobs.reduce((s, j) => s + j.completion, 0) / jobs.length) : 0
  const risks = riskAlerts(tasks)
  const flagged = flaggedPermits(permits)
  const suggested = suggestAssignee(crew, tasks)

  const metrics = [
    { label:'Active projects', value:String(jobs.length), unit:'projects',  delta:`${onTrack} on track`, up:true },
    { label:'Open tasks',      value:String(open),        unit:'tasks',     delta:`${done} done`,        up:true },
    { label:'Avg completion',  value:`${avg}%`,           unit:'portfolio', delta:`${inProgress} active`, up:true },
  ]

  // Grouped bar chart — To Do / In Progress / Done per project (mirrors Scope 1/2/3).
  const chartJobs = jobs.slice(0, 8)
  const groups = chartJobs.map(j => {
    const jt = tasks.filter(t => t.job_id === j.id)
    return {
      name: j.name.split(' — ')[0].split(' ').slice(0, 2).join(' '),
      todo: jt.filter(t => t.status === 'todo').length,
      prog: jt.filter(t => t.status === 'in_progress').length,
      done: jt.filter(t => t.status === 'done').length,
    }
  })
  const maxVal = Math.max(1, ...groups.flatMap(g => [g.todo, g.prog, g.done]))
  const yTicks = [maxVal, Math.round(maxVal * 0.66), Math.round(maxVal * 0.33), 0]
  const series: { key: 'todo' | 'prog' | 'done'; color: string; label: string }[] = [
    { key:'todo', color:accent.dark,   label:'To Do' },
    { key:'prog', color:accent.base,   label:'In Progress' },
    { key:'done', color:accent.bright, label:'Done' },
  ]

  const insights: string[] = []
  if (risks.length) insights.push(`${risks.length} task${risks.length>1?'s':''} due within 3 days — prioritise “${risks[0].task.title}”.`)
  if (flagged.length) insights.push(`${flagged.length} permit${flagged.length>1?'s':''} under review >14 days — follow up with the AHJ/utility.`)
  if (suggested) insights.push(`Balance workload — route the next task to ${suggested.name} (lightest load).`)
  if (insights.length === 0) insights.push('All projects on track — no risks or permit delays detected.')

  const card: React.CSSProperties = { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14 }

  return (
    <div style={{ padding:'24px 28px', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:14 }}>
      {/* Metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ ...card, padding:'20px 22px' }}>
            <div style={{ fontSize:14, color:C.sub, marginBottom:10 }}>{m.label}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
              <div style={{ fontSize:34, fontWeight:700, letterSpacing:'-0.04em', color:C.text }}>{m.value}</div>
              <span style={{ fontSize:13, fontWeight:600, color:accent.base, display:'inline-flex', alignItems:'center', gap:3 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={accent.base} strokeWidth="1.6"><path d={m.up ? 'M2 8l3-3 2 2 3-4' : 'M2 4l3 3 2-2 3 4'} strokeLinecap="round" strokeLinejoin="round"/></svg>
                {m.delta}
              </span>
            </div>
            <div style={{ fontSize:12, color:C.muted, marginTop:8 }}>{m.unit}</div>
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div style={{ ...card, padding:'22px 24px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em' }}>Tasks by Status</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>per active project</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {['Date', 'View'].map(l => (
              <button key={l} style={{ display:'inline-flex', alignItems:'center', gap:6, background:C.bgElevated, border:`1px solid ${C.border}`, color:C.sub, borderRadius:8, padding:'6px 11px', fontSize:12.5, fontFamily:'inherit' }}>
                {l}
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ))}
          </div>
        </div>

        {/* Plot */}
        <div style={{ display:'flex', gap:10, height:200 }}>
          <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', fontSize:11, color:C.muted, paddingBottom:22, textAlign:'right', width:34 }}>
            {yTicks.map((t, i) => <div key={i}>{t}</div>)}
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'flex-end', gap:8, borderLeft:`1px solid ${C.borderSubtle}`, paddingLeft:10 }}>
            {groups.length === 0 && <div style={{ margin:'auto', color:C.muted, fontSize:13 }}>No projects yet.</div>}
            {groups.map(g => (
              <div key={g.name} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%' }}>
                <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end', justifyContent:'center', gap:4 }}>
                  {series.map(s => (
                    <div key={s.key} title={`${s.label}: ${g[s.key]}`} style={{ width:10, height:`${(g[s.key] / maxVal) * 100}%`, minHeight:2, background:s.color, borderRadius:'3px 3px 0 0', transition:'height 0.4s' }} />
                  ))}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:8, height:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>{g.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:14 }}>
          {series.map(s => (
            <div key={s.key} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:C.sub }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:s.color }} />{s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: AI Insights + Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr', gap:14 }}>
        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em' }}>AI Insights</div>
            <span style={{ color:C.muted, fontSize:18, lineHeight:1 }}>···</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {insights.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:14, color:C.text }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill={accent.base} style={{ flexShrink:0, marginTop:2 }}><path d="M8 1a4.5 4.5 0 00-2.5 8.25V11h5V9.25A4.5 4.5 0 008 1zM6 12h4v1H6zm.5 2h3v1h-3z"/></svg>
                <span style={{ lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em', marginBottom:16 }}>Quick actions</div>
          <button onClick={()=>router.push('/dashboard/jobs')} style={{ width:'100%', background:C.bgElevated, border:`1px solid ${C.border}`, color:C.text, borderRadius:9, padding:'11px', fontSize:14, fontWeight:600, fontFamily:'inherit', marginBottom:10 }}>
            Connect data source
          </button>
          <button onClick={()=>router.push('/dashboard/reports')} style={{ width:'100%', background:C.text, border:'none', color:'#080808', borderRadius:9, padding:'11px', fontSize:14, fontWeight:700, fontFamily:'inherit' }}>
            Generate report
          </button>
        </div>
      </div>
    </div>
  )
}
