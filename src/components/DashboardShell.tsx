'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'

export default function DashboardShell({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#080808' }}>
      {/* Topbar */}
      <div style={{
        height:42, borderBottom:'1px solid #181818',
        display:'flex', alignItems:'center', padding:'0 16px',
        background:'#0F0F0F', flexShrink:0, justifyContent:'space-between', gap:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button
            className="bn-menu-btn"
            aria-label="Toggle menu"
            onClick={() => setOpen(v => !v)}
            style={{ background:'#161616', border:'1px solid #262626', color:'#A0A0A0', borderRadius:6, width:30, height:26, padding:0 }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1.5H2zM2 7.25h12v1.5H2zM2 10.5h12V12H2z"/></svg>
          </button>
          <div style={{ fontSize:12, color:'#606060' }}>BioNova</div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button style={{ background:'#161616', border:'1px solid #262626', color:'#606060', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            Sign out
          </button>
        </form>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        <div className={`bn-sidebar-backdrop ${open ? 'bn-open' : ''}`} onClick={() => setOpen(false)} />
        <Sidebar userId={userId} className={open ? 'bn-open' : ''} onNavigate={() => setOpen(false)} />
        <main style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
