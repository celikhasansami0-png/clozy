'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import CreateProvider, { useCreate } from './CreateProvider'
import { accent } from './ui'

const C = { bgElevated:'#161616', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060' }

type Action = { label: string; kind: 'project' | 'task' | 'permit' | 'member' }
function routeMeta(path: string): { crumb: string; action?: Action } {
  if (path === '/dashboard') return { crumb: 'Dashboard', action: { label: 'New Project', kind: 'project' } }
  if (path.startsWith('/dashboard/jobs')) return { crumb: 'Projects', action: { label: 'New Task', kind: 'task' } }
  if (path.startsWith('/dashboard/permits')) return { crumb: 'Permits', action: { label: 'New Permit', kind: 'permit' } }
  if (path.startsWith('/dashboard/crew')) return { crumb: 'Team', action: { label: 'Add Member', kind: 'member' } }
  if (path.startsWith('/dashboard/schedule')) return { crumb: 'Schedule', action: { label: 'New Task', kind: 'task' } }
  if (path.startsWith('/dashboard/reports')) return { crumb: 'Reports' }
  if (path.startsWith('/dashboard/assistant')) return { crumb: 'Assistant' }
  return { crumb: 'Dashboard' }
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const create = useCreate()
  const meta = routeMeta(usePathname() || '/dashboard')

  function runAction(kind: Action['kind']) {
    if (kind === 'project') create.newProject()
    else if (kind === 'task') create.newTask()
    else if (kind === 'permit') create.newPermit()
    else if (kind === 'member') create.newMember()
  }

  return (
    <div style={{ height:46, borderBottom:`1px solid ${C.borderSubtle}`, display:'flex', alignItems:'center', padding:'0 16px', background:'#0F0F0F', flexShrink:0, justifyContent:'space-between', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
        <button className="bn-menu-btn" aria-label="Toggle menu" onClick={onMenu} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.sub, borderRadius:6, width:30, height:26, padding:0 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1.5H2zM2 7.25h12v1.5H2zM2 10.5h12V12H2z"/></svg>
        </button>
        <div style={{ fontSize:13, display:'flex', alignItems:'center', gap:7, overflow:'hidden' }}>
          <span style={{ color:C.muted }}>BioNova</span>
          <span style={{ color:C.muted }}>/</span>
          <span style={{ color:C.text, fontWeight:600, whiteSpace:'nowrap' }}>{meta.crumb}</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
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
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#080808' }}>
      <Topbar onMenu={() => setOpen(v => !v)} />
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        <div className={`bn-sidebar-backdrop ${open ? 'bn-open' : ''}`} onClick={() => setOpen(false)} />
        <Sidebar userId={userId} className={open ? 'bn-open' : ''} onNavigate={() => setOpen(false)} />
        <main style={{ flex:1, display:'flex', overflow:'hidden' }}>{children}</main>
      </div>
    </div>
  )
}

export default function DashboardShell({ userId, children }: { userId: string; children: React.ReactNode }) {
  return (
    <CreateProvider userId={userId}>
      <Chrome userId={userId}>{children}</Chrome>
    </CreateProvider>
  )
}
