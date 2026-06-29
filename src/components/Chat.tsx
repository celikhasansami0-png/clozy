'use client'
import { useRef, useState } from 'react'
import { Skeleton } from './Skeleton'

const C = { bg:'#080808', bgCard:'#0F0F0F', bgElevated:'#161616', bgHover:'#1C1C1C', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030' }

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Which projects are most at risk right now?',
  'Summarise interconnection status across the portfolio.',
  'What should the crew prioritise this week?',
]

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function send(text: string) {
    const content = text.trim()
    if (!content || loading) return
    const next: Msg[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      const reply = res.ok ? data.reply : `⚠️ ${data.error || 'Request failed'}`
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...next, { role: 'assistant', content: '⚠️ Network error.' }])
    } finally {
      setLoading(false)
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }))
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <div style={{ padding:'16px 24px', borderBottom:`1px solid ${C.borderSubtle}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em' }}>@Bionova</span>
          <span style={{ fontSize:11, color:C.muted, background:C.bgElevated, padding:'2px 7px', borderRadius:4, border:`1px solid ${C.border}` }}>AI assistant</span>
        </div>
        <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>Grounded in your live solar EPC workspace.</div>
      </div>

      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
        {messages.length === 0 && (
          <div style={{ margin:'auto', textAlign:'center', maxWidth:440 }}>
            <div style={{ fontSize:15, color:C.sub, marginBottom:16 }}>Ask @Bionova about your projects, permits, and crew.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={()=>send(s)} style={{ background:C.bgCard, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'10px 14px', fontSize:13, textAlign:'left', fontFamily:'inherit' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth:'78%' }}>
            <div style={{
              background: m.role === 'user' ? C.text : C.bgCard,
              color: m.role === 'user' ? '#080808' : C.text,
              border: m.role === 'user' ? 'none' : `1px solid ${C.border}`,
              borderRadius:12, padding:'10px 14px', fontSize:13.5, lineHeight:1.55, whiteSpace:'pre-wrap',
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf:'flex-start', maxWidth:'78%', width:280, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
            <Skeleton width="80%" height={11} /><Skeleton width="95%" height={11} /><Skeleton width="60%" height={11} />
          </div>
        )}
      </div>

      <form onSubmit={e => { e.preventDefault(); send(input) }} style={{ padding:'12px 24px', borderTop:`1px solid ${C.borderSubtle}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bgElevated, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px' }}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Message @Bionova…" style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:14, color:C.text, fontFamily:'inherit' }} />
          <button type="submit" disabled={loading || !input.trim()} style={{ width:30, height:30, background:C.text, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', border:'none', flexShrink:0, opacity:(loading||!input.trim())?0.4:1 }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 6h10M6 1l5 5-5 5" stroke="#080808" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </form>
    </div>
  )
}
