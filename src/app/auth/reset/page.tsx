'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { A, inputStyle, fieldFocus, fieldError } from '@/components/authStyles'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ready, setReady] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [formError, setFormError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  // Establish a session from the recovery link (?code=...).
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    async function init() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { setLinkError('This reset link is invalid or has expired.'); return }
      }
      const { data } = await supabase.auth.getSession()
      if (!data.session) setLinkError('This reset link is invalid or has expired.')
      setReady(true)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    setFormError('')
    const e: typeof errors = {}
    if (password.length < 8) e.password = 'Password must be at least 8 characters'
    if (confirm !== password) e.confirm = 'Passwords do not match'
    setErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setFormError(error.message)
    else { setDone(true); setTimeout(() => router.push('/dashboard'), 1400) }
    setLoading(false)
  }

  return (
    <div style={A.page}>
      <div style={A.card}>
        <div style={A.logo}>
          <div style={A.logoBox}>LOGO</div>
          <span style={A.logoText}>Bionova</span>
        </div>
        <div style={A.title}>Set a new password</div>
        <div style={A.sub}>Choose a password with at least 8 characters.</div>

        {linkError ? (
          <p style={A.formError}>{linkError}</p>
        ) : done ? (
          <p style={A.success}>Password updated. Redirecting…</p>
        ) : (
          <form onSubmit={submit} noValidate>
            <div style={{ marginBottom:14 }}>
              <label style={A.label}>New password</label>
              <input type="password" style={inputStyle(!!errors.password)} value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }} placeholder="••••••••" disabled={!ready} {...fieldFocus(!!errors.password)} />
              {errors.password && <div style={fieldError}>{errors.password}</div>}
            </div>
            <div style={{ marginBottom:6 }}>
              <label style={A.label}>Confirm password</label>
              <input type="password" style={inputStyle(!!errors.confirm)} value={confirm} onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })) }} placeholder="••••••••" disabled={!ready} {...fieldFocus(!!errors.confirm)} />
              {errors.confirm && <div style={fieldError}>{errors.confirm}</div>}
            </div>
            <button style={{ ...A.btn, opacity: (loading || !ready) ? 0.6 : 1 }} type="submit" disabled={loading || !ready}>{loading ? 'Saving…' : 'Update password'}</button>
            {formError && <p style={A.formError}>{formError}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
