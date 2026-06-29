'use client'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Icons } from './EmptyState'

const C = { bg:'rgba(0,0,0,0.7)', bgCard:'#0F0F0F', bgElevated:'#161616', bgHover:'#1C1C1C', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030' }
const RECENT_KEY = 'bn:recent-searches'

type Result = { id: string; label: string; sub?: string; type: 'project' | 'task' | 'permit' | 'document'; href: string }

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return <>{text}</>
  return (
    <>{text.slice(0, i)}<span style={{ background:'rgba(242,242,242,0.16)', color:'#fff', borderRadius:2 }}>{text.slice(i, i + q.length)}</span>{text.slice(i + q.length)}</>
  )
}

const TYPE_META: Record<Result['type'], { icon: ReactNode; label: string }> = {
  project: { icon: Icons.project, label: 'Projects' },
  task: { icon: Icons.task, label: 'Tasks' },
  permit: { icon: Icons.permit, label: 'Permits' },
  document: { icon: Icons.doc, label: 'Documents' },
}

export default function SearchOverlay({ userId, open, onClose }: { userId: string; open: boolean; onClose: () => void }) {
  const supabase = createClient()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30)
      try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')) } catch { setRecent([]) }
    } else { setQ(''); setDebounced(''); setResults([]) }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Debounce 300ms.
  useEffect(() => { const t = setTimeout(() => setDebounced(q.trim()), 300); return () => clearTimeout(t) }, [q])

  useEffect(() => {
    if (!debounced) { setResults([]); return }
    let cancelled = false
    setLoading(true)
    const like = `%${debounced}%`
    Promise.all([
      supabase.from('jobs').select('id,name').eq('owner_id', userId).ilike('name', like).limit(6),
      supabase.from('tasks').select('id,title,job_id').eq('owner_id', userId).ilike('title', like).limit(6),
      supabase.from('permits').select('id,permit_number,type').eq('owner_id', userId).ilike('permit_number', like).limit(6),
      supabase.from('documents').select('id,file_name,project_id').eq('owner_id', userId).ilike('file_name', like).limit(6),
    ]).then(([jobs, tasks, permits, docs]) => {
      if (cancelled) return
      const out: Result[] = []
      ;(jobs.data || []).forEach((j: { id: string; name: string }) => out.push({ id: j.id, label: j.name, type: 'project', href: `/dashboard/jobs?job=${j.id}` }))
      ;(tasks.data || []).forEach((t: { id: string; title: string; job_id: string }) => out.push({ id: t.id, label: t.title, type: 'task', href: `/dashboard/jobs?job=${t.job_id}` }))
      ;(permits.data || []).forEach((p: { id: string; permit_number: string; type: string }) => out.push({ id: p.id, label: p.permit_number, sub: p.type, type: 'permit', href: `/dashboard/permits` }))
      ;(docs.data || []).forEach((d: { id: string; file_name: string; project_id: string }) => out.push({ id: d.id, label: d.file_name, type: 'document', href: `/dashboard/jobs?job=${d.project_id}&tab=documents` }))
      setResults(out)
      setLoading(false)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, userId])

  const grouped = useMemo(() => {
    const g: Record<string, Result[]> = {}
    for (const r of results) (g[r.type] ||= []).push(r)
    return g
  }, [results])

  function go(r: Result) {
    const next = [debounced, ...recent.filter(x => x !== debounced)].filter(Boolean).slice(0, 5)
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch { /* ignore */ }
    onClose()
    router.push(r.href)
  }

  if (!open) return null
  return (
    <div onMouseDown={onClose} style={{ position:'fixed', inset:0, zIndex:80, background:C.bg, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'80px 20px' }}>
      <div onMouseDown={e => e.stopPropagation()} style={{ width:600, maxWidth:'100%', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderBottom:`1px solid ${C.borderSubtle}` }}>
          <span style={{ color:C.muted, display:'flex' }}>{Icons.search}</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects, tasks, permits, documents…" style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:15, color:C.text, fontFamily:'inherit' }} />
          <kbd style={{ fontSize:11, color:C.muted, border:`1px solid ${C.border}`, borderRadius:5, padding:'2px 6px' }}>Esc</kbd>
        </div>

        <div style={{ maxHeight:'56vh', overflowY:'auto', padding:'8px 0' }}>
          {!debounced ? (
            recent.length > 0 ? (
              <>
                <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:C.dim, fontWeight:600, padding:'8px 18px 4px' }}>Recent searches</div>
                {recent.map(r => (
                  <button key={r} onClick={() => setQ(r)} style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'9px 18px', fontSize:13, color:C.sub, fontFamily:'inherit', cursor:'pointer' }} onMouseEnter={e => e.currentTarget.style.background=C.bgElevated} onMouseLeave={e => e.currentTarget.style.background='none'}>{r}</button>
                ))}
              </>
            ) : <div style={{ padding:'40px 20px', textAlign:'center', fontSize:13, color:C.muted }}>Type to search across your workspace.</div>
          ) : loading && results.length === 0 ? (
            <div style={{ padding:'30px 20px', textAlign:'center', fontSize:13, color:C.muted }}>Searching…</div>
          ) : results.length === 0 ? (
            <div style={{ padding:'40px 20px', textAlign:'center' }}>
              <div style={{ fontSize:13, color:C.sub, fontWeight:600 }}>No results for “{debounced}”</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>Try a different name or number.</div>
            </div>
          ) : (
            (['project', 'task', 'permit', 'document'] as const).filter(t => grouped[t]?.length).map(type => (
              <div key={type}>
                <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:C.dim, fontWeight:600, padding:'10px 18px 4px' }}>
                  <span style={{ display:'flex', width:13, height:13 }}>{TYPE_META[type].icon}</span>{TYPE_META[type].label}
                </div>
                {grouped[type].map(r => (
                  <button key={r.id} onClick={() => go(r)} style={{ width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10, background:'none', border:'none', padding:'9px 18px', fontFamily:'inherit', cursor:'pointer' }} onMouseEnter={e => e.currentTarget.style.background=C.bgElevated} onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <span style={{ fontSize:13.5, color:C.text }}><Highlight text={r.label} q={debounced} /></span>
                    {r.sub && <span style={{ fontSize:11, color:C.muted }}>· {r.sub}</span>}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
