'use client'
import { useState } from 'react'
import { useCreate } from './CreateProvider'
import { useBus, evt, type ReplacePayload } from '@/lib/bus'
import type { Task, Job } from '@/lib/types'

const C = { bg:'#080808', bgCard:'#0F0F0F', bgElevated:'#161616', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030', accent:'#F2F2F2', accentBorder:'rgba(242,242,242,0.20)' }
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfWeek(d: Date) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0); return x }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function key(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

export default function ScheduleView({ tasks: initialTasks, jobs }: { tasks: Task[]; jobs: Job[] }) {
  const create = useCreate()
  const [tasks, setTasks] = useState(initialTasks)

  useBus<Task>(evt.add('task'), t => setTasks(prev => prev.some(x => x.id === t.id) ? prev : [...prev, t]))
  useBus<ReplacePayload<Task>>(evt.replace('task'), ({ tempId, row }) => setTasks(prev => prev.map(x => x.id === tempId ? row : x)))
  useBus<string>(evt.remove('task'), id => setTasks(prev => prev.filter(x => x.id !== id)))
  useBus<Task>(evt.update('task'), t => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x)))

  const jobColor = (id: string) => jobs.find(j => j.id === id)?.color || C.accent
  const today = key(new Date())
  const start = startOfWeek(new Date())
  const days = Array.from({ length: 28 }, (_, i) => addDays(start, i))
  const tasksOn = (d: Date) => tasks.filter(t => t.due_date && String(t.due_date).slice(0, 10) === key(d))

  const scheduled = tasks.filter(t => t.due_date).length

  return (
    <div style={{ padding:'24px 28px', overflowY:'auto', flex:1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Schedule</div>
          <div style={{ fontSize:14, color:C.muted }}>Tasks by due date — next 4 weeks. {scheduled} scheduled.</div>
        </div>
        <button onClick={()=>create.newTask()} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>+ New task</button>
      </div>

      {scheduled === 0 ? (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'40px 24px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
          <div style={{ fontSize:14, color:C.muted }}>Nothing scheduled. Create a task with a due date to see it here.</div>
          <button onClick={()=>create.newTask()} style={{ background:C.text, color:'#080808', border:'none', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>+ New task</button>
        </div>
      ) : (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ padding:'10px 0', textAlign:'center', fontSize:11, fontWeight:600, color:C.dim, textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:`1px solid ${C.border}` }}>{w}</div>
            ))}
            {days.map((d, i) => {
              const isToday = key(d) === today
              const dayTasks = tasksOn(d)
              return (
                <div key={i} style={{ minHeight:96, padding:'8px', borderRight:(i % 7 !== 6) ? `1px solid ${C.borderSubtle}` : 'none', borderBottom: i < 21 ? `1px solid ${C.borderSubtle}` : 'none', background: isToday ? 'rgba(242,242,242,0.04)' : 'transparent' }}>
                  <div style={{ fontSize:11, fontWeight:600, color: isToday ? C.accent : C.muted, marginBottom:6, display:'flex', justifyContent:'space-between' }}>
                    <span>{d.getDate()}</span>
                    {d.getDate() === 1 && <span style={{ color:C.dim }}>{d.toLocaleString('en', { month:'short' })}</span>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {dayTasks.slice(0, 3).map(t => (
                      <button key={t.id} onClick={()=>create.editTask(t)} title={t.title} style={{ display:'flex', alignItems:'center', gap:5, background:C.bgElevated, border:`1px solid ${C.borderSubtle}`, borderRadius:5, padding:'3px 6px', cursor:'pointer', textAlign:'left', fontFamily:'inherit', opacity: t.status === 'done' ? 0.5 : 1 }}>
                        <span style={{ width:5, height:5, borderRadius:'50%', background:jobColor(t.job_id), flexShrink:0 }} />
                        <span style={{ fontSize:10.5, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</span>
                      </button>
                    ))}
                    {dayTasks.length > 3 && <div style={{ fontSize:10, color:C.muted, paddingLeft:2 }}>+{dayTasks.length - 3} more</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
