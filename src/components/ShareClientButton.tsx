'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Modal from './Modal'

const C = { bgElevated:'#F0EEE6', border:'#DEDBD2', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', accent:'#CC785C', green:'#7A9B76' }

export default function ShareClientButton({ jobId }: { jobId: string }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  async function ensureToken() {
    setOpen(true); setBusy(true)
    const { data } = await supabase.from('jobs').select('client_access_token').eq('id', jobId).single()
    let t = (data as { client_access_token?: string } | null)?.client_access_token || null
    if (!t) { t = crypto.randomUUID(); await supabase.from('jobs').update({ client_access_token: t }).eq('id', jobId) }
    setToken(t); setBusy(false)
  }

  async function regenerate() {
    setBusy(true); setCopied(false)
    const t = crypto.randomUUID()
    await supabase.from('jobs').update({ client_access_token: t }).eq('id', jobId)
    setToken(t); setBusy(false)
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://doppio.app'
  const url = token ? `${origin}/client/${token}` : ''

  function copy() { if (url) { navigator.clipboard?.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500) } }

  return (
    <>
      <button onClick={ensureToken} style={{ background:'#FFFFFF', border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'7px 12px', fontSize:12.5, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>Share with Client</button>
      {open && (
        <Modal title="Share with client" subtitle="A read-only view of this project" onClose={() => setOpen(false)} width={520}>
          <div style={{ fontSize:12.5, color:C.sub, marginBottom:12 }}>Anyone with this link can view a read-only summary of this project — no login required. Regenerating invalidates the old link.</div>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <input readOnly value={busy ? 'Generating…' : url} style={{ flex:1, background:C.bgElevated, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', fontSize:12.5, color:C.text, fontFamily:'inherit', outline:'none' }} />
            <button onClick={copy} disabled={!token} style={{ background:C.accent, border:'none', color:'#FFFFFF', borderRadius:8, padding:'9px 14px', fontSize:12.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', flexShrink:0 }}>{copied ? 'Copied!' : 'Copy Link'}</button>
          </div>
          <button onClick={regenerate} disabled={busy} style={{ background:'none', border:`1px solid ${C.border}`, color:C.sub, borderRadius:8, padding:'8px 14px', fontSize:12.5, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>Regenerate Link</button>
        </Modal>
      )}
    </>
  )
}
