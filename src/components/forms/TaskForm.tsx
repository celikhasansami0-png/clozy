'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Modal from '../Modal'
import { Field, TextInput, Select, SubmitButton } from '../form'
import { emit, evt, type ReplacePayload } from '@/lib/bus'
import type { Job, Task, TaskStatus, TaskPriority, CrewMember } from '@/lib/types'

const TAGS = ['Rough-in', 'Permit', 'Inspection', 'Engineering', 'Survey', 'Commissioning', 'General']

export default function TaskForm({ userId, onClose, jobId, task }: { userId: string; onClose: () => void; jobId?: string; task?: Task }) {
  const supabase = createClient()
  const editing = !!task
  const [jobs, setJobs] = useState<Pick<Job, 'id' | 'name'>[]>([])
  const [crew, setCrew] = useState<CrewMember[]>([])
  const [title, setTitle] = useState(task?.title || '')
  const [titleErr, setTitleErr] = useState(false)
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'normal')
  const [assignee, setAssignee] = useState(task?.assignee_id || '')
  const [due, setDue] = useState(task?.due_date ? String(task.due_date).slice(0, 10) : '')
  const [tag, setTag] = useState(task?.tag || 'General')
  const [project, setProject] = useState(task?.job_id || jobId || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('jobs').select('id,name').eq('owner_id', userId).order('created_at').then(({ data }) => {
      if (data) { setJobs(data as Pick<Job, 'id' | 'name'>[]); if (!task && !jobId && data[0]) setProject((data[0] as { id: string }).id) }
    })
    supabase.from('crew_members').select('*').eq('owner_id', userId).order('name').then(({ data }) => { if (data) setCrew(data as CrewMember[]) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setTitleErr(true); return }
    if (!project) return
    setLoading(true)
    const payload = { job_id: project, owner_id: userId, title: title.trim(), status, priority, assignee_id: assignee || null, due_date: due || null, tag }
    if (editing) {
      const updated: Task = { ...task!, ...payload, assignee: crew.find(c => c.id === assignee) }
      emit(evt.update('task'), updated)
      onClose()
      await supabase.from('tasks').update(payload).eq('id', task!.id)
    } else {
      const tempId = 'temp-' + crypto.randomUUID()
      const optimistic: Task = { id: tempId, ...payload, created_at: new Date().toISOString(), assignee: crew.find(c => c.id === assignee) }
      emit(evt.add('task'), optimistic)
      onClose()
      const { data, error } = await supabase.from('tasks').insert(payload).select('*, assignee:crew_members(*)').single()
      if (error || !data) emit(evt.remove('task'), tempId)
      else emit<ReplacePayload<Task>>(evt.replace('task'), { tempId, row: data as Task })
    }
  }

  return (
    <Modal title={editing ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Title" required error={titleErr ? 'Title is required' : undefined}>
          <TextInput value={title} error={titleErr} onChange={v => { setTitle(v); setTitleErr(false) }} placeholder="Pile driving — rows 18–32" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Status"><Select value={status} onChange={v => setStatus(v as TaskStatus)} options={[{ value: 'todo', label: 'To Do' }, { value: 'in_progress', label: 'In Progress' }, { value: 'done', label: 'Done' }]} /></Field>
          <Field label="Priority"><Select value={priority} onChange={v => setPriority(v as TaskPriority)} options={['urgent', 'high', 'normal'].map(p => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))} /></Field>
        </div>
        <Field label="Project"><Select value={project} onChange={setProject} options={jobs.map(j => ({ value: j.id, label: j.name }))} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Assignee"><Select value={assignee} onChange={setAssignee} options={[{ value: '', label: 'Unassigned' }, ...crew.map(c => ({ value: c.id, label: c.name }))]} /></Field>
          <Field label="Due date"><TextInput type="date" value={due} onChange={setDue} /></Field>
        </div>
        <Field label="Tag">
          <TextInput value={tag} onChange={setTag} list="tag-suggestions" />
          <datalist id="tag-suggestions">{TAGS.map(t => <option key={t} value={t} />)}</datalist>
        </Field>
        <SubmitButton loading={loading}>{editing ? 'Save changes' : 'Create task'}</SubmitButton>
      </form>
    </Modal>
  )
}
