'use client'
import { useState } from 'react'
import { Tag, docStatusCfg } from './ui'
import { flaggedDocuments } from '@/lib/insights'
import { useCreate } from './CreateProvider'
import { createClient } from '@/lib/supabase'
import { useBus, evt, type ReplacePayload } from '@/lib/bus'
import EmptyState, { Icons } from './EmptyState'
import Pager, { PAGE_SIZE } from './Pager'
import type { Doc } from '@/lib/types'

const C = { bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', muted:'#8C8980', dim:'#C2BFB5', warnBg:'rgba(194,87,74,0.10)', warnBorder:'rgba(194,87,74,0.35)', warn:'#C2574A' }

export default function DocumentsView({ documents: initial }: { documents: Doc[] }) {
  const create = useCreate()
  const supabase = createClient()
  const [docs, setDocs] = useState(initial)
  const [page, setPage] = useState(0)

  useBus<Doc>(evt.add('document'), d => setDocs(prev => prev.some(x => x.id === d.id) ? prev : [d, ...prev]))
  useBus<ReplacePayload<Doc>>(evt.replace('document'), ({ tempId, row }) => setDocs(prev => prev.map(x => x.id === tempId ? row : x)))
  useBus<string>(evt.remove('document'), id => setDocs(prev => prev.filter(x => x.id !== id)))

  async function download(d: Doc) {
    if (!d.file_path) return
    const { data } = await supabase.storage.from('project-documents').createSignedUrl(d.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const flagged = flaggedDocuments(docs)
  const flaggedDays = new Map(flagged.map(f => [f.doc.id, f.daysInReview]))
  const stats = [
    { label:'Total',            value:docs.length,                                  dim:false },
    { label:'Approved',         value:docs.filter(d=>d.status==='Approved').length,  dim:false },
    { label:'Pending / Review', value:docs.filter(d=>d.status!=='Approved').length,  dim:true },
  ]

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Documents</div>
          <div style={{ fontSize:14, color:C.muted }}>Track document numbers, types and approval status — and attach files in one place.</div>
        </div>
        <button onClick={()=>create.newDocument()} style={{ background:'#CC785C', border:'none', color:'#FFFFFF', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>+ New document</button>
      </div>

      {flagged.length > 0 && (
        <div style={{ background:C.warnBg, border:`1px solid ${C.warnBorder}`, borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:C.text }}>
          <span style={{ fontWeight:700, color:C.warn }}>⚠ Document agent:</span> {flagged.length} document(s) have been &ldquo;Under Review&rdquo; for more than 14 days — follow up to keep projects moving.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 18px' }}>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.04em', color:s.dim?C.muted:C.text, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:12, color:C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {docs.length === 0 ? (
        <EmptyState icon={Icons.doc} title="Track your first document" description="Log document numbers, types and approval status — and attach the file itself." cta={{ label: 'New document', onClick: () => create.newDocument() }} />
      ) : (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 110px 110px 90px', padding:'10px 18px', borderBottom:`1px solid ${C.border}`, fontSize:10, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:C.dim, fontWeight:600 }}>
            <span>Document</span><span>Type</span><span>Submitted</span><span>Status</span><span>File</span>
          </div>
          {docs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((d, i, arr) => {
            const sc = docStatusCfg[d.status] || { color:C.muted, bg:'transparent', border:C.dim }
            return (
              <div key={d.id} style={{ display:'grid', gridTemplateColumns:'1fr 120px 110px 110px 90px', padding:'13px 18px', borderBottom:i<arr.length-1?`1px solid ${C.borderSubtle}`:'none', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
                    {d.doc_number}
                    {flaggedDays.has(d.id) && (
                      <span style={{ fontSize:10, fontWeight:700, color:C.warn, background:C.warnBg, border:`1px solid ${C.warnBorder}`, padding:'1px 6px', borderRadius:4 }}>⚠ {flaggedDays.get(d.id)}d in review</span>
                    )}
                  </div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                    {d.job?.name}
                    {d.notes && <span style={{ color:C.dim }}> · {d.notes}</span>}
                  </div>
                </div>
                <span style={{ fontSize:12, color:C.muted }}>{d.type}</span>
                <span style={{ fontSize:12, color:C.muted }}>{d.submitted_date || '—'}</span>
                <Tag label={d.status} color={sc.color} bg={sc.bg} border={sc.border} />
                {d.file_path ? (
                  <button onClick={() => download(d)} style={{ justifySelf:'start', background:C.bgElevated, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:'4px 9px', fontSize:11, fontFamily:'inherit', cursor:'pointer' }}>Download</button>
                ) : (
                  <span style={{ fontSize:12, color:C.dim }}>—</span>
                )}
              </div>
            )
          })}
          <Pager page={page} total={docs.length} onPage={setPage} />
        </div>
      )}
    </div>
  )
}
