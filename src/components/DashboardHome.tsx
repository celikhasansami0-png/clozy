'use client'
import { Tag, ProgressBar, StatusDot, jobStatusColor, statusCfg } from './ui'
import type { Job, Task, Permit } from '@/lib/types'
import { riskAlerts } from '@/lib/insights'
import { useRouter } from 'next/navigation'

const C = { bg:'#080808', bgCard:'#0F0F0F', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', muted:'#606060', dim:'#303030', highBg:'rgba(242,242,242,0.07)', highBorder:'rgba(242,242,242,0.18)' }

export default function DashboardHome({ jobs, tasks, permits }: { jobs:Job[], tasks:Task[], permits:Permit[] }) {
  const router = useRouter()
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length
  const done = tasks.filter(t => t.status === 'done').length
  const urgentItems = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done')
  const risks = riskAlerts(tasks)

  const stats = [
    { label:'Active Projects', value:jobs.length, dim:false },
    { label:'In Progress',  value:inProgress,   dim:false },
    { label:'Urgent Items', value:urgent,        dim:false },
    { label:'Completed',    value:done,          dim:true },
  ]

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Good morning</div>
        <div style={{ fontSize:14, color:C.muted }}>Here's where things stand across all active solar projects.</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'18px 20px' }}>
            <div style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.04em', color:s.dim?C.muted:C.text, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:12, color:C.muted, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:11, fontWeight:600, color:C.dim, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Project Sites</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:28 }}>
        {jobs.length === 0 && (
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'24px 20px', color:C.muted, fontSize:13 }}>
            No projects yet. <span style={{ color:C.text, cursor:'pointer', textDecoration:'underline' }} onClick={()=>router.push('/dashboard/jobs')}>Create your first project →</span>
          </div>
        )}
        {jobs.map(j => {
          const jobTasks = tasks.filter(t => t.job_id === j.id)
          const open = jobTasks.filter(t => t.status !== 'done').length
          return (
            <div key={j.id} onClick={()=>router.push(`/dashboard/jobs?job=${j.id}`)}
              style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 20px', cursor:'pointer', transition:'border-color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#A0A0A0'}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{j.name}</span>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Tag label={j.status} color={jobStatusColor[j.status]} />
                  <span style={{ fontSize:12, color:C.muted }}>{open} open</span>
                </div>
              </div>
              <ProgressBar value={j.completion} />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:7, fontSize:11, color:C.muted }}>
                <span>{j.phase}</span><span>{j.completion}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <div style={{ fontSize:11, fontWeight:600, color:C.dim, letterSpacing:'0.08em', textTransform:'uppercase' }}>Risk Alerts</div>
        {risks.length > 0 && <span style={{ fontSize:10, fontWeight:700, color:C.text, background:C.highBg, border:`1px solid ${C.highBorder}`, padding:'1px 7px', borderRadius:10 }}>{risks.length}</span>}
      </div>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden', marginBottom:28 }}>
        {risks.length === 0 && (
          <div style={{ padding:'20px 18px', fontSize:13, color:C.muted }}>No deadlines within 3 days — nothing at risk.</div>
        )}
        {risks.map((r, i) => {
          const job = jobs.find(j => j.id === r.task.job_id)
          const overdue = r.daysLeft < 0
          return (
            <div key={r.task.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:i<risks.length-1?`1px solid ${C.borderSubtle}`:'none' }}>
              <StatusDot status={r.task.status} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{r.task.title}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{job?.name} · Due {r.task.due_date}</div>
              </div>
              <Tag label={overdue ? `${Math.abs(r.daysLeft)}d overdue` : r.daysLeft === 0 ? 'Due today' : `${r.daysLeft}d left`} color={overdue?C.text:C.muted} bg={overdue?C.highBg:'transparent'} border={overdue?C.highBorder:undefined} />
            </div>
          )
        })}
      </div>

      <div style={{ fontSize:11, fontWeight:600, color:C.dim, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Urgent Items</div>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
        {urgentItems.length === 0 && (
          <div style={{ padding:'20px 18px', fontSize:13, color:C.muted }}>No urgent items — you're clear.</div>
        )}
        {urgentItems.map((t, i) => {
          const job = jobs.find(j => j.id === t.job_id)
          return (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:i<urgentItems.length-1?`1px solid ${C.borderSubtle}`:'none' }}>
              <StatusDot status={t.status} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{t.title}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{job?.name} · Due {t.due_date}</div>
              </div>
              <Tag label="Urgent" color={C.text} bg={C.highBg} border={C.highBorder} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
