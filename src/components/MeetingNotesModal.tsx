'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Modal from './Modal'
import { emit, evt } from '@/lib/bus'
import type { Task, Job, CrewMember } from '@/lib/types'

const C = { bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', accent:'#CC785C', err:'#C2574A' }
type Item = { title: string; assignee: string | null; due_date: string | null; priority: string; assigneeId: string }

const inputS: React.CSSProperties = { background:'#FFFFFF', border:`1px solid ${C.border}`, borderRadius:6, padding:'6px 8px', fontSize:12.5, color:C.text, fontFamily:'inherit', outline:'none', colorScheme:'light' }

export default function MeetingNotesModal({ jobs, crew, defaultProjectId, onClose }: { jobs: Pick<Job, 'id' | 'name'>[]; crew: CrewMember[]; defaultProjectId: string; onClose: () => void }) {
  const supabase = createClient()
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<Item[] | null>(null)
  const [project, setProject] = useState(defaultProjectId || jobs[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function process() {
    if (!notes.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/meeting-notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error === 'rate_limited' ? 'Daily AI limit (20) reached.' : (json.error || 'Failed'))
      const mapped: Item[] = (json.items || []).map((it: { title: string; assignee: string | null; due_date: string | null; priority: string }) => {
        const match = it.assignee ? crew.find(c => c.name.toLowerCase() === (it.assignee || '').toLowerCase()) : undefined
        return { ...it, assigneeId: match?.id || '' }
      })
      setItems(mapped)
      if (mapped.length === 0) setError('No action items found in those notes.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    setLoading(false)
  }

  function update(i: number, patch: Partial<Item>) { setItems(prev => (prev || []).map((it, idx) => idx === i ? { ...it, ...patch } : it)) }

  async function createAll() {
    if (!items || !project) return
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCreating(false); return }
    const rows = items.map(it => ({ job_id: project, owner_id: user.id, title: it.title, status: 'todo', priority: ['urgent', 'high', 'normal'].includes(it.priority) ? it.priority : 'normal', assignee_id: it.assigneeId || null, due_date: it.due_date || null, tag: 'Planning' }))
    const { data } = await supabase.from('tasks').insert(rows).select('*, assignee:crew_members(*)')
    for (const t of (data || []) as Task[]) emit(evt.add('task'), t)
    setCreating(false); onClose()
  }

  return (
    <Modal title="Meeting Notes → Action Items" subtitle="Paste notes and let AI extract tasks" onClose={onClose} width={620}>
      {!items ? (
        <div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Paste your raw meeting notes here…" rows={9}
            style={{ width:'100%', ...inputS, padding:'10px 12px', fontSize:13, resize:'vertical', lineHeight:1.5 }} />
          {error && <div style={{ fontSize:12, color:C.err, marginTop:8 }}>{error}</div>}
          <button onClick={process} disabled={loading || !notes.trim()} style={{ marginTop:12, background:C.accent, border:'none', color:'#FFFFFF', borderRadius:8, padding:'10px 16px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer', opacity:(loading||!notes.trim())?0.6:1 }}>{loading ? 'Processing…' : '✦ Process with AI'}</button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>{items.length} action item(s) extracted. Review and edit before creating.</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:340, overflowY:'auto', marginBottom:14 }}>
            {items.map((it, i) => (
              <div key={i} style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:'10px', display:'grid', gridTemplateColumns:'1fr', gap:6 }}>
                <input value={it.title} onChange={e => update(i, { title: e.target.value })} style={{ ...inputS, fontWeight:600 }} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                  <select value={it.assigneeId} onChange={e => update(i, { assigneeId: e.target.value })} style={{ ...inputS, cursor:'pointer' }}>
                    <option value="">Unassigned</option>
                    {crew.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input type="date" value={it.due_date || ''} onChange={e => update(i, { due_date: e.target.value || null })} style={{ ...inputS, cursor:'pointer' }} />
                  <select value={it.priority} onChange={e => update(i, { priority: e.target.value })} style={{ ...inputS, cursor:'pointer' }}>
                    {['urgent', 'high', 'normal'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:12, color:C.muted }}>Add to:</span>
            <select value={project} onChange={e => setProject(e.target.value)} style={{ ...inputS, cursor:'pointer', flex:1 }}>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
            <button onClick={createAll} disabled={creating || !project} style={{ background:C.accent, border:'none', color:'#FFFFFF', borderRadius:8, padding:'9px 15px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer', opacity:creating?0.6:1, flexShrink:0 }}>{creating ? 'Creating…' : `Create ${items.length} Tasks`}</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
