'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Avatar } from './ui'
import { relativeTime } from '@/lib/log'
import type { CrewMember } from '@/lib/types'

const C = { bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5', accent:'#CC785C', accentBg:'#F2E2D8' }
const PAGE = 50

type Comment = { id: string; content: string; author_id: string | null; created_at: string }

// Render comment text with @mentions highlighted in the accent color.
function renderContent(content: string, names: string[]) {
  if (names.length === 0) return content
  const re = new RegExp(`@(${names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  const parts = content.split(re)
  return parts.map((p, i) => names.includes(p) ? <span key={i} style={{ color:C.accent, fontWeight:600 }}>@{p}</span> : <span key={i}>{p}</span>)
}

export default function TaskComments({ taskId, ownerId, taskTitle, crew }: { taskId: string; ownerId: string; taskTitle: string; crew: CrewMember[] }) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const names = crew.map(c => c.name)

  useEffect(() => {
    supabase.from('task_comments').select('id,content,author_id,created_at').eq('task_id', taskId).order('created_at', { ascending: false }).limit(PAGE)
      .then(({ data }) => setComments((data || []) as Comment[]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  function onChange(v: string) {
    setText(v)
    const m = v.slice(0, inputRef.current?.selectionStart ?? v.length).match(/@(\w*)$/)
    setMentionQuery(m ? m[1] : null)
  }
  function insertMention(name: string) {
    setText(prev => prev.replace(/@(\w*)$/, `@${name} `))
    setMentionQuery(null)
    inputRef.current?.focus()
  }

  async function post() {
    const content = text.trim()
    if (!content) return
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('task_comments').insert({ task_id: taskId, owner_id: ownerId, author_id: user?.id || null, content }).select('id,content,author_id,created_at').single()
    if (data) setComments(prev => [data as Comment, ...prev])
    // Mention notifications (owner-scoped in this single-account model).
    const mentioned = crew.filter(c => content.includes(`@${c.name}`))
    if (mentioned.length) {
      await supabase.from('notifications').insert(mentioned.map(c => ({
        owner_id: ownerId, type: 'mention', title: `Mention: ${c.name}`,
        body: `You mentioned ${c.name} in "${taskTitle}"`, link: `/dashboard/jobs?job=`,
      })))
    }
    setText(''); setPosting(false)
  }

  const filtered = mentionQuery !== null ? crew.filter(c => c.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 6) : []

  return (
    <div style={{ marginTop:20 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:C.dim, fontWeight:600, marginBottom:10 }}>Comments</div>

      <div style={{ position:'relative', marginBottom:14 }}>
        <textarea ref={inputRef} value={text} onChange={e => onChange(e.target.value)} placeholder="Add a comment… use @ to mention" rows={2}
          style={{ width:'100%', background:'#FFFFFF', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', fontSize:12.5, color:C.text, outline:'none', fontFamily:'inherit', resize:'vertical' }} />
        {filtered.length > 0 && (
          <div style={{ position:'absolute', left:0, bottom:'100%', marginBottom:4, zIndex:20, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, boxShadow:'0 8px 24px rgba(60,50,40,0.12)', overflow:'hidden', minWidth:180 }}>
            {filtered.map(c => (
              <button key={c.id} onClick={() => insertMention(c.name)} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left', background:'none', border:'none', padding:'7px 10px', fontSize:12.5, color:C.text, cursor:'pointer', fontFamily:'inherit' }} onMouseEnter={e=>e.currentTarget.style.background=C.bgElevated} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                <Avatar initials={c.initials} size={20} /> {c.name}
              </button>
            ))}
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:6 }}>
          <button onClick={post} disabled={posting || !text.trim()} style={{ background:C.accent, border:'none', color:'#FFFFFF', borderRadius:7, padding:'6px 14px', fontSize:12.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', opacity:(posting||!text.trim())?0.6:1 }}>{posting ? 'Posting…' : 'Post'}</button>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {comments.length === 0 && <div style={{ fontSize:12, color:C.dim }}>No comments yet.</div>}
        {comments.map(cm => (
          <div key={cm.id} style={{ display:'flex', gap:10 }}>
            <Avatar initials="You" size={26} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12.5, fontWeight:600 }}>You</span>
                <span style={{ fontSize:11, color:C.muted }}>{relativeTime(cm.created_at)}</span>
              </div>
              <div style={{ fontSize:12.5, color:C.sub, marginTop:2, lineHeight:1.5, whiteSpace:'pre-wrap' }}>{renderContent(cm.content, names)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
