'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { A, inputStyle, fieldFocus, fieldError, emailValid } from '@/components/authStyles'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    setError(''); setFormError('')
    if (!email.trim()) { setError('Email is required'); return }
    if (!emailValid(email)) { setError('Enter a valid email address'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` })
    if (error) setFormError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div style={A.page}>
      <div style={A.card}>
        <div style={A.logo}>
          {/* Logo — place your logo file at public/logo.png */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" width={32} height={32} alt="Orbit" style={{ borderRadius:7, objectFit:'contain' }} />
          <span style={A.logoText}>Orbit</span>
        </div>
        <div style={A.title}>Reset your password</div>
        <div style={A.sub}>We&apos;ll email you a secure link to set a new password.</div>

        {sent ? (
          <p style={A.success}>If an account exists for <strong style={{ color:'#F5F6F7' }}>{email}</strong>, a reset link is on its way. Check your inbox.</p>
        ) : (
          <form onSubmit={submit} noValidate>
            <div style={{ marginBottom:6 }}>
              <label style={A.label}>Email</label>
              <input type="email" style={inputStyle(!!error)} value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="you@company.com" {...fieldFocus(!!error)} />
              {error && <div style={fieldError}>{error}</div>}
            </div>
            <button style={{ ...A.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
            {formError && <p style={A.formError}>{formError}</p>}
          </form>
        )}

        <p style={{ textAlign:'center', fontSize:12, color:'#2E3340', marginTop:20 }}>
          <Link href="/auth" style={A.link}>← Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
