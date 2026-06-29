'use client'
import { Tag, ProgressBar, StatusDot, jobStatusColor } from './ui'
import type { Job, Task, Permit, CrewMember } from '@/lib/types'
import { riskAlerts } from '@/lib/insights'
import { useNiche } from './NicheProvider'
import { useCreate } from './CreateProvider'
import EmptyState, { Icons } from './EmptyState'
import { useRouter } from 'next/navigation'

const C = { bg:'#080808', bgCard:'#0F0F0F', bgElevated:'#161616', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030', highBg:'rgba(242,242,242,0.07)', highBorder:'rgba(242,242,242,0.18)' }

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>{children}</div>
}
function Title({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:11, fontWeight:600, color:C.dim, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>{children}</div>
}

export default function DashboardHome({ jobs, tasks, permits, crew }: { jobs:Job[], tasks:Task[], permits:Permit[], crew:CrewMember[] }) {
  const { term, plural } = useNiche()
  const create = useCreate()
  const router = useRouter()

  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const done = tasks.filter(t => t.status === 'done').length
  const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length
  const risks = riskAlerts(tasks)
  const projects = plural(term.project)
  const taskWord = plural(term.task)

  const stats = [
    { label:`Active ${projects}`, value:jobs.length, dim:false },
    { label:'In Progress',        value:inProgress,  dim:false },
    { label:`Urgent ${taskWord}`, value:urgent,      dim:false },
    { label:'Completed',          value:done,        dim:true },
  ]

  function ProjectsWidget() {
    return (
      <div key="projects">
        <Title>Active {projects}</Title>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {jobs.length === 0 && (
            <EmptyState icon={Icons.project} title={`Start by creating your first ${term.project.toLowerCase()}`} description={`Add a ${term.project.toLowerCase()} to track stages, ${plural(term.task.toLowerCase())}, permits and documents.`} cta={{ label: `New ${term.project}`, onClick: () => create.newProject() }} />
          )}
          {jobs.map(j => {
            const open = tasks.filter(t => t.job_id === j.id && t.status !== 'done').length
            return (
              <div key={j.id} onClick={()=>router.push(`/dashboard/jobs?job=${j.id}`)} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 20px', cursor:'pointer', transition:'border-color 0.15s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='#A0A0A0'} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:9, fontSize:14, fontWeight:600 }}>
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
        </div>
      </div>
    )
  }

  function UrgentWidget({ openMode }: { openMode: boolean }) {
    const items = openMode
      ? tasks.filter(t => t.status !== 'done').slice(0, 6).map(t => ({ task: t, daysLeft: undefined as number | undefined }))
      : risks
    return (
      <div key="urgent">
        <Title>{openMode ? `Open ${taskWord}` : `Urgent ${taskWord}`}</Title>
        <Card>
          {items.length === 0 && <div style={{ padding:'20px 18px', fontSize:13, color:C.muted }}>All clear — nothing pressing.</div>}
          {items.map((r, i) => {
            const job = jobs.find(j => j.id === r.task.job_id)
            return (
              <div key={r.task.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:i<items.length-1?`1px solid ${C.borderSubtle}`:'none' }}>
                <StatusDot status={r.task.status} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{r.task.title}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{job?.name}{r.task.due_date ? ` · Due ${r.task.due_date}` : ''}</div>
                </div>
                {!openMode && r.daysLeft !== undefined && <Tag label={r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d overdue` : r.daysLeft === 0 ? 'Due today' : `${r.daysLeft}d left`} color={r.daysLeft < 0 ? C.text : C.muted} bg={r.daysLeft < 0 ? C.highBg : 'transparent'} border={r.daysLeft < 0 ? C.highBorder : undefined} />}
                {openMode && <Tag label={r.task.tag} />}
              </div>
            )
          })}
        </Card>
      </div>
    )
  }

  function PermitStatusWidget() {
    const cfg = [
      { label:'Approved', n: permits.filter(p=>p.status==='Approved').length },
      { label:'Under Review', n: permits.filter(p=>p.status==='Under Review').length },
      { label:'Pending', n: permits.filter(p=>p.status==='Pending').length },
      { label:'Rejected', n: permits.filter(p=>p.status==='Rejected').length },
    ]
    return (
      <div key="permits">
        <Title>Permit status</Title>
        <Card>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {cfg.map((c, i) => (
              <div key={c.label} style={{ padding:'16px 18px', borderRight:i<3?`1px solid ${C.borderSubtle}`:'none' }}>
                <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.03em' }}>{c.n}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  function TeamWidget() {
    return (
      <div key="team">
        <Title>{term.team} availability</Title>
        <Card>
          {crew.length === 0 && <div style={{ padding:'20px 18px', fontSize:13, color:C.muted }}>No {term.team.toLowerCase()} yet.</div>}
          {crew.map((c, i) => {
            const load = tasks.filter(t => t.assignee_id === c.id && t.status !== 'done').length
            return (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 18px', borderBottom:i<crew.length-1?`1px solid ${C.borderSubtle}`:'none' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:C.bgElevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:C.sub }}>{c.initials}</div>
                <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:500 }}>{c.name}</div><div style={{ fontSize:11, color:C.muted }}>{c.role}</div></div>
                <Tag label={load === 0 ? 'Available' : `${load} open`} color={load === 0 ? C.sub : C.muted} />
              </div>
            )
          })}
        </Card>
      </div>
    )
  }

  function MetricWidget({ keyName, title, value, unit }: { keyName: string; title: string; value: string | number; unit?: string }) {
    return (
      <div key={keyName}>
        <Title>{title}</Title>
        <Card><div style={{ padding:'22px 22px' }}><div style={{ fontSize:34, fontWeight:700, letterSpacing:'-0.04em' }}>{value}{unit}</div><div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{title}</div></div></Card>
      </div>
    )
  }

  function renderWidget(key: string) {
    switch (key) {
      case 'activeProjects': case 'activeSites': case 'activeAssets': case 'activeEngagements':
        return <ProjectsWidget key={key} />
      case 'urgentTasks':
        return <UrgentWidget key={key} openMode={false} />
      case 'openWorkOrders': case 'deliverables':
        return <UrgentWidget key={key} openMode />
      case 'permitStatus':
        return <PermitStatusWidget key={key} />
      case 'crewAvailability': case 'teamAvailability':
        return <TeamWidget key={key} />
      case 'uptime': {
        const uptime = jobs.length ? Math.round(jobs.reduce((s, j) => s + j.completion, 0) / jobs.length) : 0
        return <MetricWidget key={key} keyName={key} title="Avg. uptime" value={uptime} unit="%" />
      }
      case 'clientHealth': {
        const onTrack = jobs.filter(j => j.status === 'On Track' || j.status === 'Complete').length
        return <MetricWidget key={key} keyName={key} title="Healthy clients" value={`${onTrack}/${jobs.length}`} />
      }
      default:
        return null
    }
  }

  const { module } = useNiche()

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Welcome back</div>
        <div style={{ fontSize:14, color:C.muted }}>Here&apos;s where things stand across all active {projects.toLowerCase()}.</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'18px 20px' }}>
            <div style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.04em', color:s.dim?C.muted:C.text, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:12, color:C.muted, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        {module.dashboardWidgets.map(renderWidget)}
      </div>
    </div>
  )
}
