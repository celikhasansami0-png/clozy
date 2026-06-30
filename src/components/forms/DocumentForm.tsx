'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Modal from '../Modal'
import { Field, TextInput, TextArea, Select, SubmitButton } from '../form'
import { emit, evt, type ReplacePayload } from '@/lib/bus'
import { logActivity, notify } from '@/lib/log'
import { sendEmail } from '@/lib/email'
import { LIMITS } from '@/config/limits'
import { DOCUMENT_TYPES } from '@/config/modules'
import type { Job, Doc, DocStatus } from '@/lib/types'

const STATUS: DocStatus[] = ['Pending', 'Under Review', 'Approved', 'Rejected']
const MAX_BYTES = LIMITS.fileSizeBytes // 50 MB

function extOf(name: string) { return (name.split('.').pop() || 'FILE').toUpperCase().slice(0, 4) }

export default function DocumentForm({ userId, onClose, jobId }: { userId: string; onClose: () => void; jobId?: string }) {
  const supabase = createClient()
  const TYPES = DOCUMENT_TYPES
  const [jobs, setJobs] = useState<Pick<Job, 'id' | 'name'>[]>([])
  const [number, setNumber] = useState('')
  const [numberErr, setNumberErr] = useState(false)
  const [project, setProject] = useState(jobId || '')
  const [type, setType] = useState(TYPES[0])
  const [status, setStatus] = useState<DocStatus>('Pending')
  const [submitted, setSubmitted] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileErr, setFileErr] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('jobs').select('id,name').eq('owner_id', userId).order('created_at').then(({ data }) => {
      if (data) { setJobs(data as Pick<Job, 'id' | 'name'>[]); if (!jobId && data[0]) setProject((data[0] as { id: string }).id) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pickFile(f: File | null) {
    setFileErr('')
    if (f && f.size > MAX_BYTES) { setFileErr('File is larger than 50 MB.'); return }
    setFile(f)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!number.trim()) { setNumberErr(true); return }
    if (!project) return
    if (file && file.size > MAX_BYTES) { setFileErr('File is larger than 50 MB.'); return }
    setLoading(true)
    const job = jobs.find(j => j.id === project)

    // Optional file upload to storage first.
    let fileFields: Partial<Doc> = { file_name: null, file_path: null, file_size: null, file_type: null, uploaded_by: null }
    if (file) {
      const path = `${project}/${crypto.randomUUID()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('project-documents').upload(path, file, { upsert: false })
      if (upErr) { setFileErr(upErr.message); setLoading(false); return }
      fileFields = { file_name: file.name, file_path: path, file_size: file.size, file_type: file.type || extOf(file.name), uploaded_by: userId }
    }

    const payload = { project_id: project, owner_id: userId, doc_number: number.trim(), type, status, submitted_date: submitted || null, notes, ...fileFields }
    const tempId = 'temp-' + crypto.randomUUID()
    const optimistic = { id: tempId, ...payload, submitted_date: submitted, created_at: new Date().toISOString(), job } as unknown as Doc
    emit(evt.add('document'), optimistic)
    onClose()
    const { data, error } = await supabase.from('documents').insert(payload).select('*, job:jobs(*)').single()
    if (error || !data) emit(evt.remove('document'), tempId)
    else {
      const row = data as Doc
      emit<ReplacePayload<Doc>>(evt.replace('document'), { tempId, row })
      logActivity(supabase, { projectId: project, ownerId: userId, action: 'document_added', entityType: 'document', entityId: row.id, metadata: { name: `${row.doc_number} (${row.status})`, actor: 'You' } })
      notify(supabase, userId, { title: 'Document added', body: `${row.doc_number} — ${row.type} (${row.status})`, type: 'document', link: '/dashboard/documents' })
      if (row.status === 'Approved' || row.status === 'Rejected') {
        sendEmail(supabase, userId, 'document_status', { docNumber: row.doc_number, projectName: job?.name || '', status: row.status, link: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/documents` })
      }
    }
  }

  return (
    <Modal title="New document" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Document number" required error={numberErr ? 'Document number is required' : undefined}>
          <TextInput value={number} error={numberErr} onChange={v => { setNumber(v); setNumberErr(false) }} placeholder="DOC-2026-001" />
        </Field>
        <Field label="Project"><Select value={project} onChange={setProject} options={jobs.map(j => ({ value: j.id, label: j.name }))} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Type"><Select value={type} onChange={setType} options={TYPES.map(t => ({ value: t, label: t }))} /></Field>
          <Field label="Status"><Select value={status} onChange={v => setStatus(v as DocStatus)} options={STATUS.map(s => ({ value: s, label: s }))} /></Field>
        </div>
        <Field label="Submitted date"><TextInput type="date" value={submitted} onChange={setSubmitted} /></Field>
        <Field label="Notes"><TextArea value={notes} onChange={setNotes} placeholder="Any context for this document" /></Field>
        <Field label="Attachment (optional)" error={fileErr || undefined}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button type="button" onClick={() => fileRef.current?.click()} style={{ background:'#F0EEE6', border:'1px solid #DEDBD2', color:'#5C5A52', borderRadius:7, padding:'7px 12px', fontSize:13, fontFamily:'inherit', cursor:'pointer' }}>{file ? 'Change file' : 'Choose file'}</button>
            <span style={{ fontSize:12, color:'#8C8980', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file ? file.name : 'No file · up to 50 MB'}</span>
            <input ref={fileRef} type="file" style={{ display:'none' }} onChange={e => pickFile(e.target.files?.[0] || null)} />
          </div>
        </Field>
        <SubmitButton loading={loading}>Create document</SubmitButton>
      </form>
    </Modal>
  )
}
