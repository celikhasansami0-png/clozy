'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'

const C = { accent:'#CC785C', green:'#7A9B76', muted:'#8C8980', text:'#1F1E1C', border:'#DEDBD2', elevated:'#F0EEE6' }
const LS_KEY = 'doppio:timer'
const MAX_ENTRIES = 1000

type Active = { taskId: string; title: string; startedAt: number }
type Ctx = { active: Active | null; start: (taskId: string, title: string) => void; stop: () => void }
const TimerContext = createContext<Ctx | null>(null)
export function useTimer() {
  const c = useContext(TimerContext)
  if (!c) throw new Error('useTimer must be used within TimerProvider')
  return c
}

export function fmtDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600), m = Math.floor((totalSec % 3600) / 60), s = totalSec % 60
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
}
function clock(totalSec: number): string {
  const h = Math.floor(totalSec / 3600), m = Math.floor((totalSec % 3600) / 60), s = totalSec % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export default function TimerProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const supabase = createClient()
  const [active, setActive] = useState<Active | null>(null)

  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setActive(JSON.parse(raw)) } catch { /* ignore */ }
  }, [])

  async function logEntry(a: Active) {
    const ended = Date.now()
    const duration = Math.max(1, Math.round((ended - a.startedAt) / 1000))
    const { count } = await supabase.from('time_entries').select('id', { count: 'exact', head: true }).eq('owner_id', userId)
    if ((count || 0) >= MAX_ENTRIES) return
    await supabase.from('time_entries').insert({
      task_id: a.taskId, owner_id: userId,
      started_at: new Date(a.startedAt).toISOString(), ended_at: new Date(ended).toISOString(), duration_seconds: duration,
    })
  }

  function persist(a: Active | null) { try { a ? localStorage.setItem(LS_KEY, JSON.stringify(a)) : localStorage.removeItem(LS_KEY) } catch { /* ignore */ } }

  async function start(taskId: string, title: string) {
    if (active) await logEntry(active) // only one timer at a time
    const a = { taskId, title, startedAt: Date.now() }
    setActive(a); persist(a)
  }
  async function stop() {
    if (active) await logEntry(active)
    setActive(null); persist(null)
  }

  return <TimerContext.Provider value={{ active, start, stop }}>{children}</TimerContext.Provider>
}

// Total logged time for a task (re-reads when the active timer changes).
export function TaskTotalTime({ taskId }: { taskId: string }) {
  const supabase = createClient()
  const { active } = useTimer()
  const [seconds, setSeconds] = useState<number | null>(null)
  useEffect(() => {
    supabase.from('time_entries').select('duration_seconds').eq('task_id', taskId).limit(1000)
      .then(({ data }) => setSeconds((data || []).reduce((s, r) => s + (r.duration_seconds || 0), 0)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, active])
  if (seconds === null || seconds === 0) return null
  return <span style={{ fontSize:12, color:C.muted }}>⏱ {fmtDuration(seconds)} logged</span>
}

// Small clock icon on a task row. Green + filled while that task is timing.
export function TimerIcon({ taskId, title }: { taskId: string; title: string }) {
  const { active, start, stop } = useTimer()
  const on = active?.taskId === taskId
  return (
    <button
      onClick={(e) => { e.stopPropagation(); on ? stop() : start(taskId, title) }}
      title={on ? 'Stop timer' : 'Start timer'}
      aria-label={on ? 'Stop timer' : 'Start timer'}
      style={{ background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', color: on ? C.green : C.muted, flexShrink:0 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v4l2.5 2" />
      </svg>
    </button>
  )
}

// Running-timer pill for the topbar.
export function TimerPill() {
  const { active, stop } = useTimer()
  const [, tick] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (active) { ref.current = setInterval(() => tick(x => x + 1), 1000) }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [active])
  if (!active) return null
  const elapsed = Math.floor((Date.now() - active.startedAt) / 1000)
  const short = active.title.length > 18 ? active.title.slice(0, 18) + '…' : active.title
  return (
    <button onClick={() => stop()} title="Stop timer" style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.elevated, border:`1px solid ${C.border}`, borderRadius:20, padding:'4px 10px 4px 8px', fontSize:12, color:C.text, fontFamily:'inherit', cursor:'pointer' }}>
      <span style={{ width:8, height:8, borderRadius:'50%', background:C.green, flexShrink:0 }} />
      <span style={{ maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{short}</span>
      <span style={{ fontVariantNumeric:'tabular-nums', color:C.muted }}>{clock(elapsed)}</span>
      <span style={{ color:C.accent, fontWeight:700 }}>■</span>
    </button>
  )
}
