'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { logActivity, relativeTime } from '@/lib/log'
import EmptyState, { Icons } from './EmptyState'
import Pager, { PAGE_SIZE } from './Pager'
import { LIMITS } from '@/config/limits'
import type { Doc } from '@/lib/types'

const C = { bgCard:'#FFFFFF', bgElevated:'#F0EEE6', bgHover:'#E8E5DC', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5', err:'#C2574A' }

const MAX_BYTES = LIMITS.fileSizeBytes      // 50 MB per file
const MAX_DOCS = LIMITS.documentsPerProject // 300 documents per project

function fmtSize(n: number | null) {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}
function extOf(name: string) { return (name.split('.').pop() || 'FILE').toUpperCase().slice(0, 4) }

export default function DocumentsPanel({ projectId, ownerId, uploaderName }: { projectId: string; ownerId: string; uploaderName: string }) {
  const supabase = createClient()
  const [docs, setDocs] = useState<Doc[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(300)
      .then(({ data }) => { if (data) setDocs(data as Doc[]) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError('')
    if (docs.length >= MAX_DOCS) { setError(`This project has reached the ${MAX_DOCS}-document limit. Delete a document to upload more.`); return }
    setUploading(true)
    let count = docs.length
    for (const file of Array.from(files)) {
      if (count >= MAX_DOCS) { setError(`Only the first ${MAX_DOCS} documents were kept — the limit was reached.`); break }
      if (file.size > MAX_BYTES) { setError(`${file.name} is larger than 50 MB and was skipped.`); continue }
      const path = `${projectId}/${crypto.randomUUID()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('project-documents').upload(path, file, { upsert: false })
      if (upErr) { setError(upErr.message); continue }
      const { data, error: insErr } = await supabase.from('documents').insert({
        project_id: projectId, owner_id: ownerId, doc_number: file.name, type: 'File', status: 'Approved',
        submitted_date: new Date().toISOString().slice(0, 10), notes: '',
        file_name: file.name, file_path: path, file_size: file.size, file_type: file.type || extOf(file.name), uploaded_by: ownerId,
      }).select('*').single()
      if (!insErr && data) {
        count++
        setDocs(prev => [data as Doc, ...prev])
        logActivity(supabase, { projectId, ownerId, action: 'document_uploaded', entityType: 'document', entityId: (data as Doc).id, metadata: { name: file.name, actor: uploaderName } })
      }
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function download(d: Doc) {
    if (!d.file_path) return
    const { data } = await supabase.storage.from('project-documents').createSignedUrl(d.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function remove(d: Doc) {
    setConfirmId(null)
    setDocs(prev => prev.filter(x => x.id !== d.id))
    if (d.file_path) await supabase.storage.from('project-documents').remove([d.file_path])
    await supabase.from('documents').delete().eq('id', d.id)
  }

  return (
    <div style={{ padding:'18px 20px', overflowY:'auto', flex:1 }}>
      {/* Drag & drop upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        style={{ border:`1.5px dashed ${dragOver ? C.sub : C.border}`, background: dragOver ? C.bgElevated : C.bgCard, borderRadius:12, padding:'26px 20px', textAlign:'center', cursor:'pointer', marginBottom:16, transition:'all 0.12s' }}
      >
        <div style={{ width:40, height:40, margin:'0 auto 10px', borderRadius:10, background:C.bgElevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.sub }}>{Icons.doc}</div>
        <div style={{ fontSize:13.5, fontWeight:600, color:C.text }}>Drag & drop files here, or click to browse</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>PDF, images, Excel, Word — up to 50 MB each · {docs.length}/{MAX_DOCS}</div>
        <input ref={inputRef} type="file" multiple style={{ display:'none' }} onChange={e => handleFiles(e.target.files)} />
      </div>

      {uploading && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:C.sub, marginBottom:6 }}>Uploading…</div>
          <div className="bn-skeleton" style={{ height:6, borderRadius:3 }} />
        </div>
      )}
      {error && <div style={{ fontSize:12, color:C.err, marginBottom:12 }}>{error}</div>}

      {docs.length === 0 && !uploading ? (
        <EmptyState icon={Icons.doc} title="Add project documents" description="Store PDFs, drawings, spreadsheets and contracts in one place." cta={{ label: 'Upload', onClick: () => inputRef.current?.click() }} compact />
      ) : (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          {docs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((d, i, arr) => (
            <div key={d.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}>
              <div style={{ width:34, height:34, borderRadius:7, background:C.bgElevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:C.sub, flexShrink:0 }}>{extOf(d.file_name || d.doc_number)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.file_name || d.doc_number}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{d.file_path ? `${fmtSize(d.file_size)} · ` : `${d.type} · ${d.status} · `}{uploaderName} · {relativeTime(d.created_at)}</div>
              </div>
              {d.file_path && <button onClick={() => download(d)} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.sub, borderRadius:6, padding:'5px 10px', fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>Download</button>}
              {confirmId === d.id ? (
                <button onClick={() => remove(d)} style={{ background:'rgba(194,87,74,0.12)', border:'1px solid rgba(194,87,74,0.4)', color:C.err, borderRadius:6, padding:'5px 10px', fontSize:12, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>Confirm?</button>
              ) : (
                <button onClick={() => setConfirmId(d.id)} style={{ background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'5px 10px', fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>Delete</button>
              )}
            </div>
          ))}
          <Pager page={page} total={docs.length} onPage={setPage} />
        </div>
      )}
    </div>
  )
}
