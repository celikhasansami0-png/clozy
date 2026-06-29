'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Modal from '../Modal'
import { Field, TextInput, Select, ColorPicker, Slider, SubmitButton } from '../form'
import { emit, evt, type ReplacePayload } from '@/lib/bus'
import type { Job, JobStatus } from '@/lib/types'

const STATUS: JobStatus[] = ['In Progress', 'On Track', 'Delayed', 'Complete']
const PHASE = ['Planning', 'Site Survey', 'Design', 'Permitting', 'Construction', 'Commissioning', 'Complete']

export default function ProjectForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState(false)
  const [color, setColor] = useState('#F5A623')
  const [status, setStatus] = useState<JobStatus>('In Progress')
  const [phase, setPhase] = useState('Planning')
  const [completion, setCompletion] = useState(0)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setNameErr(true); return }
    setLoading(true)
    const tempId = 'temp-' + crypto.randomUUID()
    const optimistic: Job = { id: tempId, owner_id: userId, name: name.trim(), color, status, phase, completion, created_at: new Date().toISOString() }
    emit(evt.add('project'), optimistic)
    onClose()
    const { data, error } = await supabase.from('jobs').insert({ owner_id: userId, name: name.trim(), color, status, phase, completion }).select('*').single()
    if (error || !data) emit(evt.remove('project'), tempId)
    else emit<ReplacePayload<Job>>(evt.replace('project'), { tempId, row: data as Job })
  }

  return (
    <Modal title="New project" subtitle="Added to your projects" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Project name" required error={nameErr ? 'Project name is required' : undefined}>
          <TextInput value={name} error={nameErr} onChange={v => { setName(v); setNameErr(false) }} placeholder="Cedar Ridge Solar Farm — 12 MW" />
        </Field>
        <Field label="Color"><ColorPicker value={color} onChange={setColor} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Status"><Select value={status} onChange={v => setStatus(v as JobStatus)} options={STATUS.map(s => ({ value: s, label: s }))} /></Field>
          <Field label="Phase"><Select value={phase} onChange={setPhase} options={PHASE.map(s => ({ value: s, label: s }))} /></Field>
        </div>
        <Field label="Completion"><Slider value={completion} onChange={setCompletion} /></Field>
        <SubmitButton loading={loading}>Create project</SubmitButton>
      </form>
    </Modal>
  )
}
