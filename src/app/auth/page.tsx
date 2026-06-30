'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { A, inputStyle, fieldFocus, fieldError, emailValid } from '@/components/authStyles'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function validate() {
    const e: typeof errors = {}
    if (mode === 'signup' && !name.trim()) e.name = 'Your name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!emailValid(email)) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    else if (mode === 'signup' && password.length < 8) e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setFormError(''); setSuccess('')
    if (!validate()) return
    setLoading(true)
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setFormError(error.message)
      else setSuccess('Check your email to confirm your account, then sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setFormError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  function switchMode(m: 'login' | 'signup') {
    setMode(m); setErrors({}); setFormError(''); setSuccess('')
  }

  return (
    <div style={A.page}>
      <div style={A.card}>
        <div style={A.logo}>
          {/* Logo — place your logo file at public/logo.png */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" width={32} height={32} alt="Scout" style={{ borderRadius:7, objectFit:'contain' }} />
          <span style={A.logoText}>Scout</span>
        </div>

        <div style={{ display:'flex', marginBottom:24, borderBottom:'1px solid #1A1D24' }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{ background:'none', border:'none', padding:'8px 16px', fontSize:13, fontWeight:500, color: mode === m ? '#F5F6F7' : '#5C6470', borderBottom: mode === m ? '2px solid #F5F6F7' : '2px solid transparent', marginBottom:-1, cursor:'pointer', fontFamily:'inherit' }}>
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div style={{ marginBottom:14 }}>
              <label style={A.label}>Your name</label>
              <input style={inputStyle(!!errors.name)} value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }} placeholder="Marcus Thompson" {...fieldFocus(!!errors.name)} />
              {errors.name && <div style={fieldError}>{errors.name}</div>}
            </div>
          )}
          <div style={{ marginBottom:14 }}>
            <label style={A.label}>Email</label>
            <input type="email" style={inputStyle(!!errors.email)} value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }} placeholder="you@company.com" {...fieldFocus(!!errors.email)} />
            {errors.email && <div style={fieldError}>{errors.email}</div>}
          </div>
          <div style={{ marginBottom:6 }}>
            <label style={A.label}>Password</label>
            <input type="password" style={inputStyle(!!errors.password)} value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }} placeholder="••••••••" {...fieldFocus(!!errors.password)} />
            {errors.password && <div style={fieldError}>{errors.password}</div>}
          </div>

          {mode === 'login' && (
            <div style={{ textAlign:'right', marginTop:8 }}>
              <Link href="/auth/forgot" style={{ ...A.link, fontSize:12 }}>Forgot password?</Link>
            </div>
          )}

          <button style={{ ...A.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Loading…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        {formError && <p style={A.formError}>{formError}</p>}
        {success && <p style={A.success}>{success}</p>}

        <p style={{ textAlign:'center', fontSize:12, color:'#2E3340', marginTop:20 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={A.link} onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  )
}
