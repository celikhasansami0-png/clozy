'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { relativeTime } from '@/lib/log'
import { useBus } from '@/lib/bus'
import EmptyState, { Icons } from './EmptyState'
import Pager, { PAGE_SIZE } from './Pager'
import type { ActivityLog } from '@/lib/types'

const C = { bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5' }

const VERB: Record<string, string> = {
  task_created: 'created task',
  task_status: 'updated status of',
  task_assigned: 'assigned',
  task_updated: 'edited',
  document_added: 'added document',
  permit_added: 'added document',
  permit_status: 'updated document',
  document_uploaded: 'uploaded',
  member_added: 'added team member',
  project_created: 'created project',
}

export default function ActivityFeed({ projectId }: { projectId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [page, setPage] = useState(0)

  useEffect(() => {
    supabase.from('activity_logs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { if (data) setLogs(data as ActivityLog[]) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  // Live append (logActivity emits this for the current project).
  useBus<ActivityLog>('bn:activity:add', l => { if (l.project_id === projectId) setLogs(prev => [l, ...prev]) })

  if (logs.length === 0) {
    return (
      <div style={{ padding:'18px 20px', flex:1 }}>
        <EmptyState icon={Icons.activity} title="No activity yet" description="Actions on this project — tasks and documents — will appear here." compact />
      </div>
    )
  }

  return (
    <div style={{ padding:'18px 20px', overflowY:'auto', flex:1 }}>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        {logs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((l, i, arr) => {
          const meta = l.metadata as { name?: string; actor?: string }
          const actor = (meta.actor || 'Me').toString()
          const initials = actor.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'ME'
          return (
            <div key={l.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:C.bgElevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:C.sub, flexShrink:0 }}>{initials}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, color:C.text }}>
                  <span style={{ fontWeight:600 }}>{actor}</span> {VERB[l.action] || l.action.replace(/_/g, ' ')}{meta.name ? <span style={{ color:C.sub }}> {meta.name}</span> : ''}
                </div>
                <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{relativeTime(l.created_at)}</div>
              </div>
            </div>
          )
        })}
      </div>
      <Pager page={page} total={logs.length} onPage={setPage} />
    </div>
  )
}
