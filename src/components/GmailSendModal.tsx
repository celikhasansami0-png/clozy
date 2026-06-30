'use client'
import { useState } from 'react'
import Modal from './Modal'
import { Field, TextInput, TextArea, SubmitButton } from './form'

const C = { sub:'#5C5A52', muted:'#8C8980', err:'#C2574A', ok:'#7A9B76' }

// Small modal to send a document or report via the user's connected Gmail.
export default function GmailSendModal({ defaultSubject = '', defaultBody = '', onClose }: { defaultSubject?: string; defaultBody?: string; onClose: () => void }) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const res = await fetch('/api/integrations/gmail/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      })
      const json = await res.json()
      if (json.ok) { setMsg({ ok: true, text: 'Sent via Gmail.' }); setTimeout(onClose, 1200) }
      else if (json.error === 'not_connected') setMsg({ ok: false, text: 'Connect Gmail in Settings → Integrations first.' })
      else if (json.error === 'rate_limited') setMsg({ ok: false, text: 'Daily Gmail send limit (50) reached.' })
      else setMsg({ ok: false, text: 'Could not send. Please try again.' })
    } catch { setMsg({ ok: false, text: 'Network error.' }) }
    setLoading(false)
  }

  return (
    <Modal title="Send via Gmail" subtitle="Sends from your connected Gmail account" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Recipient email" required><TextInput type="email" value={to} onChange={setTo} placeholder="client@example.com" /></Field>
        <Field label="Subject"><TextInput value={subject} onChange={setSubject} placeholder="Subject" /></Field>
        <Field label="Message"><TextArea value={body} onChange={setBody} placeholder="Add a short message…" /></Field>
        {msg && <div style={{ fontSize:12, color: msg.ok ? C.ok : C.err, marginBottom:10 }}>{msg.text}</div>}
        <SubmitButton loading={loading}>Send email</SubmitButton>
      </form>
    </Modal>
  )
}
