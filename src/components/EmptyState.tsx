'use client'
import React from 'react'

const C = { bgCard:'#12141A', bgElevated:'#181B22', border:'#262A35', text:'#F5F6F7', sub:'#9CA3AF', muted:'#5C6470' }

export default function EmptyState({ icon, title, description, cta, compact }: { icon?: React.ReactNode; title: string; description?: string; cta?: { label: string; onClick: () => void }; compact?: boolean }) {
  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding: compact ? '28px 20px' : '48px 24px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      {icon && (
        <div style={{ width:44, height:44, borderRadius:10, background:C.bgElevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.sub, marginBottom:2 }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{title}</div>
      {description && <div style={{ fontSize:13, color:C.muted, maxWidth:340 }}>{description}</div>}
      {cta && (
        <button onClick={cta.onClick} style={{ marginTop:6, background:'#4D7FFF', color:'#FFFFFF', border:'none', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>{cta.label}</button>
      )}
    </div>
  )
}

// A few simple monochrome line icons.
export const Icons = {
  project: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M3 8h14"/></svg>,
  task: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 6h10M5 10h10M5 14h6"/></svg>,
  permit: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="3" width="12" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>,
  team: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="2.5"/><circle cx="14" cy="8" r="2"/><path d="M2.5 16c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"/></svg>,
  doc: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 2h7l3 3v13H5z"/><path d="M12 2v3h3"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 8a4 4 0 018 0c0 4 1.5 5 1.5 5h-11S6 12 6 8z"/><path d="M8.5 16a1.5 1.5 0 003 0"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5L17 17"/></svg>,
  activity: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 10h4l2-5 4 10 2-5h4"/></svg>,
}
