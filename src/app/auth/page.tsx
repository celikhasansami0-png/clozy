'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const S = {
  page: { minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Claude Serif','Georgia',serif" } as React.CSSProperties,
  card: { width:360, background:'#0F0F0F', border:'1px solid #262626', borderRadius:14, padding:'36px 32px' } as React.CSSProperties,
  logo: { display:'flex', alignItems:'center', gap:10, marginBottom:32 } as React.CSSProperties,
  logoBox: { width:32, height:32, borderRadius:7, background:'#161616', border:'1px dashed #262626', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#303030', fontWeight:600, letterSpacing:'0.04em' } as React.CSSProperties,
  logoText: { fontWeight:700, fontSize:17, letterSpacing:'-0.02em', color:'#F2F2F2' } as React.CSSProperties,
  title: { fontSize:20, fontWeight:700, letterSpacing:'-0.03em', color:'#F2F2F2', marginBottom:6 } as React.CSSProperties,
  sub: { fontSize:13, color:'#606060', marginBottom:28 } as React.CSSProperties,
  tabs: { display:'flex', gap:0, marginBottom:24, borderBottom:'1px solid #181818' } as React.CSSProperties,
  tab: (active:boolean) => ({ background:'none', border:'none', padding:'8px 16px', fontSize:13, fontWeight:500, color: active ? '#F2F2F2' : '#606060', borderBottom: active ? '2px solid #A0A0A0' : '2px solid transparent', marginBottom:-1, cursor:'pointer', fontFamily:'inherit', transition:'all 0.1s' }) as React.CSSProperties,
  label: { fontSize:11, fontWeight:600, color:'#606060', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:6, display:'block' },
  input: { width:'100%', background:'#161616', border:'1px solid #262626', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#F2F2F2', outline:'none', fontFamily:'inherit', marginBottom:14, transition:'border-color 0.15s' } as React.CSSProperties,
  btn: { width:'100%', background:'#F2F2F2', border:'none', borderRadius:8, padding:'11px', fontSize:14, fontWeight:700, color:'#080808', cursor:'pointer', fontFamily:'inherit', marginTop:6, transition:'opacity 0.15s' } as React.CSSProperties,
  error: { fontSize:12, color:'#f87171', marginTop:12, textAlign:'center' as const },
  divider: { textAlign:'center' as const, fontSize:12, color:'#303030', margin:'20px 0' },
}

export default function AuthPage() {
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          {/* Replace with your logo */}
          <div style={S.logoBox}>LOGO</div>
          <span style={S.logoText}>BioNova</span>
        </div>

        <div style={S.tabs}>
          <button style={S.tab(mode==='login')} onClick={()=>setMode('login')}>Log in</button>
          <button style={S.tab(mode==='signup')} onClick={()=>setMode('signup')}>Sign up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div>
              <label style={S.label}>Your name</label>
              <input style={S.input} type="text" placeholder="Marcus T." value={name} onChange={e=>setName(e.target.value)} required
                onFocus={e=>(e.target.style.borderColor='#A0A0A0')}
                onBlur={e=>(e.target.style.borderColor='#262626')}
              />
            </div>
          )}
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} required
            onFocus={e=>(e.target.style.borderColor='#A0A0A0')}
            onBlur={e=>(e.target.style.borderColor='#262626')}
          />
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required
            onFocus={e=>(e.target.style.borderColor='#A0A0A0')}
            onBlur={e=>(e.target.style.borderColor='#262626')}
          />
          <button style={{...S.btn, opacity: loading ? 0.6 : 1}} type="submit" disabled={loading}>
            {loading ? 'Loading…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        {error && <p style={S.error}>{error}</p>}
        {success && <p style={{...S.error, color:'#4ade80'}}>{success}</p>}

        <p style={S.divider}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{color:'#A0A0A0', cursor:'pointer'}} onClick={()=>setMode(mode==='login'?'signup':'login')}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  )
}
