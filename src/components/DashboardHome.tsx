'use client'
import { Tag, ProgressBar, StatusDot, jobStatusColor } from './ui'
import type { Job, Task, Doc, CrewMember } from '@/lib/types'
import { riskAlerts } from '@/lib/insights'
import { useCreate } from './CreateProvider'
import EmptyState, { Icons } from './EmptyState'
import { useRouter } from 'next/navigation'

const C = { bg:'#FAF9F5', bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5', accent:'#CC785C', highBg:'rgba(204,120,92,0.10)', highBorder:'rgba(204,120,92,0.25)' }

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0, boxShadow:'0 1px 3px rgba(60,50,40,0.05)' }}>
      <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.borderSubtle}`, fontSize:13, fontWeight:600, color:C.text }}>{title}</div>
      <div style={{ overflowY:'auto', flex:1 }}>{children}</div>
    </div>
  )
}

// Fixed standard dashboard widgets — same for every user (industry-agnostic).
export default function DashboardHome({ jobs, tasks, documents, crew }: { jobs:Job[], tasks:Task[], documents:Doc[], crew:CrewMember[] }) {
  const create = useCreate()
  const router = useRouter()
  const risks = riskAlerts(tasks)

  // Document status counts.
  const docCfg = [
    { label:'Approved',     n: documents.filter(d=>d.status==='Approved').length },
    { label:'Under Review', n: documents.filter(d=>d.status==='Under Review').length },
    { label:'Pending',      n: documents.filter(d=>d.status==='Pending').length },
    { label:'Rejected',     n: documents.filter(d=>d.status==='Rejected').length },
  ]

  // Team availability.
  const loadOf = (id: string) => tasks.filter(t => t.assignee_id === id && t.status !== 'done').length
  const available = crew.filter(c => loadOf(c.id) === 0).length
  const busy = crew.filter(c => loadOf(c.id) > 3).length

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1, background:C.bg }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Welcome back</div>
        <div style={{ fontSize:14, color:C.muted }}>Here&apos;s where things stand across all active projects.</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:16, alignItems:'start' }}>
        {/* Widget 1 — Active Projects */}
        <Card title={`Active Projects · ${jobs.length}`}>
          {jobs.length === 0 ? (
            <div style={{ padding:'12px 16px' }}>
              <EmptyState icon={Icons.project} title="Create your first project" description="Track stages, tasks, documents and your team in one place." cta={{ label: 'New project', onClick: () => create.newProject() }} compact />
            </div>
          ) : jobs.map((j, i) => {
            const open = tasks.filter(t => t.job_id === j.id && t.status !== 'done').length
            return (
              <div key={j.id} onClick={()=>router.push(`/dashboard/jobs?job=${j.id}`)} style={{ padding:'14px 18px', borderBottom:i<jobs.length-1?`1px solid ${C.borderSubtle}`:'none', cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:9, fontSize:13.5, fontWeight:600 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:j.color }} />{j.name}
                  </span>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Tag label={j.status} color={jobStatusColor[j.status]} />
                    <span style={{ fontSize:12, color:C.muted }}>{open} open</span>
                  </div>
                </div>
                <ProgressBar value={j.completion} />
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:7, fontSize:11, color:C.muted }}><span>{j.phase}</span><span>{j.completion}%</span></div>
              </div>
            )
          })}
        </Card>

        {/* Widget 2 — Urgent Tasks */}
        <Card title={`Urgent Tasks · ${risks.length}`}>
          {risks.length === 0 && <div style={{ padding:'18px', fontSize:13, color:C.muted }}>All clear — nothing pressing.</div>}
          {risks.map((r, i) => {
            const job = jobs.find(j => j.id === r.task.job_id)
            return (
              <div key={r.task.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:i<risks.length-1?`1px solid ${C.borderSubtle}`:'none' }}>
                <StatusDot status={r.task.status} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.task.title}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{job?.name}{r.task.due_date ? ` · Due ${r.task.due_date}` : ''}</div>
                </div>
                <Tag label={r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d overdue` : r.daysLeft === 0 ? 'Due today' : `${r.daysLeft}d left`} color={r.daysLeft < 0 ? C.text : C.muted} bg={r.daysLeft < 0 ? C.highBg : 'transparent'} border={r.daysLeft < 0 ? C.highBorder : undefined} />
              </div>
            )
          })}
        </Card>

        {/* Widget 3 — Document Status */}
        <Card title="Document Status">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)' }}>
            {docCfg.map((c, i) => (
              <div key={c.label} style={{ padding:'18px', borderRight:i%2===0?`1px solid ${C.borderSubtle}`:'none', borderBottom:i<2?`1px solid ${C.borderSubtle}`:'none' }}>
                <div style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.03em' }}>{c.n}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Widget 4 — Team Availability */}
        <Card title="Team Availability">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
            <div style={{ padding:'20px', borderRight:`1px solid ${C.borderSubtle}` }}>
              <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.03em', color:C.accent }}>{available}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Available (no open tasks)</div>
            </div>
            <div style={{ padding:'20px' }}>
              <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.03em', color:C.muted }}>{busy}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Busy (4+ open)</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
