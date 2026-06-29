'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { logActivity, relativeTime } from '@/lib/log'
import EmptyState, { Icons } from './EmptyState'
import type { DocumentRow } from '@/lib/types'

const C = { bgCard:'#0F0F0F', bgElevated:'#161616', bgHover:'#1C1C1C', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030', err:'#f87171' }

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}
function extOf(name: string) { return (name.split('.').pop() || 'FILE').toUpperCase().slice(0, 4) }

export default function DocumentsPanel({ projectId, ownerId, uploaderName }: { projectId: string; ownerId: string; uploaderName: string }) {
  const supabase = createClient()
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setDocs(data as DocumentRow[]) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(''); setUploading(true)
    for (const file of Array.from(files)) {
      const path = `${projectId}/${crypto.randomUUID()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('project-documents').upload(path, file, { upsert: false })
      if (upErr) { setError(upErr.message); continue }
      const { data, error: insErr } = await supabase.from('documents').insert({
        project_id: projectId, owner_id: ownerId, file_name: file.name, file_path: path,
        file_size: file.size, file_type: file.type || extOf(file.name),
      }).select('*').single()
      if (!insErr && data) {
        setDocs(prev => [data as DocumentRow, ...prev])
        logActivity(supabase, { projectId, ownerId, action: 'document_uploaded', entityType: 'document', entityId: (data as DocumentRow).id, metadata: { name: file.name, actor: uploaderName } })
      }
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function download(d: DocumentRow) {
    const { data } = await supabase.storage.from('project-documents').createSignedUrl(d.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function remove(d: DocumentRow) {
    setConfirmId(null)
    setDocs(prev => prev.filter(x => x.id !== d.id))
    await supabase.storage.from('project-documents').remove([d.file_path])
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
        <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>PDF, images, Excel, Word and more</div>
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
        <EmptyState icon={Icons.doc} title="Upload project documents" description="Store PDFs, drawings, spreadsheets and contracts in one place." cta={{ label: 'Upload', onClick: () => inputRef.current?.click() }} compact />
      ) : (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          {docs.map((d, i) => (
            <div key={d.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom: i < docs.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}>
              <div style={{ width:34, height:34, borderRadius:7, background:C.bgElevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:C.sub, flexShrink:0 }}>{extOf(d.file_name)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.file_name}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{fmtSize(d.file_size)} · {uploaderName} · {relativeTime(d.created_at)}</div>
              </div>
              <button onClick={() => download(d)} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.sub, borderRadius:6, padding:'5px 10px', fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>Download</button>
              {confirmId === d.id ? (
                <button onClick={() => remove(d)} style={{ background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.4)', color:C.err, borderRadius:6, padding:'5px 10px', fontSize:12, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>Confirm?</button>
              ) : (
                <button onClick={() => setConfirmId(d.id)} style={{ background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'5px 10px', fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
