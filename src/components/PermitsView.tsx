'use client'
import { Tag, permitCfg } from './ui'
import type { Permit } from '@/lib/types'

const C = { bgCard:'#0F0F0F', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', muted:'#606060', dim:'#303030' }

export default function PermitsView({ permits }: { permits: Permit[] }) {
  const stats = [
    { label:'Total',           value:permits.length,                                      dim:false },
    { label:'Approved',        value:permits.filter(p=>p.status==='Approved').length,      dim:false },
    { label:'Pending / Review',value:permits.filter(p=>p.status!=='Approved').length,      dim:true },
  ]

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Permit Tracker</div>
        <div style={{ fontSize:14, color:C.muted }}>All permits across active job sites.</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 18px' }}>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.04em', color:s.dim?C.muted:C.text, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:12, color:C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 120px 110px', padding:'10px 18px', borderBottom:`1px solid ${C.border}`, fontSize:10, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:C.dim, fontWeight:600 }}>
          <span>Permit</span><span>Type</span><span>Submitted</span><span>Status</span>
        </div>
        {permits.length === 0 && (
          <div style={{ padding:'20px 18px', fontSize:13, color:C.muted }}>No permits added yet.</div>
        )}
        {permits.map((p, i) => {
          const sc = permitCfg[p.status] || { color:C.muted, bg:'transparent', border:C.dim }
          return (
            <div key={p.id} style={{ display:'grid', gridTemplateColumns:'1fr 120px 120px 110px', padding:'13px 18px', borderBottom:i<permits.length-1?`1px solid ${C.borderSubtle}`:'none', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{p.permit_number}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                  {(p as any).job?.name}
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
    </div>
  )
}
