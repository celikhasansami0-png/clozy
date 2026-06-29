'use client'
import React from 'react'

const C = { text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030', border:'#262626', elevated:'#161616', err:'#f87171', focus:'#A0A0A0' }

function inputStyle(error?: boolean): React.CSSProperties {
  return { width:'100%', background:C.elevated, border:`1px solid ${error ? C.err : C.border}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:C.text, outline:'none', fontFamily:'inherit', colorScheme:'dark' }
}
function focusHandlers(error?: boolean) {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { if (!error) e.target.style.borderColor = C.focus },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { if (!error) e.target.style.borderColor = C.border },
  }
}

export function Field({ label, error, children, required }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6, display:'block' }}>
        {label}{required && <span style={{ color:C.sub }}> *</span>}
      </label>
      {children}
      {error && <div style={{ fontSize:11, color:C.err, marginTop:5 }}>{error}</div>}
    </div>
  )
}

export function TextInput({ value, onChange, placeholder, error, type = 'text', list }: { value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean; type?: string; list?: string }) {
  return <input type={type} list={list} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={inputStyle(error)} {...focusHandlers(error)} />
}

export function TextArea({ value, onChange, placeholder, error, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean; rows?: number }) {
  return <textarea rows={rows} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{ ...inputStyle(error), resize:'vertical' }} {...focusHandlers(error)} />
}

export function Select({ value, onChange, options, error }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; error?: boolean }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle(error), appearance:'none', cursor:'pointer' }} {...focusHandlers(error)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

const PRESET_COLORS: [string, string][] = [
  ['Amber', '#F5A623'], ['Blue', '#60a5fa'], ['Red', '#f87171'],
  ['Green', '#4ade80'], ['Purple', '#a78bfa'], ['Teal', '#2dd4bf'],
]
export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display:'flex', gap:10 }}>
      {PRESET_COLORS.map(([name, hex]) => (
        <button type="button" key={hex} title={name} onClick={() => onChange(hex)} style={{ width:28, height:28, borderRadius:'50%', background:hex, border: value === hex ? '2px solid #F2F2F2' : '2px solid transparent', boxShadow: value === hex ? '0 0 0 2px #0F0F0F' : 'none', cursor:'pointer', padding:0 }} />
      ))}
    </div>
  )
}

export function Slider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width:'100%', accentColor:'#4ade80' }} />
      <div style={{ fontSize:12, color:C.sub, marginTop:4 }}>{value}%</div>
    </div>
  )
}

export function SubmitButton({ loading, children }: { loading?: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading} style={{ width:'100%', background:C.text, color:'#080808', border:'none', borderRadius:8, padding:'11px', fontSize:14, fontWeight:700, fontFamily:'inherit', marginTop:6, cursor:'pointer', opacity: loading ? 0.6 : 1 }}>
      {loading ? 'Saving…' : children}
    </button>
  )
}

export function FormError({ message }: { message?: string }) {
  return message ? <div style={{ fontSize:12, color:C.err, marginTop:10, textAlign:'center' }}>{message}</div> : null
}
