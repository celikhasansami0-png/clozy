'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { MODULES, ONBOARDING_ORDER, type NicheKey } from '@/config/modules'

const C = { bg:'#080808', card:'#0F0F0F', elevated:'#161616', border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030' }
const FONT = "'Inter', system-ui, sans-serif"
const TEAM_SIZES = ['1-10', '10-50', '50-200', '200+']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [niche, setNiche] = useState<NicheKey | null>(null)
  const [company, setCompany] = useState('')
  const [companyErr, setCompanyErr] = useState(false)
  const [teamSize, setTeamSize] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (!data.user) router.replace('/auth') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function finish() {
    if (!company.trim()) { setCompanyErr(true); return }
    if (!niche) return
    setSaving(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }
    const { error: upErr } = await supabase.from('profiles').update({
      niche, company_name: company.trim(), team_size: teamSize || null, onboarded: true,
    }).eq('id', user.id)
    if (upErr) { setError(upErr.message); setSaving(false); return }
    // Load demo data for the chosen niche (best-effort).
    await supabase.rpc('seed_demo_data', { p_owner_id: user.id, p_niche: niche })
    router.replace('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:FONT, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'20px 28px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C.borderSubtle}` }}>
        <div style={{ width:28, height:28, borderRadius:6, background:C.elevated, border:`1px dashed ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:C.dim, fontWeight:600 }}>LOGO</div>
        <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.02em' }}>Bionova</span>
        <span style={{ marginLeft:'auto', fontSize:12, color:C.muted }}>Step {step} of 2</span>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'40px 24px' }}>
        <div style={{ width:'100%', maxWidth:720 }}>
          {step === 1 ? (
            <>
              <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginBottom:6 }}>What type of energy company are you?</div>
              <div style={{ fontSize:14, color:C.muted, marginBottom:28 }}>We&apos;ll tailor Bionova&apos;s modules, terminology and demo data to your work.</div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
                {ONBOARDING_ORDER.map(key => {
                  const m = MODULES[key]
                  const selected = niche === key
                  return (
                    <button key={key} onClick={() => setNiche(key)} style={{
                      background:C.card, border:`1px solid ${selected ? C.text : C.border}`, borderRadius:12,
                      padding:'22px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:12,
                      cursor:'pointer', fontFamily:'inherit', transition:'border-color 0.12s', textAlign:'center',
                    }}>
                      <span style={{ fontSize:30, lineHeight:1 }}>{m.icon}</span>
                      <span style={{ fontSize:12.5, fontWeight:600, color: selected ? C.text : C.sub, lineHeight:1.3 }}>{m.name}</span>
                    </button>
                  )
                })}
              </div>

              {niche && (
                <div style={{ marginTop:28, display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={() => setStep(2)} style={{ background:C.text, color:'#080808', border:'none', borderRadius:8, padding:'11px 24px', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>Continue →</button>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginBottom:6 }}>Tell us about your company</div>
              <div style={{ fontSize:14, color:C.muted, marginBottom:28 }}>{niche && MODULES[niche].name} workspace</div>

              <div style={{ maxWidth:440 }}>
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6, display:'block' }}>Company name *</label>
                  <input value={company} onChange={e => { setCompany(e.target.value); setCompanyErr(false) }} placeholder="Acme Renewables"
                    style={{ width:'100%', background:C.elevated, border:`1px solid ${companyErr ? '#f87171' : C.border}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:C.text, outline:'none', fontFamily:'inherit' }}
                    onFocus={e => { if (!companyErr) e.target.style.borderColor = '#A0A0A0' }} onBlur={e => { if (!companyErr) e.target.style.borderColor = C.border }} />
                  {companyErr && <div style={{ fontSize:11, color:'#f87171', marginTop:5 }}>Company name is required</div>}
                </div>

                <div style={{ marginBottom:24 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8, display:'block' }}>Team size</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {TEAM_SIZES.map(t => (
                      <button key={t} onClick={() => setTeamSize(t)} style={{ background: teamSize === t ? C.text : C.elevated, color: teamSize === t ? '#080808' : C.sub, border:`1px solid ${teamSize === t ? C.text : C.border}`, borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>{t}</button>
                    ))}
                  </div>
                </div>

                {error && <div style={{ fontSize:12, color:'#f87171', marginBottom:12 }}>{error}</div>}

                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setStep(1)} style={{ background:C.elevated, color:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:'11px 20px', fontSize:14, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>← Back</button>
                  <button onClick={finish} disabled={saving} style={{ flex:1, background:C.text, color:'#080808', border:'none', borderRadius:8, padding:'11px 24px', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Setting up your workspace…' : 'Enter Bionova'}</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
