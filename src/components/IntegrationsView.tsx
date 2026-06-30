'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { INTEGRATIONS, type IntegrationId } from '@/config/integrations'

const C = { bg:'#0A0B0D', bgCard:'#12141A', bgElevated:'#181B22', bgHover:'#1E222B', border:'#262A35', borderSubtle:'#1A1D24', text:'#F5F6F7', sub:'#9CA3AF', muted:'#5C6470', dim:'#2E3340', accent:'#4D7FFF', green:'#22C55E', red:'#F87171' }

export type IntegrationStatus = { id: IntegrationId; connected: boolean; healthy: boolean }

export default function IntegrationsView({ statuses, companyName, industry }: { statuses: IntegrationStatus[]; companyName: string; industry: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [busy, setBusy] = useState<string | null>(null)
  const statusMap = new Map(statuses.map(s => [s.id, s]))

  const connectedFlash = params.get('connected')
  const errorFlash = params.get('error')

  function connect(id: IntegrationId) {
    window.location.href = `/api/integrations/${id}/connect`
  }
  async function disconnect(id: IntegrationId) {
    setBusy(id)
    try { await fetch(`/api/integrations/${id}/disconnect`, { method: 'POST' }) } catch { /* ignore */ }
    setBusy(null)
    router.refresh()
  }

  return (
    <div style={{ padding:'28px 32px', overflowY:'auto', flex:1, background:C.bg }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Settings</div>
        <div style={{ fontSize:14, color:C.muted }}>Profile and connected services.</div>
      </div>

      {/* Profile */}
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', marginBottom:24, maxWidth:520 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Profile</div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${C.borderSubtle}` }}>
          <span style={{ fontSize:12, color:C.muted }}>Company</span><span style={{ fontSize:13, color:C.text }}>{companyName || '—'}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0' }}>
          <span style={{ fontSize:12, color:C.muted }}>Industry</span><span style={{ fontSize:13, color:C.text }}>{industry || '—'}</span>
        </div>
      </div>

      {/* Flash messages */}
      {connectedFlash && <div style={{ background:'rgba(34,197,94,0.10)', border:`1px solid rgba(34,197,94,0.35)`, color:C.text, borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13 }}>Connected {connectedFlash.replace(/_/g,' ')} successfully.</div>}
      {errorFlash && <div style={{ background:'rgba(248,113,113,0.10)', border:`1px solid rgba(248,113,113,0.35)`, color:C.text, borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13 }}>{errorFlash.endsWith('not_configured') ? 'That integration needs provider credentials configured by an admin before it can connect.' : `Could not complete: ${errorFlash.replace(/_/g,' ')}.`}</div>}

      <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Integrations</div>
      <div style={{ fontSize:12.5, color:C.muted, marginBottom:16 }}>Connect Scout to the tools your team already uses. Every integration is rate-limited and fails safely without affecting the app.</div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
        {INTEGRATIONS.map(meta => {
          const st = statusMap.get(meta.id)
          const connected = st?.connected
          return (
            <div key={meta.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:meta.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>{meta.logo}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{meta.name}</span>
                    {connected && <span title={st?.healthy ? 'Healthy' : 'Last action failed'} style={{ width:8, height:8, borderRadius:'50%', background: st?.healthy ? C.green : C.red, flexShrink:0 }} />}
                  </div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{meta.cap}</div>
                </div>
              </div>
              <div style={{ fontSize:12.5, color:C.sub, lineHeight:1.5, flex:1 }}>{meta.description}</div>
              {connected ? (
                <button onClick={() => disconnect(meta.id)} disabled={busy === meta.id} style={{ background:C.bgElevated, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer', alignSelf:'flex-start', opacity: busy === meta.id ? 0.6 : 1 }}>{busy === meta.id ? 'Disconnecting…' : 'Disconnect'}</button>
              ) : (
                <button onClick={() => connect(meta.id)} style={{ background:C.accent, border:'none', color:'#FFFFFF', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer', alignSelf:'flex-start' }}>Connect</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
