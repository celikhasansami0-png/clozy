import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const C = { bg:'#FAF9F5', card:'#FFFFFF', elevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5', accent:'#CC785C' }
const STATUS_LABEL: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

type Job = { id: string; name: string; completion: number; phase: string; status: string }
type Task = { title: string; status: string; due_date: string | null }
type Doc = { doc_number: string; type: string; status: string; notes: string | null }

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'32px 24px 64px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" width={28} height={28} alt="Doppio" style={{ borderRadius:6, objectFit:'contain' }} />
          <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.02em' }}>Doppio</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default async function ClientProjectPage({ params }: { params: { token: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return <Shell><div style={{ fontSize:14, color:C.muted }}>This shared view is not available.</div></Shell>
  }
  const admin = createClient(url, serviceKey)
  const { data: jobRow } = await admin.from('jobs').select('id,name,completion,phase,status').eq('client_access_token', params.token).limit(1)
  const job = jobRow?.[0] as Job | undefined
  if (!job) {
    return <Shell><div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'22px', fontSize:14, color:C.sub }}>This link is invalid or has been revoked. Please ask for a new link.</div></Shell>
  }

  const [{ data: taskRows }, { data: docRows }] = await Promise.all([
    admin.from('tasks').select('title,status,due_date').eq('job_id', job.id).order('created_at').limit(1000),
    admin.from('documents').select('doc_number,type,status,notes').eq('project_id', job.id).order('created_at').limit(2000),
  ])
  const tasks = (taskRows || []) as Task[]
  const docs = (docRows || []) as Doc[]
  const groups: [string, Task[]][] = ['todo', 'in_progress', 'done'].map(s => [s, tasks.filter(t => t.status === s)])

  return (
    <Shell>
      <div style={{ marginBottom:6, fontSize:12, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600 }}>Project</div>
      <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 4px' }}>{job.name}</h1>
      <div style={{ fontSize:13, color:C.muted, marginBottom:16 }}>{job.status} · {job.phase}</div>

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', marginBottom:24, boxShadow:'0 1px 3px rgba(60,50,40,0.05)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}><span style={{ color:C.sub }}>Completion</span><span style={{ fontWeight:700 }}>{job.completion}%</span></div>
        <div style={{ height:8, background:C.elevated, borderRadius:6, overflow:'hidden' }}>
          <div style={{ width:`${job.completion}%`, height:'100%', background:C.accent, borderRadius:6 }} />
        </div>
      </div>

      <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Tasks</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12, marginBottom:28 }}>
        {groups.map(([status, list]) => (
          <div key={status} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.borderSubtle}`, fontSize:12, fontWeight:700, color:C.sub }}>{STATUS_LABEL[status]} · {list.length}</div>
            {list.length === 0 && <div style={{ padding:'12px 14px', fontSize:12, color:C.dim }}>None</div>}
            {list.map((t, i) => (
              <div key={i} style={{ padding:'10px 14px', borderBottom:i<list.length-1?`1px solid ${C.borderSubtle}`:'none' }}>
                <div style={{ fontSize:12.5, color:C.text }}>{t.title}</div>
                {t.due_date && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Due {t.due_date}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Documents</div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        {docs.length === 0 && <div style={{ padding:'14px', fontSize:12, color:C.dim }}>No documents.</div>}
        {docs.map((d, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 14px', borderBottom:i<docs.length-1?`1px solid ${C.borderSubtle}`:'none' }}>
            <span style={{ fontSize:12.5 }}>{d.notes || d.doc_number} <span style={{ color:C.muted }}>· {d.type}</span></span>
            <span style={{ fontSize:11, fontWeight:700, color:C.accent }}>{d.status}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign:'center', fontSize:11, color:C.dim, marginTop:32 }}>Shared securely via Doppio</div>
    </Shell>
  )
}
