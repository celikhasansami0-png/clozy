'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { accent } from './ui'
import { useBus, evt, type ReplacePayload } from '@/lib/bus'
import type { Job } from '@/lib/types'

const C = { bg:'#0F0F0F', elevated:'#161616', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', muted:'#606060', dim:'#303030' }

const navItems = [
  { label:'Dashboard', href:'/dashboard',          icon:<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> },
  { label:'Projects',  href:'/dashboard/jobs',      icon:<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg> },
  { label:'Permits',   href:'/dashboard/permits',   icon:<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1h8a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1zm1 3v1.5h6V4H5zm0 3v1.5h6V7H5zm0 3v1.5h4V10H5z"/></svg> },
  { label:'Team',      href:'/dashboard/crew',       icon:<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5"/><circle cx="12" cy="5" r="2"/><path d="M10.5 13c0-1.66.9-3.12 2.25-3.9"/></svg> },
  { label:'Schedule',  href:'/dashboard/schedule',   icon:<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h1v1h8V2h1v1h1a1 1 0 011 1v9a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1h1V2zm-1 4v7h12V6H2zm2 2h2v2H4V8z"/></svg> },
  { label:'Reports',   href:'/dashboard/reports',    icon:<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2 14h12v1H2zM3 8h2v5H3zm4-4h2v9H7zm4 2h2v7h-2z"/></svg> },
  { label:'Assistant', href:'/dashboard/assistant',  icon:<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v6A1.5 1.5 0 0112.5 11H6l-3 3v-3H3.5A1.5 1.5 0 012 9.5v-6z"/></svg> },
]

export default function Sidebar({ userId, className = '', onNavigate }: { userId: string; className?: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  const [jobs, setJobs] = useState<Job[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.from('jobs').select('id,name,color').eq('owner_id', userId).order('created_at').then(({ data }) => { if (data) setJobs(data as Job[]) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Optimistic project list updates.
  useBus<Job>(evt.add('project'), j => setJobs(prev => prev.some(x => x.id === j.id) ? prev : [...prev, j]))
  useBus<ReplacePayload<Job>>(evt.replace('project'), ({ tempId, row }) => setJobs(prev => prev.map(x => x.id === tempId ? row : x)))
  useBus<string>(evt.remove('project'), id => setJobs(prev => prev.filter(x => x.id !== id)))
  useBus<Job>(evt.update('project'), j => setJobs(prev => prev.map(x => x.id === j.id ? { ...x, ...j } : x)))

  return (
    <div className={`bn-sidebar ${className}`} style={{ width:220, flexShrink:0, background:C.bg, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Logo */}
      <div style={{ padding:'15px 18px', borderBottom:`1px solid ${C.borderSubtle}`, display:'flex', alignItems:'center', gap:10 }}>
        {/* Replace this div with your logo: <img src="/logo.svg" width="28" height="28" alt="BioNova" /> */}
        <div style={{ width:28, height:28, borderRadius:6, background:C.elevated, border:`1px dashed ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:C.dim, fontWeight:600, letterSpacing:'0.04em', flexShrink:0 }}>LOGO</div>
        <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.02em', color:C.text }}>BioNova</span>
        <span style={{ marginLeft:'auto', fontSize:10, color:C.muted, background:C.elevated, padding:'2px 6px', borderRadius:4, border:`1px solid ${C.border}` }}>Beta</span>
      </div>

      {/* Nav */}
      <div style={{ padding:'12px 10px 8px' }}>
        <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:C.dim, fontWeight:600, padding:'0 8px', marginBottom:6 }}>Workspace</div>
        {navItems.map(item => {
          const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} style={{
              display:'flex', alignItems:'center', gap:9, padding:'6px 8px', borderRadius:6,
              fontSize:13, fontWeight:500, marginBottom:1, transition:'all 0.1s',
              color: active ? C.text : C.muted,
              background: active ? C.elevated : 'transparent',
            }}>
              <span style={{ display:'flex', color: active ? accent.base : C.muted }}>{item.icon}</span>
              {item.label}
              {active && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:accent.base, flexShrink:0 }} />}
            </Link>
          )
        })}
      </div>

      {/* Active projects */}
      <div style={{ padding:'8px 10px', flex:1, overflowY:'auto' }}>
        <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:C.dim, fontWeight:600, padding:'0 8px', marginBottom:6 }}>Active Projects</div>
        {jobs.map(j => (
          <Link key={j.id} href={`/dashboard/jobs?job=${j.id}`} onClick={onNavigate} style={{
            display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:6,
            fontSize:12, fontWeight:500, marginBottom:1, transition:'all 0.1s',
            color: C.muted, background:'transparent',
          }}
          onMouseEnter={e=>(e.currentTarget.style.background=C.elevated)}
          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
          >
            <div style={{ width:6, height:6, borderRadius:'50%', background:j.color, flexShrink:0 }} />
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.name}</span>
          </Link>
        ))}
        {jobs.length === 0 && <div style={{ fontSize:11, color:C.dim, padding:'4px 8px' }}>No projects yet</div>}
      </div>

      {/* User */}
      <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.borderSubtle}`, display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:C.elevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:C.text }}>
          {userId.slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1, overflow:'hidden' }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>My Account</div>
          <div style={{ fontSize:10, color:C.muted }}>Owner</div>
        </div>
      </div>
    </div>
  )
}
