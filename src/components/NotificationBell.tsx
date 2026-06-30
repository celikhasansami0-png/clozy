'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useBus } from '@/lib/bus'
import { relativeTime } from '@/lib/log'
import { Icons } from './EmptyState'
import type { NotificationRow } from '@/lib/types'

const C = { bgCard:'#12141A', bgElevated:'#181B22', bgHover:'#1E222B', border:'#262A35', borderSubtle:'#1A1D24', text:'#F5F6F7', sub:'#9CA3AF', muted:'#5C6470', dim:'#2E3340' }

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [items, setItems] = useState<NotificationRow[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = items.filter(n => !n.read).length

  useEffect(() => {
    supabase.from('notifications').select('*').eq('owner_id', userId).order('created_at', { ascending: false }).limit(40)
      .then(({ data }) => { if (data) setItems(data as NotificationRow[]) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useBus<NotificationRow>('bn:notification:add', n => setItems(prev => prev.some(x => x.id === n.id) ? prev : [n, ...prev]))

  // The only realtime subscription in the app — live notifications.
  useEffect(() => {
    const ch = supabase.channel('rt-notif')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `owner_id=eq.${userId}` }, ({ new: row }) => {
        setItems(prev => prev.some(n => n.id === (row as NotificationRow).id) ? prev : [row as NotificationRow, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  async function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).eq('owner_id', userId).eq('read', false)
  }

  async function openItem(n: NotificationRow) {
    if (!n.read) {
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
      supabase.from('notifications').update({ read: true }).eq('id', n.id)
    }
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(v => !v)} aria-label="Notifications" style={{ position:'relative', width:30, height:28, background:C.bgElevated, border:`1px solid ${C.border}`, borderRadius:6, color:C.sub, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8a4 4 0 018 0c0 4 1.5 5 1.5 5h-11S6 12 6 8z"/><path d="M8.5 16a1.5 1.5 0 003 0"/></svg>
        {unread > 0 && <span style={{ position:'absolute', top:-5, right:-5, minWidth:15, height:15, padding:'0 3px', borderRadius:8, background:'#4D7FFF', color:'#FFFFFF', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #12141A' }}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div style={{ position:'absolute', top:36, right:0, width:340, maxWidth:'90vw', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, boxShadow:'0 12px 32px rgba(0,0,0,0.5)', zIndex:70, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:`1px solid ${C.borderSubtle}` }}>
            <span style={{ fontSize:13, fontWeight:700 }}>Notifications</span>
            {unread > 0 && <button onClick={markAllRead} style={{ background:'none', border:'none', color:C.sub, fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>Mark all as read</button>}
          </div>
          <div style={{ maxHeight:380, overflowY:'auto' }}>
            {items.length === 0 ? (
              <div style={{ padding:'36px 20px', textAlign:'center' }}>
                <div style={{ width:40, height:40, margin:'0 auto 10px', borderRadius:10, background:C.bgElevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.sub }}>{Icons.bell}</div>
                <div style={{ fontSize:13, color:C.sub, fontWeight:600 }}>You&apos;re all caught up</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>New activity will show up here.</div>
              </div>
            ) : items.map((n, i) => (
              <button key={n.id} onClick={() => openItem(n)} style={{ width:'100%', textAlign:'left', display:'flex', gap:10, padding:'12px 16px', background: n.read ? 'transparent' : 'rgba(77,127,255,0.03)', border:'none', borderBottom: i < items.length - 1 ? `1px solid ${C.borderSubtle}` : 'none', cursor:'pointer', fontFamily:'inherit' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background: n.read ? 'transparent' : C.text, marginTop:5, flexShrink:0 }} />
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:'block', fontSize:13, fontWeight:600, color:C.text }}>{n.title}</span>
                  {n.body && <span style={{ display:'block', fontSize:12, color:C.muted, marginTop:1 }}>{n.body}</span>}
                  <span style={{ display:'block', fontSize:11, color:C.dim, marginTop:3 }}>{relativeTime(n.created_at)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
