'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import CreateProvider, { useCreate } from './CreateProvider'
import { NicheProvider, useNiche } from './NicheProvider'
import NotificationBell from './NotificationBell'
import SearchOverlay from './SearchOverlay'
import TimerProvider, { TimerPill } from './TimeTracking'
import { accent } from './ui'
import type { ModuleConfig } from '@/config/modules'
import { plural } from '@/config/modules'

const C = { bgElevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5' }

type Action = { label: string; kind: 'project' | 'task' | 'document' | 'member' }
function routeMeta(path: string, term: ModuleConfig['terminology']): { crumb: string; action?: Action } {
  if (path === '/dashboard') return { crumb: 'Dashboard', action: { label: `New ${term.project}`, kind: 'project' } }
  if (path.startsWith('/dashboard/jobs')) return { crumb: plural(term.project), action: { label: `New ${term.task}`, kind: 'task' } }
  if (path.startsWith('/dashboard/tasks')) return { crumb: plural(term.task), action: { label: `New ${term.task}`, kind: 'task' } }
  if (path.startsWith('/dashboard/documents')) return { crumb: 'Documents', action: { label: 'New Document', kind: 'document' } }
  if (path.startsWith('/dashboard/crew')) return { crumb: term.team, action: { label: 'Add Member', kind: 'member' } }
  if (path.startsWith('/dashboard/schedule')) return { crumb: term.schedule, action: { label: `New ${term.task}`, kind: 'task' } }
  if (path.startsWith('/dashboard/reports')) return { crumb: 'Reports' }
  if (path.startsWith('/dashboard/settings')) return { crumb: 'Settings' }
  if (path.startsWith('/dashboard/assistant')) return { crumb: 'Assistant' }
  return { crumb: 'Dashboard' }
}

function Topbar({ userId, onMenu, onOpenSearch }: { userId: string; onMenu: () => void; onOpenSearch: () => void }) {
  const create = useCreate()
  const { term } = useNiche()
  const meta = routeMeta(usePathname() || '/dashboard', term)

  function runAction(kind: Action['kind']) {
    if (kind === 'project') create.newProject()
    else if (kind === 'task') create.newTask()
    else if (kind === 'document') create.newDocument()
    else if (kind === 'member') create.newMember()
  }

  return (
    <div style={{ height:46, borderBottom:`1px solid ${C.borderSubtle}`, display:'flex', alignItems:'center', padding:'0 16px', background:'#FFFFFF', flexShrink:0, justifyContent:'space-between', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
        <button className="bn-menu-btn" aria-label="Toggle menu" onClick={onMenu} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.sub, borderRadius:6, width:30, height:26, padding:0 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1.5H2zM2 7.25h12v1.5H2zM2 10.5h12V12H2z"/></svg>
        </button>
        <div style={{ fontSize:13, display:'flex', alignItems:'center', gap:7, overflow:'hidden' }}>
          <span style={{ color:C.muted }}>Doppio</span>
          <span style={{ color:C.muted }}>/</span>
          <span style={{ color:C.text, fontWeight:600, whiteSpace:'nowrap' }}>{meta.crumb}</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <TimerPill />
        <button onClick={onOpenSearch} aria-label="Search" style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.bgElevated, border:`1px solid ${C.border}`, color:C.muted, borderRadius:7, padding:'5px 10px', fontSize:12.5, fontFamily:'inherit', cursor:'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5L17 17"/></svg>
          <span className="bn-label">Search</span>
          <kbd style={{ fontSize:10, border:`1px solid ${C.border}`, borderRadius:4, padding:'0 4px', color:C.dim }}>⌘K</kbd>
        </button>
        <NotificationBell userId={userId} />
        {meta.action && (
          <button onClick={() => runAction(meta.action!.kind)} style={{ display:'inline-flex', alignItems:'center', gap:6, background:accent.soft, border:`1px solid ${accent.border}`, color:accent.bright, borderRadius:7, padding:'6px 12px', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>
            <span style={{ fontSize:15, lineHeight:1 }}>+</span>{meta.action.label}
          </button>
        )}
        <form action="/api/auth/signout" method="POST">
          <button style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'5px 12px', fontSize:12.5, cursor:'pointer', fontFamily:'inherit' }}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

function Chrome({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const create = useCreate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(v => !v); return }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); create.newTask() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [create])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#FAF9F5' }}>
      <Topbar userId={userId} onMenu={() => setOpen(v => !v)} onOpenSearch={() => setSearchOpen(true)} />
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        <div className={`bn-sidebar-backdrop ${open ? 'bn-open' : ''}`} onClick={() => setOpen(false)} />
        <Sidebar userId={userId} className={open ? 'bn-open' : ''} onNavigate={() => setOpen(false)} />
        <main style={{ flex:1, display:'flex', overflow:'hidden' }}>{children}</main>
      </div>
      <SearchOverlay userId={userId} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

export default function DashboardShell({ userId, children }: { userId: string; children: React.ReactNode }) {
  return (
    <NicheProvider>
      <TimerProvider userId={userId}>
        <CreateProvider userId={userId}>
          <Chrome userId={userId}>{children}</Chrome>
        </CreateProvider>
      </TimerProvider>
    </NicheProvider>
  )
}
