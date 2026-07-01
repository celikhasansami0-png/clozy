'use client'
import React from 'react'

const C = { text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', dim:'#C2BFB5', border:'#DEDBD2', elevated:'#F0EEE6', err:'#C2574A', focus:'#5C5A52' }

function inputStyle(error?: boolean): React.CSSProperties {
  return { width:'100%', background:'#FFFFFF', border:`1px solid ${error ? C.err : C.border}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:C.text, outline:'none', fontFamily:'inherit', colorScheme:'light' }
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

// Dusty, muted project colors consistent with the warm light palette.
const PRESET_COLORS: [string, string][] = [
  ['Terracotta', '#CC785C'], ['Blue', '#6B8CAE'], ['Green', '#7A9B76'],
  ['Purple', '#9B7EA8'], ['Ochre', '#C99A5B'], ['Teal', '#6BA39B'],
]
export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display:'flex', gap:10 }}>
      {PRESET_COLORS.map(([name, hex]) => (
        <button type="button" key={hex} title={name} onClick={() => onChange(hex)} style={{ width:28, height:28, borderRadius:'50%', background:hex, border: value === hex ? '2px solid #1F1E1C' : '2px solid transparent', boxShadow: value === hex ? '0 0 0 2px #FFFFFF' : 'none', cursor:'pointer', padding:0 }} />
      ))}
    </div>
  )
}

export function Slider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width:'100%', accentColor:'#1F1E1C' }} />
      <div style={{ fontSize:12, color:C.sub, marginTop:4 }}>{value}%</div>
    </div>
  )
}

export function SubmitButton({ loading, children }: { loading?: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#B86A4E' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#CC785C' }}
      style={{ width:'100%', background:'#CC785C', color:'#FFFFFF', border:'none', borderRadius:8, padding:'11px', fontSize:14, fontWeight:700, fontFamily:'inherit', marginTop:6, cursor:'pointer', opacity: loading ? 0.6 : 1, transition:'background 0.12s' }}>
      {loading ? 'Saving…' : children}
    </button>
  )
}

export function FormError({ message }: { message?: string }) {
  return message ? <div style={{ fontSize:12, color:C.err, marginTop:10, textAlign:'center' }}>{message}</div> : null
}
