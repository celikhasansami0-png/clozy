'use client'
import { useState } from 'react'
import { Tag, permitCfg } from './ui'
import { flaggedPermits } from '@/lib/insights'
import { useCreate } from './CreateProvider'
import { useBus, evt, type ReplacePayload } from '@/lib/bus'
import type { Permit } from '@/lib/types'

const C = { bgCard:'#0F0F0F', bgElevated:'#161616', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', muted:'#606060', dim:'#303030', warnBg:'rgba(245,166,35,0.10)', warnBorder:'rgba(245,166,35,0.35)', warn:'#f5a623' }

export default function PermitsView({ permits: initialPermits }: { permits: Permit[] }) {
  const create = useCreate()
  const [permits, setPermits] = useState(initialPermits)

  useBus<Permit>(evt.add('permit'), p => setPermits(prev => prev.some(x => x.id === p.id) ? prev : [p, ...prev]))
  useBus<ReplacePayload<Permit>>(evt.replace('permit'), ({ tempId, row }) => setPermits(prev => prev.map(x => x.id === tempId ? row : x)))
  useBus<string>(evt.remove('permit'), id => setPermits(prev => prev.filter(x => x.id !== id)))

  const flagged = flaggedPermits(permits)
  const flaggedDays = new Map(flagged.map(f => [f.permit.id, f.daysInReview]))
  const stats = [
    { label:'Total',           value:permits.length,                                  dim:false },
    { label:'Approved',        value:permits.filter(p=>p.status==='Approved').length,  dim:false },
    { label:'Pending / Review',value:permits.filter(p=>p.status!=='Approved').length,  dim:true },
  ]

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Permit Tracker</div>
          <div style={{ fontSize:14, color:C.muted }}>Building, electrical, interconnection & PTO permits across active project sites.</div>
        </div>
        <button onClick={()=>create.newPermit()} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>+ New permit</button>
      </div>

      {flagged.length > 0 && (
        <div style={{ background:C.warnBg, border:`1px solid ${C.warnBorder}`, borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:C.text }}>
          <span style={{ fontWeight:700, color:C.warn }}>⚠ Permit agent:</span> {flagged.length} permit(s) have been &ldquo;Under Review&rdquo; for more than 14 days — follow up with the AHJ/utility.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 18px' }}>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.04em', color:s.dim?C.muted:C.text, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:12, color:C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {permits.length === 0 ? (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'40px 24px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
          <div style={{ fontSize:14, color:C.muted }}>No permits tracked yet. Add your first permit to start tracking approvals.</div>
          <button onClick={()=>create.newPermit()} style={{ background:C.text, color:'#080808', border:'none', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>+ New permit</button>
        </div>
      ) : (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 120px 110px', padding:'10px 18px', borderBottom:`1px solid ${C.border}`, fontSize:10, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:C.dim, fontWeight:600 }}>
            <span>Permit</span><span>Type</span><span>Submitted</span><span>Status</span>
          </div>
          {permits.map((p, i) => {
            const sc = permitCfg[p.status] || { color:C.muted, bg:'transparent', border:C.dim }
            return (
              <div key={p.id} style={{ display:'grid', gridTemplateColumns:'1fr 120px 120px 110px', padding:'13px 18px', borderBottom:i<permits.length-1?`1px solid ${C.borderSubtle}`:'none', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
                    {p.permit_number}
                    {flaggedDays.has(p.id) && (
                      <span style={{ fontSize:10, fontWeight:700, color:C.warn, background:C.warnBg, border:`1px solid ${C.warnBorder}`, padding:'1px 6px', borderRadius:4 }}>⚠ {flaggedDays.get(p.id)}d in review</span>
                    )}
                  </div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                    {p.job?.name}
                    {p.notes && <span style={{ color:C.dim }}> · {p.notes}</span>}
                  </div>
                </div>
                <span style={{ fontSize:12, color:C.muted }}>{p.type}</span>
                <span style={{ fontSize:12, color:C.muted }}>{p.submitted_date}</span>
                <Tag label={p.status} color={sc.color} bg={sc.bg} border={sc.border} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
