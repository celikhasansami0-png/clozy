'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const C = { bg:'#FAF9F5', card:'#FFFFFF', elevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5', accent:'#CC785C' }
const FONT = "'Inter', system-ui, sans-serif"
const TEAM_SIZES = ['1-10', '10-50', '50-200', '200+']
const CLIENT_COUNTS = ['1 to 5', '5 to 20', '20+']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [company, setCompany] = useState('')
  const [companyErr, setCompanyErr] = useState(false)
  const [clientCount, setClientCount] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (!data.user) router.replace('/auth') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function finish() {
    if (!company.trim()) { setCompanyErr(true); return }
    setSaving(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }
    const { error: upErr } = await supabase.from('profiles').update({
      company_name: company.trim(), client_count: clientCount || null, team_size: teamSize || null, onboarded: true,
    }).eq('id', user.id)
    if (upErr) { setError(upErr.message); setSaving(false); return }
    // Seed agency demo data (best-effort).
    await supabase.rpc('seed_demo_data', { p_owner_id: user.id })
    router.replace('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:FONT, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'20px 28px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C.borderSubtle}` }}>
        {/* Logo — place a dark/black logo at public/logo.png (suits the light background) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" width={28} height={28} alt="Doppio" style={{ borderRadius:6, objectFit:'contain' }} />
        <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.02em' }}>Doppio</span>
        <span style={{ marginLeft:'auto', fontSize:12, color:C.muted }}>Welcome</span>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'40px 24px' }}>
        <div style={{ width:'100%', maxWidth:480 }}>
          <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginBottom:6 }}>Tell us about your company</div>
          <div style={{ fontSize:14, color:C.muted, marginBottom:28 }}>A few details so we can set up your workspace.</div>

          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6, display:'block' }}>Company name *</label>
            <input value={company} onChange={e => { setCompany(e.target.value); setCompanyErr(false) }} placeholder="Acme Inc."
              style={{ width:'100%', background:C.elevated, border:`1px solid ${companyErr ? '#C2574A' : C.border}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:C.text, outline:'none', fontFamily:'inherit' }}
              onFocus={e => { if (!companyErr) e.target.style.borderColor = C.accent }} onBlur={e => { if (!companyErr) e.target.style.borderColor = C.border }} />
            {companyErr && <div style={{ fontSize:11, color:'#C2574A', marginTop:5 }}>Company name is required</div>}
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8, display:'block' }}>How many clients are you currently managing?</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {CLIENT_COUNTS.map(c => (
                <button key={c} type="button" onClick={() => setClientCount(c)} style={{ background: clientCount === c ? C.accent : C.elevated, color: clientCount === c ? '#FFFFFF' : C.sub, border:`1px solid ${clientCount === c ? C.accent : C.border}`, borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>{c}</button>
              ))}
            </div>
            <div style={{ fontSize:11, color:C.dim, marginTop:6 }}>Optional — shown on your profile. It doesn&apos;t change how Doppio works.</div>
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8, display:'block' }}>Team size</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {TEAM_SIZES.map(t => (
                <button key={t} onClick={() => setTeamSize(t)} style={{ background: teamSize === t ? C.accent : C.elevated, color: teamSize === t ? '#FFFFFF' : C.sub, border:`1px solid ${teamSize === t ? C.accent : C.border}`, borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>{t}</button>
              ))}
            </div>
          </div>

          {error && <div style={{ fontSize:12, color:'#C2574A', marginBottom:12 }}>{error}</div>}

          <button onClick={finish} disabled={saving} style={{ width:'100%', background:C.accent, color:'#FFFFFF', border:'none', borderRadius:8, padding:'12px 24px', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Setting up your workspace…' : 'Enter Doppio'}</button>
        </div>
      </div>
    </div>
  )
}
