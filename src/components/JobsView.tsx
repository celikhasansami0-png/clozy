'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tag, ProgressBar, StatusDot, Avatar, statusCfg, priorityCfg, jobStatusColor } from './ui'
import { createClient } from '@/lib/supabase'
import type { Job, Task, CrewMember } from '@/lib/types'

const C = { bg:'#080808', bgCard:'#0F0F0F', bgElevated:'#161616', bgHover:'#1C1C1C', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030' }

export default function JobsView({ jobs: initialJobs, tasks: initialTasks, crew }: { jobs:Job[], tasks:Task[], crew:CrewMember[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [jobs, setJobs] = useState(initialJobs)
  const [tasks, setTasks] = useState(initialTasks)
  const [activeJobId, setActiveJobId] = useState(searchParams.get('job') || initialJobs[0]?.id || '')
  const [activeTaskId, setActiveTaskId] = useState<string|null>(null)
  const [filter, setFilter] = useState('all')
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const job = jobs.find(j => j.id === activeJobId) || jobs[0]
  const jobTasks = tasks.filter(t => t.job_id === job?.id)
  const filtered = jobTasks.filter(t => filter === 'all' || t.status === filter)
  const activeTask = activeTaskId ? jobTasks.find(t => t.id === activeTaskId) : null

  async function updateTaskStatus(taskId: string, status: string) {
    await supabase.from('tasks').update({ status }).eq('id', taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? {...t, status: status as any} : t))
  }

  async function handleAI(e: React.FormEvent) {
    e.preventDefault()
    if (!aiInput.trim() || !job) return
    setAiLoading(true)
    // Simple AI parser - parse common commands
    const input = aiInput.toLowerCase()
    if (input.includes('create') || input.includes('add')) {
      const titleMatch = aiInput.match(/(?:create|add)\s+(?:task\s+)?["']?(.+?)["']?\s*(?:and|$)/i)
      const title = titleMatch?.[1] || aiInput.replace(/create|add|task/gi,'').trim()
      if (title) {
        const { data } = await supabase.from('tasks').insert({
          job_id: job.id,
          owner_id: (await supabase.auth.getUser()).data.user?.id,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          status: 'todo',
          priority: input.includes('urgent') ? 'urgent' : input.includes('high') ? 'high' : 'normal',
          tag: 'General',
        }).select('*, assignee:crew_members(*)').single()
        if (data) setTasks(prev => [...prev, data as Task])
      }
    }
    setAiInput('')
    setAiLoading(false)
  }

  if (!job) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:14 }}>
      No projects yet. Create one to get started.
    </div>
  )

  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
      {/* Project list */}
      <div style={{ width:255, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 14px', borderBottom:`1px solid ${C.borderSubtle}` }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.dim, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>All Projects</div>
          {jobs.map(j => (
            <div key={j.id} onClick={()=>{ setActiveJobId(j.id); setActiveTaskId(null); router.replace(`/dashboard/jobs?job=${j.id}`) }}
              style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:7, cursor:'pointer', marginBottom:2, background:activeJobId===j.id?C.bgElevated:'transparent', border:`1px solid ${activeJobId===j.id?C.border:'transparent'}`, transition:'all 0.1s' }}>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.name}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{tasks.filter(t=>t.job_id===j.id&&t.status!=='done').length} open · {j.completion}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px 12px', borderBottom:`1px solid ${C.borderSubtle}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em' }}>{job.name}</span>
            <Tag label={job.status} color={jobStatusColor[job.status]} />
          </div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>Phase: {job.phase} · {job.completion}% complete</div>
          <ProgressBar value={job.completion} />
        </div>

        <div style={{ display:'flex', padding:'0 20px', borderBottom:`1px solid ${C.borderSubtle}` }}>
          {['all','todo','in_progress','done'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ background:'none', border:'none', cursor:'pointer', padding:'10px 14px', fontSize:12, fontWeight:500, color:filter===f?C.text:C.muted, borderBottom:`2px solid ${filter===f?C.sub:'transparent'}`, marginBottom:-1, transition:'all 0.1s', fontFamily:'inherit' }}>
              {f==='all'?'All':statusCfg[f]?.label}
              <span style={{ marginLeft:5, fontSize:10, background:C.bgElevated, padding:'1px 5px', borderRadius:10, color:C.muted }}>{f==='all'?jobTasks.length:jobTasks.filter(t=>t.status===f).length}</span>
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
          {filtered.map(t => {
            const assignee = crew.find(c => c.id === t.assignee_id)
            return (
              <div key={t.id} onClick={()=>setActiveTaskId(activeTaskId===t.id?null:t.id)}
                style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 20px', cursor:'pointer', transition:'background 0.1s', background:activeTaskId===t.id?C.bgElevated:'transparent', borderBottom:`1px solid ${C.borderSubtle}` }}
                onMouseEnter={e=>{ if(activeTaskId!==t.id)e.currentTarget.style.background=C.bgHover }}
                onMouseLeave={e=>{ if(activeTaskId!==t.id)e.currentTarget.style.background='transparent' }}
              >
                <div onClick={e=>{ e.stopPropagation(); const next = t.status==='todo'?'in_progress':t.status==='in_progress'?'done':'todo'; updateTaskStatus(t.id,next) }}>
                  <StatusDot status={t.status} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:t.status==='done'?C.muted:C.text, textDecoration:t.status==='done'?'line-through':'none' }}>{t.title}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                    <Tag label={t.tag} />
                    {t.due_date && <span style={{ fontSize:11, color:C.dim }}>Due {t.due_date}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:priorityCfg[t.priority]?.color || C.muted, opacity:t.priority==='normal'?0.3:1 }} />
                  {assignee && <Avatar initials={assignee.initials} size={22} />}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding:'24px 20px', fontSize:13, color:C.muted }}>No tasks here.</div>
          )}
        </div>

        {/* AI bar */}
        <form onSubmit={handleAI} style={{ padding:'12px 20px', borderTop:`1px solid ${C.borderSubtle}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bgElevated, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px' }}>
            <span style={{ background:C.bgHover, color:C.sub, fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:4, flexShrink:0, border:`1px solid ${C.border}` }}>@Voltly</span>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder='add task "Torque module clamps — row 12" urgent…' style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:13, color:C.text, fontFamily:'inherit' }} />
            <button type="submit" disabled={aiLoading} style={{ width:26, height:26, background:C.text, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, border:'none', opacity:aiLoading?0.5:1 }}>
              <svg width="11" height="11" viewBox="0 0 12 12"><path d="M1 6h10M6 1l5 5-5 5" stroke="#080808" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </form>
      </div>

      {/* Task detail */}
      {activeTask && (
        <div style={{ width:285, borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.borderSubtle}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Task Detail</span>
            <button onClick={()=>setActiveTaskId(null)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:18, padding:0, lineHeight:1 }}>×</button>
          </div>
          <div style={{ padding:'16px 18px', overflowY:'auto', flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{activeTask.title}</div>
            {activeTask.due_date && <div style={{ fontSize:11, color:C.muted, marginBottom:18 }}>Due {activeTask.due_date}</div>}
            {[
              { label:'Status',   value:<Tag label={statusCfg[activeTask.status]?.label} color={statusCfg[activeTask.status]?.color} bg={statusCfg[activeTask.status]?.bg} border={statusCfg[activeTask.status]?.border} /> },
              { label:'Priority', value:<Tag label={priorityCfg[activeTask.priority]?.label} color={priorityCfg[activeTask.priority]?.color} /> },
              { label:'Phase',    value:<span style={{ fontSize:12, color:C.text }}>{activeTask.tag}</span> },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:`1px solid ${C.borderSubtle}` }}>
                <span style={{ fontSize:11, color:C.muted, fontWeight:500 }}>{row.label}</span>{row.value}
              </div>
            ))}
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:C.dim, fontWeight:600, marginBottom:10 }}>PV QA Checklist</div>
              {['Module torque to spec (mfr)','Rapid shutdown verified (690.12)','String voltage within inverter window','Grounding & bonding checked (690.43)'].map((item,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:`1px solid ${C.borderSubtle}`, fontSize:12, color:i<2?C.muted:C.text }}>
                  <div style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${i<2?C.sub:C.border}`, background:i<2?C.bgElevated:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:C.sub, flexShrink:0 }}>{i<2?'✓':''}</div>
                  <span style={{ textDecoration:i<2?'line-through':'none' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
