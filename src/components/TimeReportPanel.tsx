'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fmtDuration } from './TimeTracking'
import type { Job } from '@/lib/types'

const C = { bgCard:'#FFFFFF', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', accent:'#CC785C', accent2:'#B86A4E' }
const DAY = 24 * 60 * 60 * 1000

type TaskRef = { job_id: string; assignee_id: string | null }
export type TimeEntry = { duration_seconds: number; started_at: string; task: TaskRef | TaskRef[] | null }
function refOf(task: TimeEntry['task']): TaskRef | null { return Array.isArray(task) ? (task[0] || null) : task }

export default function TimeReportPanel({ jobs, crew, timeEntries }: { jobs: Pick<Job, 'id' | 'name'>[]; crew: { id: string; name: string }[]; timeEntries: TimeEntry[] }) {
  const now = Date.now()
  const jobName = new Map(jobs.map(j => [j.id, j.name]))
  const crewName = new Map(crew.map(c => [c.id, c.name]))

  // Per-project minutes this week / this month.
  const perProject = new Map<string, { week: number; month: number }>()
  const perMember = new Map<string, number>()
  for (const e of timeEntries) {
    const ref = refOf(e.task)
    const jid = ref?.job_id
    const age = now - new Date(e.started_at).getTime()
    const mins = Math.round((e.duration_seconds || 0) / 60)
    if (jid) {
      const cur = perProject.get(jid) || { week: 0, month: 0 }
      if (age <= 30 * DAY) cur.month += mins
      if (age <= 7 * DAY) cur.week += mins
      perProject.set(jid, cur)
    }
    const aid = ref?.assignee_id
    if (aid && age <= 30 * DAY) perMember.set(aid, (perMember.get(aid) || 0) + (e.duration_seconds || 0))
  }

  const chartData = jobs
    .map(j => ({ name: j.name.length > 16 ? j.name.slice(0, 16) + '…' : j.name, ...(perProject.get(j.id) || { week: 0, month: 0 }) }))
    .filter(d => d.week > 0 || d.month > 0)

  const memberRows = Array.from(perMember.entries()).map(([id, sec]) => ({ name: crewName.get(id) || 'Unknown', sec })).sort((a, b) => b.sec - a.sec)

  return (
    <div>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Time logged per project (minutes)</div>
        {chartData.length === 0 ? (
          <div style={{ fontSize:13, color:C.muted, padding:'12px 0' }}>No time logged yet. Start a timer on a task to track time.</div>
        ) : (
          <div style={{ width:'100%', height:280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip contentStyle={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="week" name="This week" fill={C.accent} radius={[3, 3, 0, 0]} />
                <Bar dataKey="month" name="This month" fill={C.accent2} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.borderSubtle}`, fontSize:13, fontWeight:600 }}>Time per team member (this month)</div>
        {memberRows.length === 0 && <div style={{ padding:'14px 18px', fontSize:13, color:C.muted }}>No time logged.</div>}
        {memberRows.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'11px 18px', borderBottom:i<memberRows.length-1?`1px solid ${C.borderSubtle}`:'none', fontSize:13 }}>
            <span>{m.name}</span><span style={{ color:C.sub, fontWeight:600 }}>{fmtDuration(m.sec)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
