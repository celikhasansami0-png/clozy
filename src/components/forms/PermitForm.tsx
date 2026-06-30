'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Modal from '../Modal'
import { Field, TextInput, TextArea, Select, SubmitButton } from '../form'
import { emit, evt, type ReplacePayload } from '@/lib/bus'
import { logActivity, notify } from '@/lib/log'
import { sendEmail } from '@/lib/email'
import { useNiche } from '../NicheProvider'
import type { Job, Permit, PermitStatus } from '@/lib/types'

const STATUS: PermitStatus[] = ['Pending', 'Under Review', 'Approved', 'Rejected']

export default function PermitForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const supabase = createClient()
  const { module: mod } = useNiche()
  const TYPES = mod.permitTypes
  const [jobs, setJobs] = useState<Pick<Job, 'id' | 'name'>[]>([])
  const [number, setNumber] = useState('')
  const [numberErr, setNumberErr] = useState(false)
  const [project, setProject] = useState('')
  const [type, setType] = useState(TYPES[0])
  const [status, setStatus] = useState<PermitStatus>('Pending')
  const [submitted, setSubmitted] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('jobs').select('id,name').eq('owner_id', userId).order('created_at').then(({ data }) => {
      if (data) { setJobs(data as Pick<Job, 'id' | 'name'>[]); if (data[0]) setProject((data[0] as { id: string }).id) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!number.trim()) { setNumberErr(true); return }
    if (!project) return
    setLoading(true)
    const job = jobs.find(j => j.id === project)
    const payload = { job_id: project, owner_id: userId, permit_number: number.trim(), type, status, submitted_date: submitted || null, notes }
    const tempId = 'temp-' + crypto.randomUUID()
    const optimistic = { id: tempId, ...payload, submitted_date: submitted, created_at: new Date().toISOString(), job } as unknown as Permit
    emit(evt.add('permit'), optimistic)
    onClose()
    const { data, error } = await supabase.from('permits').insert(payload).select('*, job:jobs(*)').single()
    if (error || !data) emit(evt.remove('permit'), tempId)
    else {
      const row = data as Permit
      emit<ReplacePayload<Permit>>(evt.replace('permit'), { tempId, row })
      logActivity(supabase, { projectId: project, ownerId: userId, action: 'permit_added', entityType: 'permit', entityId: row.id, metadata: { name: `${row.permit_number} (${row.status})`, actor: 'You' } })
      notify(supabase, userId, { title: 'Permit added', body: `${row.permit_number} — ${row.type} (${row.status})`, type: 'permit', link: '/dashboard/permits' })
      if (row.status === 'Approved' || row.status === 'Rejected') {
        sendEmail(supabase, userId, 'permit_status', { permitNumber: row.permit_number, projectName: job?.name || '', status: row.status, link: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/permits` })
      }
    }
  }

  return (
    <Modal title="New permit" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Permit number" required error={numberErr ? 'Permit number is required' : undefined}>
          <TextInput value={number} error={numberErr} onChange={v => { setNumber(v); setNumberErr(false) }} placeholder="P-26-8821" />
        </Field>
        <Field label="Project"><Select value={project} onChange={setProject} options={jobs.map(j => ({ value: j.id, label: j.name }))} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Type"><Select value={type} onChange={setType} options={TYPES.map(t => ({ value: t, label: t }))} /></Field>
          <Field label="Status"><Select value={status} onChange={v => setStatus(v as PermitStatus)} options={STATUS.map(s => ({ value: s, label: s }))} /></Field>
        </div>
        <Field label="Submitted date"><TextInput type="date" value={submitted} onChange={setSubmitted} /></Field>
        <Field label="Notes"><TextArea value={notes} onChange={setNotes} placeholder="Revision requested — string layout detail" /></Field>
        <SubmitButton loading={loading}>Create permit</SubmitButton>
      </form>
    </Modal>
  )
}
