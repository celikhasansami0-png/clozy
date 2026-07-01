'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tag, ProgressBar, StatusDot, Avatar, statusCfg, priorityCfg, jobStatusColor } from './ui'
import { createClient } from '@/lib/supabase'
import { suggestAssignee } from '@/lib/insights'
import { useCreate } from './CreateProvider'
import { useNiche } from './NicheProvider'
import { logActivity, notify } from '@/lib/log'
import { syncCalendar } from '@/lib/integrationClient'
import { useBus, emit, evt, type ReplacePayload } from '@/lib/bus'
import DocumentsPanel from './DocumentsPanel'
import ActivityFeed from './ActivityFeed'
import EmptyState, { Icons } from './EmptyState'
import DeleteProjectModal from './DeleteProjectModal'
import Pager, { PAGE_SIZE } from './Pager'
import ExportButton from './ExportButton'
import TaskComments from './TaskComments'
import ShareClientButton from './ShareClientButton'
import { TimerIcon, TaskTotalTime } from './TimeTracking'
import type { Job, Task, CrewMember } from '@/lib/types'

const C = { bg:'#FAF9F5', bgCard:'#FFFFFF', bgElevated:'#F0EEE6', bgHover:'#E8E5DC', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5' }

export default function JobsView({ jobs: initialJobs, tasks: initialTasks, crew, ownerId, uploaderName }: { jobs:Job[], tasks:Task[], crew:CrewMember[], ownerId:string, uploaderName:string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const create = useCreate()
  const { term, plural } = useNiche()

  const [jobs, setJobs] = useState(initialJobs)
  const [tasks, setTasks] = useState(initialTasks)
  const [activeJobId, setActiveJobId] = useState(searchParams.get('job') || initialJobs[0]?.id || '')
  const [activeTab, setActiveTab] = useState<'tasks'|'documents'|'activity'>(searchParams.get('tab') === 'documents' ? 'documents' : 'tasks')
  const [activeTaskId, setActiveTaskId] = useState<string|null>(null)
  const [filter, setFilter] = useState('all')
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiNote, setAiNote] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [menuJobId, setMenuJobId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null)
  const [taskPage, setTaskPage] = useState(0)
  const [projPage, setProjPage] = useState(0)
  const [toast, setToastRaw] = useState('')
  function setToast(msg: string) { setToastRaw(msg); setTimeout(() => setToastRaw(''), 2500) }

  // Keep tasks fresh by refetching when the window regains focus (realtime is
  // reserved for the notification bell only).
  useEffect(() => {
    function refetch() {
      supabase.from('tasks').select('*, assignee:crew_members(*)').eq('owner_id', ownerId).order('created_at').limit(500)
        .then(({ data }) => { if (data) setTasks(data as Task[]) })
    }
    window.addEventListener('focus', refetch)
    return () => window.removeEventListener('focus', refetch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId])

  // Optimistic updates via the in-app event bus.
  useBus<Task>(evt.add('task'), t => setTasks(prev => prev.some(x => x.id === t.id) ? prev : [...prev, t]))
  useBus<ReplacePayload<Task>>(evt.replace('task'), ({ tempId, row }) => setTasks(prev => prev.map(x => x.id === tempId ? row : x)))
  useBus<string>(evt.remove('task'), id => setTasks(prev => prev.filter(x => x.id !== id)))
  useBus<Task>(evt.update('task'), t => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x)))
  useBus<Job>(evt.add('project'), j => setJobs(prev => prev.some(x => x.id === j.id) ? prev : [...prev, j]))
  useBus<ReplacePayload<Job>>(evt.replace('project'), ({ tempId, row }) => setJobs(prev => prev.map(x => x.id === tempId ? row : x)))
  useBus<string>(evt.remove('project'), id => setJobs(prev => prev.filter(x => x.id !== id)))

  const job = jobs.find(j => j.id === activeJobId) || jobs[0]
  const jobTasks = tasks.filter(t => t.job_id === job?.id)
  const filtered = jobTasks.filter(t => filter === 'all' || t.status === filter)
  const pagedTasks = filtered.slice(taskPage * PAGE_SIZE, taskPage * PAGE_SIZE + PAGE_SIZE)
  const visibleJobs = jobs.filter(j => showArchived ? j.is_archived : !j.is_archived)
  const pagedJobs = visibleJobs.slice(projPage * PAGE_SIZE, projPage * PAGE_SIZE + PAGE_SIZE)
  const activeTask = activeTaskId ? jobTasks.find(t => t.id === activeTaskId) : null

  useEffect(() => { setTaskPage(0) }, [filter, activeJobId, activeTab])
  useEffect(() => { setProjPage(0) }, [showArchived])

  async function updateTaskStatus(taskId: string, status: string) {
    const t = tasks.find(x => x.id === taskId)
    setTasks(prev => prev.map(x => x.id === taskId ? { ...x, status: status as Task['status'] } : x))
    await supabase.from('tasks').update({ status }).eq('id', taskId)
    syncCalendar(taskId, status === 'done' ? 'delete' : 'upsert')
    if (t) {
      logActivity(supabase, { projectId: t.job_id, ownerId, action: 'task_status', entityType: 'task', entityId: taskId, metadata: { name: `"${t.title}" → ${status.replace('_', ' ')}`, actor: 'You' } })
      if (status === 'done') {
        const jobTasksAfter = tasks.filter(x => x.job_id === t.job_id).map(x => x.id === taskId ? { ...x, status } : x)
        if (jobTasksAfter.every(x => x.status === 'done')) {
          const j = jobs.find(x => x.id === t.job_id)
          if (j) notify(supabase, ownerId, { title: 'Project complete', body: `All ${plural(term.task.toLowerCase())} done on ${j.name}`, type: 'project', link: `/dashboard/jobs?job=${j.id}` })
        }
      }
    }
  }

  // ── Bulk actions ──
  function toggleSel(id: string) { setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  function clearSel() { setSelected(new Set()); setBulkDeleteConfirm(false) }
  async function bulkUpdate(patch: Partial<Task>) {
    const ids = Array.from(selected)
    setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, ...patch } : t))
    await supabase.from('tasks').update(patch).in('id', ids)
    clearSel()
  }
  async function bulkDelete() {
    const ids = Array.from(selected)
    setTasks(prev => prev.filter(t => !ids.includes(t.id)))
    await supabase.from('tasks').delete().in('id', ids)
    clearSel()
  }

  // ── Project actions (duplicate / archive / delete) ──
  async function duplicateProject(j: Job) {
    setMenuJobId(null)
    const { data: np } = await supabase.from('jobs').insert({ owner_id: ownerId, niche: j.niche || 'general', name: `${j.name} copy`, color: j.color, status: 'In Progress', phase: j.phase, completion: 0, metadata: j.metadata || {} }).select('*').single()
    if (!np) return
    const newJob = np as Job
    setJobs(prev => prev.some(x => x.id === newJob.id) ? prev : [...prev, newJob])
    emit(evt.add('project'), newJob)
    const src = tasks.filter(t => t.job_id === j.id)
    if (src.length) {
      const copies = src.map(t => ({ job_id: newJob.id, owner_id: ownerId, title: t.title, status: 'todo', priority: t.priority, assignee_id: null, due_date: t.due_date, tag: t.tag }))
      const { data: nt } = await supabase.from('tasks').insert(copies).select('*, assignee:crew_members(*)')
      if (nt) setTasks(prev => [...prev, ...(nt as Task[])])
    }
    setActiveJobId(newJob.id)
  }
  async function saveAsTemplate(j: Job) {
    setMenuJobId(null)
    const { count } = await supabase.from('project_templates').select('id', { count: 'exact', head: true }).eq('owner_id', ownerId)
    if ((count || 0) >= 20) { setToast('Template limit (20) reached.'); return }
    const start = new Date(j.created_at).getTime()
    const src = tasks.filter(t => t.job_id === j.id)
    const templateTasks = src.map(t => ({
      title: t.title, priority: t.priority, tag: t.tag,
      due_offset_days: t.due_date ? Math.max(0, Math.round((new Date(t.due_date).getTime() - start) / 86400000)) : 0,
    }))
    await supabase.from('project_templates').insert({
      owner_id: ownerId, name: `${j.name} template`, description: `Saved from ${j.name}`,
      task_count: templateTasks.length, template_data: { tasks: templateTasks },
    })
    setToast('Saved as template.')
  }
  async function archiveProject(j: Job) {
    setMenuJobId(null)
    setJobs(prev => prev.map(x => x.id === j.id ? { ...x, is_archived: true } : x))
    if (activeJobId === j.id) setActiveJobId(jobs.find(x => x.id !== j.id && !x.is_archived)?.id || '')
    await supabase.from('jobs').update({ is_archived: true }).eq('id', j.id)
  }
  async function confirmDeleteProject(j: Job) {
    setDeleteTarget(null)
    setJobs(prev => prev.filter(x => x.id !== j.id))
    emit(evt.remove('project'), j.id)
    if (activeJobId === j.id) setActiveJobId(jobs.find(x => x.id !== j.id)?.id || '')
    await supabase.from('jobs').delete().eq('id', j.id)
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
        // Auto-assign: suggest the least-loaded team member.
        const suggested = suggestAssignee(crew, tasks)
        const { data } = await supabase.from('tasks').insert({
          job_id: job.id,
          owner_id: (await supabase.auth.getUser()).data.user?.id,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          status: 'todo',
          priority: input.includes('urgent') ? 'urgent' : input.includes('high') ? 'high' : 'normal',
          assignee_id: suggested?.id ?? null,
          tag: 'General',
        }).select('*, assignee:crew_members(*)').single()
        if (data) {
          const row = data as Task
          setTasks(prev => prev.some(t => t.id === row.id) ? prev : [...prev, row])
          if (suggested) setAiNote(`Auto-assigned to ${suggested.name} (lightest workload)`)
          logActivity(supabase, { projectId: job.id, ownerId, action: 'task_created', entityType: 'task', entityId: row.id, metadata: { name: `"${row.title}"`, actor: 'You' } })
          if (suggested) notify(supabase, ownerId, { title: `${term.task} assigned`, body: `"${row.title}" → ${suggested.name}`, type: 'task', link: `/dashboard/jobs?job=${job.id}` })
        }
      }
    }
    setAiInput('')
    setAiLoading(false)
  }

  if (!job) return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, color:C.muted, fontSize:14, padding:24, textAlign:'center' }}>
      <div>No projects yet. Create your first project to get started.</div>
      <button onClick={()=>create.newProject()} style={{ background:'#CC785C', color:'#FFFFFF', border:'none', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>+ New project</button>
    </div>
  )

  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
      {/* Project list */}
      <div style={{ width:255, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 14px', flex:1, overflowY:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, gap:6 }}>
            <div style={{ fontSize:11, fontWeight:600, color:C.dim, textTransform:'uppercase', letterSpacing:'0.08em' }}>{showArchived ? 'Archived' : 'All'} {plural(term.project)}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <ExportButton filename="doppio-projects" headers={['Project','Status','Phase','Completion %','Open Tasks']} rows={pagedJobs.map(j => [j.name, j.status, j.phase, j.completion, tasks.filter(t=>t.job_id===j.id&&t.status!=='done').length])} />
              <button onClick={()=>setShowArchived(v=>!v)} style={{ background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:5, padding:'2px 8px', fontSize:10, fontFamily:'inherit', cursor:'pointer' }}>{showArchived ? 'Active' : 'Archived'}</button>
            </div>
          </div>
          {pagedJobs.map(j => (
            <div key={j.id} onClick={()=>{ setActiveJobId(j.id); setActiveTaskId(null); router.replace(`/dashboard/jobs?job=${j.id}`) }}
              style={{ position:'relative', display:'flex', alignItems:'center', gap:6, padding:'8px 10px', borderRadius:7, cursor:'pointer', marginBottom:2, background:activeJobId===j.id?C.bgElevated:'transparent', border:`1px solid ${activeJobId===j.id?C.border:'transparent'}`, transition:'all 0.1s' }}>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.name}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{tasks.filter(t=>t.job_id===j.id&&t.status!=='done').length} open · {j.completion}%</div>
              </div>
              <button onClick={e=>{ e.stopPropagation(); setMenuJobId(menuJobId===j.id?null:j.id) }} aria-label="Project actions" style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', padding:'2px 4px', fontSize:15, lineHeight:1, flexShrink:0 }}>⋯</button>
              {menuJobId === j.id && (
                <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:34, right:6, zIndex:10, width:180, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, boxShadow:'0 8px 24px rgba(60,50,40,0.15)', overflow:'hidden' }}>
                  {([['Duplicate project', ()=>duplicateProject(j)], ['Save as template', ()=>saveAsTemplate(j)], ['Archive project', ()=>archiveProject(j)], ['Delete', ()=>{ setMenuJobId(null); setDeleteTarget(j) }]] as [string, ()=>void][]).map(([label, fn]) => (
                    <button key={label} onClick={fn} style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'9px 14px', fontSize:13, color: label==='Delete'?'#C2574A':C.text, fontFamily:'inherit', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background=C.bgElevated} onMouseLeave={e=>e.currentTarget.style.background='none'}>{label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {visibleJobs.length === 0 && (
            <div style={{ fontSize:12, color:C.dim, padding:'8px 10px' }}>No {showArchived ? 'archived' : 'active'} {plural(term.project.toLowerCase())}.</div>
          )}
          <Pager page={projPage} total={visibleJobs.length} onPage={setProjPage} />
        </div>
      </div>
      {menuJobId && <div onClick={()=>setMenuJobId(null)} style={{ position:'fixed', inset:0, zIndex:5 }} />}

      {/* Task list */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px 12px', borderBottom:`1px solid ${C.borderSubtle}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em' }}>{job.name}</span>
            <Tag label={job.status} color={jobStatusColor[job.status]} />
            <div style={{ marginLeft:'auto' }}><ShareClientButton jobId={job.id} /></div>
          </div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>Phase: {job.phase} · {job.completion}% complete</div>
          <ProgressBar value={job.completion} />
        </div>

        {/* Project-level tabs */}
        <div style={{ display:'flex', padding:'0 20px', borderBottom:`1px solid ${C.borderSubtle}`, gap:2 }}>
          {([['tasks', plural(term.task)], ['documents', 'Documents'], ['activity', 'Activity']] as const).map(([t, label]) => (
            <button key={t} onClick={()=>{ setActiveTab(t); setActiveTaskId(null) }} style={{ background:'none', border:'none', cursor:'pointer', padding:'11px 14px', fontSize:13, fontWeight:600, color:activeTab===t?C.text:C.muted, borderBottom:`2px solid ${activeTab===t?C.text:'transparent'}`, marginBottom:-1, fontFamily:'inherit' }}>{label}</button>
          ))}
        </div>

        {activeTab === 'documents' && <DocumentsPanel projectId={job.id} ownerId={ownerId} uploaderName={uploaderName} />}
        {activeTab === 'activity' && <ActivityFeed projectId={job.id} />}

        {activeTab === 'tasks' && (<>
        <div style={{ display:'flex', padding:'0 20px', borderBottom:`1px solid ${C.borderSubtle}` }}>
          {['all','todo','in_progress','done'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ background:'none', border:'none', cursor:'pointer', padding:'10px 14px', fontSize:12, fontWeight:500, color:filter===f?C.text:C.muted, borderBottom:`2px solid ${filter===f?C.sub:'transparent'}`, marginBottom:-1, transition:'all 0.1s', fontFamily:'inherit' }}>
              {f==='all'?'All':statusCfg[f]?.label}
              <span style={{ marginLeft:5, fontSize:10, background:C.bgElevated, padding:'1px 5px', borderRadius:10, color:C.muted }}>{f==='all'?jobTasks.length:jobTasks.filter(t=>t.status===f).length}</span>
            </button>
          ))}
        </div>

        {filtered.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 20px', borderBottom:`1px solid ${C.borderSubtle}` }}>
            <input type="checkbox" checked={selected.size > 0 && filtered.every(t => selected.has(t.id))} onChange={e => setSelected(e.target.checked ? new Set(filtered.map(t => t.id)) : new Set())} style={{ accentColor:'#1F1E1C', cursor:'pointer' }} />
            <span style={{ fontSize:11, color:C.muted }}>{selected.size > 0 ? `${selected.size} selected` : 'Select all'}</span>
          </div>
        )}
        <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
          {pagedTasks.map(t => {
            const assignee = crew.find(c => c.id === t.assignee_id)
            const checked = selected.has(t.id)
            return (
              <div key={t.id} onClick={()=>setActiveTaskId(activeTaskId===t.id?null:t.id)}
                style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 20px', cursor:'pointer', transition:'background 0.1s', background: checked||activeTaskId===t.id?C.bgElevated:'transparent', borderBottom:`1px solid ${C.borderSubtle}` }}
                onMouseEnter={e=>{ if(activeTaskId!==t.id && !checked)e.currentTarget.style.background=C.bgHover }}
                onMouseLeave={e=>{ if(activeTaskId!==t.id && !checked)e.currentTarget.style.background='transparent' }}
              >
                <input type="checkbox" checked={checked} onClick={e=>e.stopPropagation()} onChange={()=>toggleSel(t.id)} style={{ marginTop:3, accentColor:'#1F1E1C', cursor:'pointer', flexShrink:0 }} />
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
                  <TimerIcon taskId={t.id} title={t.title} />
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding:'20px' }}>
              <EmptyState icon={Icons.task} title={`Add your first ${term.task.toLowerCase()}`} description={`No ${plural(term.task.toLowerCase())} here yet.`} cta={{ label: `New ${term.task}`, onClick: () => create.newTask(job.id) }} compact />
            </div>
          )}
          <Pager page={taskPage} total={filtered.length} onPage={setTaskPage} />
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderTop:`1px solid ${C.border}`, background:C.bgElevated, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{selected.size} selected</span>
            <select defaultValue="__ph" onChange={e=>{ const v=e.target.value; if(v==='__ph')return; bulkUpdate({ status:v as Task['status'] }); e.target.value='__ph' }} style={{ background:C.bgCard, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, padding:'5px 8px', fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>
              <option value="__ph" disabled>Status…</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option>
            </select>
            {bulkDeleteConfirm ? (
              <button onClick={bulkDelete} style={{ background:'rgba(194,87,74,0.12)', border:'1px solid rgba(194,87,74,0.4)', color:'#C2574A', borderRadius:6, padding:'5px 10px', fontSize:12, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>Confirm delete</button>
            ) : (
              <button onClick={()=>setBulkDeleteConfirm(true)} style={{ background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'5px 10px', fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>Delete</button>
            )}
            <button onClick={clearSel} style={{ marginLeft:'auto', background:'none', border:'none', color:C.muted, fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>Clear</button>
          </div>
        )}

        {/* AI bar */}
        <form onSubmit={handleAI} style={{ padding:'12px 20px', borderTop:`1px solid ${C.borderSubtle}` }}>
          {aiNote && <div style={{ fontSize:11, color:C.sub, marginBottom:8 }}>✦ {aiNote}</div>}
          <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bgElevated, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px' }}>
            <span style={{ background:C.bgHover, color:C.sub, fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:4, flexShrink:0, border:`1px solid ${C.border}` }}>@Doppio</span>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder='add task "Torque module clamps — row 12" urgent…' style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:13, color:C.text, fontFamily:'inherit' }} />
            <button type="submit" disabled={aiLoading} style={{ width:26, height:26, background:'#CC785C', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, border:'none', opacity:aiLoading?0.5:1 }}>
              <svg width="11" height="11" viewBox="0 0 12 12"><path d="M1 6h10M6 1l5 5-5 5" stroke="#FAF9F5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </form>
        </>)}
      </div>

      {/* Task detail */}
      {activeTab === 'tasks' && activeTask && (
        <div style={{ width:285, borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.borderSubtle}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Task Detail</span>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={()=>create.editTask(activeTask)} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.sub, cursor:'pointer', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:5, fontFamily:'inherit' }}>Edit</button>
              <button onClick={()=>setActiveTaskId(null)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:18, padding:0, lineHeight:1 }}>×</button>
            </div>
          </div>
          <div style={{ padding:'16px 18px', overflowY:'auto', flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{activeTask.title}</div>
            {activeTask.due_date && <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>Due {activeTask.due_date}</div>}
            <div style={{ marginBottom:18 }}><TaskTotalTime taskId={activeTask.id} /></div>
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
              <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:C.dim, fontWeight:600, marginBottom:10 }}>QA Checklist</div>
              {['Requirements confirmed with owner','Dependencies identified','Work reviewed against spec','Sign-off recorded'].map((item,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:`1px solid ${C.borderSubtle}`, fontSize:12, color:i<2?C.muted:C.text }}>
                  <div style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${i<2?C.sub:C.border}`, background:i<2?C.bgElevated:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:C.sub, flexShrink:0 }}>{i<2?'✓':''}</div>
                  <span style={{ textDecoration:i<2?'line-through':'none' }}>{item}</span>
                </div>
              ))}
            </div>
            <TaskComments taskId={activeTask.id} ownerId={ownerId} taskTitle={activeTask.title} crew={crew} />
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteProjectModal job={deleteTarget} label={term.project} onClose={()=>setDeleteTarget(null)} onConfirm={()=>confirmDeleteProject(deleteTarget)} />
      )}
      {toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:80, background:'#1F1E1C', color:'#FAF9F5', borderRadius:8, padding:'10px 16px', fontSize:13, boxShadow:'0 8px 24px rgba(60,50,40,0.2)' }}>{toast}</div>
      )}
    </div>
  )
}
