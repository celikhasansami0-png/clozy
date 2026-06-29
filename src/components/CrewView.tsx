'use client'
import { Tag, StatusDot, Avatar } from './ui'
import type { CrewMember, Task } from '@/lib/types'

const C = { bgCard:'#0F0F0F', bgElevated:'#161616', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030' }

export default function CrewView({ crew, tasks, jobs }: { crew:CrewMember[], tasks:Task[], jobs:any[] }) {
  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Crew</div>
        <div style={{ fontSize:14, color:C.muted }}>Who's working what, and what's next.</div>
      </div>

      {crew.length === 0 && (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'24px', color:C.muted, fontSize:13 }}>
          No crew members yet.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {crew.map(c => {
          const assigned = tasks.filter(t => t.assignee_id === c.id)
          return (
            <div key={c.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <Avatar initials={c.initials} size={38} />
                <div>
                  <div style={{ fontSize:14, fontWeight:600 }}>{c.name}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{c.role}</div>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  <Tag label={`${assigned.length} tasks`} color={assigned.length>0?C.sub:C.muted} />
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {assigned.length === 0 && <div style={{ fontSize:12, color:C.dim, padding:'6px 0' }}>No open tasks</div>}
                {assigned.map(t => {
                  const job = jobs.find(j => j.id === t.job_id)
                  return (
                    <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:C.bgElevated, borderRadius:7, border:`1px solid ${C.borderSubtle}` }}>
                      <StatusDot status={t.status} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                        {job && <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{job.name}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
