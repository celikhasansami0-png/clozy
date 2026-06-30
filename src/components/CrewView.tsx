'use client'
import { useState } from 'react'
import { Tag, StatusDot, Avatar } from './ui'
import { useCreate } from './CreateProvider'
import { useBus, evt, type ReplacePayload } from '@/lib/bus'
import EmptyState, { Icons } from './EmptyState'
import ExportButton from './ExportButton'
import type { CrewMember, Task, Job } from '@/lib/types'

const C = { bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5' }

export default function CrewView({ crew: initialCrew, tasks, jobs }: { crew:CrewMember[], tasks:Task[], jobs:Job[] }) {
  const create = useCreate()
  const [crew, setCrew] = useState(initialCrew)

  useBus<CrewMember>(evt.add('member'), m => setCrew(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]))
  useBus<ReplacePayload<CrewMember>>(evt.replace('member'), ({ tempId, row }) => setCrew(prev => prev.map(x => x.id === tempId ? row : x)))
  useBus<string>(evt.remove('member'), id => setCrew(prev => prev.filter(x => x.id !== id)))

  const exportHeaders = ['Name', 'Role', 'Initials', 'Open Tasks']
  const exportRows = crew.map(c => [c.name, c.role, c.initials, tasks.filter(t => t.assignee_id === c.id && t.status !== 'done').length])

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Team</div>
          <div style={{ fontSize:14, color:C.muted }}>Who&apos;s working what, and what&apos;s next.</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <ExportButton filename="doppio-team" headers={exportHeaders} rows={exportRows} />
          <button onClick={()=>create.newMember()} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>+ Add member</button>
        </div>
      </div>

      {crew.length === 0 ? (
        <EmptyState icon={Icons.team} title="Invite your first team member" description="Add project managers, designers, developers and account managers so you can assign work." cta={{ label: 'Add Member', onClick: () => create.newMember() }} />
      ) : (
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
      )}
    </div>
  )
}
