'use client'
import { useState } from 'react'
import { Tag, StatusDot, Avatar, statusCfg, priorityCfg } from './ui'
import { useCreate } from './CreateProvider'
import { useBus, evt, type ReplacePayload } from '@/lib/bus'
import EmptyState, { Icons } from './EmptyState'
import Pager, { PAGE_SIZE } from './Pager'
import type { Task, Job } from '@/lib/types'

const C = { bgCard:'#12141A', bgElevated:'#181B22', border:'#262A35', borderSubtle:'#1A1D24', text:'#F5F6F7', sub:'#9CA3AF', muted:'#5C6470', dim:'#2E3340' }

type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done'

export default function TasksView({ tasks: initial, jobs }: { tasks: Task[]; jobs: Pick<Job, 'id' | 'name' | 'color'>[] }) {
  const create = useCreate()
  const [tasks, setTasks] = useState(initial)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [project, setProject] = useState<string>('all')
  const [page, setPage] = useState(0)

  useBus<Task>(evt.add('task'), t => setTasks(prev => prev.some(x => x.id === t.id) ? prev : [t, ...prev]))
  useBus<ReplacePayload<Task>>(evt.replace('task'), ({ tempId, row }) => setTasks(prev => prev.map(x => x.id === tempId ? row : x)))
  useBus<string>(evt.remove('task'), id => setTasks(prev => prev.filter(x => x.id !== id)))
  useBus<Task>(evt.update('task'), t => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x)))

  const jobMap = new Map(jobs.map(j => [j.id, j]))
  const filtered = tasks.filter(t =>
    (status === 'all' || t.status === status) &&
    (project === 'all' || t.job_id === project)
  )
  const open = tasks.filter(t => t.status !== 'done').length

  const pill = (active: boolean): React.CSSProperties => ({
    background: active ? C.bgElevated : 'transparent', color: active ? C.text : C.muted,
    border:`1px solid ${active ? C.border : 'transparent'}`, borderRadius:7, padding:'5px 11px',
    fontSize:12.5, fontWeight:500, fontFamily:'inherit', cursor:'pointer',
  })

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Tasks</div>
          <div style={{ fontSize:14, color:C.muted }}>{open} open across {jobs.length} project{jobs.length === 1 ? '' : 's'}.</div>
        </div>
        <button onClick={()=>create.newTask()} style={{ background:'#4D7FFF', border:'none', color:'#FFFFFF', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>+ New task</button>
      </div>

      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:4 }}>
          {(['all','todo','in_progress','done'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(0) }} style={pill(status === s)}>{s === 'all' ? 'All' : statusCfg[s].label}</button>
          ))}
        </div>
        <select value={project} onChange={e => { setProject(e.target.value); setPage(0) }} style={{ background:C.bgElevated, color:C.sub, border:`1px solid ${C.border}`, borderRadius:7, padding:'6px 10px', fontSize:12.5, fontFamily:'inherit', cursor:'pointer', outline:'none' }}>
          <option value="all">All projects</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Icons.task} title="No tasks here" description="Create a task or adjust the filters above." cta={{ label: 'New task', onClick: () => create.newTask() }} />
      ) : (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          {filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((t, i, arr) => {
            const job = jobMap.get(t.job_id)
            const pr = priorityCfg[t.priority] || priorityCfg.normal
            return (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}>
                <StatusDot status={t.status} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2, display:'flex', alignItems:'center', gap:6 }}>
                    {job && <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><span style={{ width:6, height:6, borderRadius:'50%', background:job.color }} />{job.name}</span>}
                    {t.due_date && <span>· Due {t.due_date}</span>}
                  </div>
                </div>
                <Tag label={pr.label} color={pr.color} />
                {t.tag && <Tag label={t.tag} />}
                {t.assignee && <Avatar initials={t.assignee.initials} size={24} />}
              </div>
            )
          })}
          <Pager page={page} total={filtered.length} onPage={setPage} />
        </div>
      )}
    </div>
  )
}
