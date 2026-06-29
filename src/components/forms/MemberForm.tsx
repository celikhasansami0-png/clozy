'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Modal from '../Modal'
import { Field, TextInput, Select, SubmitButton } from '../form'
import { emit, evt, type ReplacePayload } from '@/lib/bus'
import { logActivity, notify } from '@/lib/log'
import type { CrewMember } from '@/lib/types'

const ROLES = ['Foreman', 'Electrician', 'Engineer', 'Project Manager', 'Apprentice', 'Consultant']

function initialsFrom(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export default function MemberForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState(false)
  const [initials, setInitials] = useState('')
  const [initialsTouched, setInitialsTouched] = useState(false)
  const [role, setRole] = useState('Electrician')
  const [loading, setLoading] = useState(false)

  function onName(v: string) {
    setName(v); setNameErr(false)
    if (!initialsTouched) setInitials(initialsFrom(v))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setNameErr(true); return }
    setLoading(true)
    const ini = initials.trim() || initialsFrom(name) || name.slice(0, 2).toUpperCase()
    const payload = { owner_id: userId, name: name.trim(), initials: ini, role }
    const tempId = 'temp-' + crypto.randomUUID()
    const optimistic: CrewMember = { id: tempId, ...payload, created_at: new Date().toISOString() }
    emit(evt.add('member'), optimistic)
    onClose()
    const { data, error } = await supabase.from('crew_members').insert(payload).select('*').single()
    if (error || !data) emit(evt.remove('member'), tempId)
    else {
      const row = data as CrewMember
      emit<ReplacePayload<CrewMember>>(evt.replace('member'), { tempId, row })
      notify(supabase, userId, { title: 'Team member added', body: `${row.name} (${row.role}) joined the team`, type: 'team', link: '/dashboard/crew' })
      logActivity(supabase, { ownerId: userId, action: 'member_added', entityType: 'member', entityId: row.id, metadata: { name: row.name, actor: 'You' } })
    }
  }

  return (
    <Modal title="Add team member" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Full name" required error={nameErr ? 'Name is required' : undefined}>
          <TextInput value={name} error={nameErr} onChange={onName} placeholder="Marcus Thompson" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <Field label="Initials"><TextInput value={initials} onChange={v => { setInitials(v.toUpperCase().slice(0, 3)); setInitialsTouched(true) }} placeholder="MT" /></Field>
          <Field label="Role"><Select value={role} onChange={setRole} options={ROLES.map(r => ({ value: r, label: r }))} /></Field>
        </div>
        <SubmitButton loading={loading}>Add member</SubmitButton>
      </form>
    </Modal>
  )
}
