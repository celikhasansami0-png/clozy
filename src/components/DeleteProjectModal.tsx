'use client'
import { useState } from 'react'
import Modal from './Modal'
import type { Job } from '@/lib/types'

const C = { elevated:'#181B22', border:'#262A35', text:'#F5F6F7', sub:'#9CA3AF', muted:'#5C6470', err:'#f87171' }

export default function DeleteProjectModal({ job, label, onClose, onConfirm }: { job: Job; label: string; onClose: () => void; onConfirm: () => void }) {
  const [value, setValue] = useState('')
  const match = value.trim() === job.name

  return (
    <Modal title={`Delete ${label.toLowerCase()}`} onClose={onClose}>
      <p style={{ fontSize:13, color:C.sub, lineHeight:1.6, margin:'0 0 16px' }}>
        This permanently deletes <strong style={{ color:C.text }}>{job.name}</strong> and all of its tasks and documents. This cannot be undone.
      </p>
      <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6, display:'block' }}>Type the {label.toLowerCase()} name to confirm</label>
      <input value={value} onChange={e => setValue(e.target.value)} placeholder={job.name}
        style={{ width:'100%', background:C.elevated, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:C.text, outline:'none', fontFamily:'inherit', marginBottom:16 }} />
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, background:C.elevated, color:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:'11px', fontSize:14, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>Cancel</button>
        <button onClick={onConfirm} disabled={!match} style={{ flex:1, background: match ? 'rgba(248,113,113,0.14)' : C.elevated, color: match ? C.err : C.muted, border:`1px solid ${match ? 'rgba(248,113,113,0.5)' : C.border}`, borderRadius:8, padding:'11px', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor: match ? 'pointer' : 'not-allowed' }}>Delete</button>
      </div>
    </Modal>
  )
}
