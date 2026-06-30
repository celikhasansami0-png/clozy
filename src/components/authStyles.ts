import React from 'react'

const FONT = "'Inter', system-ui, -apple-system, sans-serif"

export const A = {
  page: { minHeight:'100vh', background:'#0A0B0D', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:FONT } as React.CSSProperties,
  card: { width:380, maxWidth:'100%', background:'#12141A', border:'1px solid #262A35', borderRadius:14, padding:'36px 32px' } as React.CSSProperties,
  logo: { display:'flex', alignItems:'center', gap:10, marginBottom:28 } as React.CSSProperties,
  logoBox: { width:32, height:32, borderRadius:7, background:'#181B22', border:'1px dashed #262A35', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#2E3340', fontWeight:600, letterSpacing:'0.04em' } as React.CSSProperties,
  logoText: { fontWeight:700, fontSize:17, letterSpacing:'-0.02em', color:'#F5F6F7' } as React.CSSProperties,
  title: { fontSize:20, fontWeight:700, letterSpacing:'-0.03em', color:'#F5F6F7', marginBottom:6 } as React.CSSProperties,
  sub: { fontSize:13, color:'#5C6470', marginBottom:24 } as React.CSSProperties,
  label: { fontSize:11, fontWeight:600, color:'#5C6470', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:6, display:'block' },
  btn: { width:'100%', background:'#4D7FFF', border:'none', borderRadius:8, padding:'11px', fontSize:14, fontWeight:700, color:'#FFFFFF', cursor:'pointer', fontFamily:FONT, marginTop:8 } as React.CSSProperties,
  link: { color:'#9CA3AF', cursor:'pointer', textDecoration:'none' } as React.CSSProperties,
  formError: { fontSize:12, color:'#f87171', marginTop:12, textAlign:'center' as const },
  success: { fontSize:12.5, color:'#9CA3AF', marginTop:12, textAlign:'center' as const, lineHeight:1.5 },
}

export function inputStyle(error?: boolean): React.CSSProperties {
  return { width:'100%', background:'#181B22', border:`1px solid ${error ? '#f87171' : '#262A35'}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:'#F5F6F7', outline:'none', fontFamily:FONT, transition:'border-color 0.15s' }
}
export function fieldFocus(error?: boolean) {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => { if (!error) e.target.style.borderColor = '#9CA3AF' },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => { if (!error) e.target.style.borderColor = '#262A35' },
  }
}
export const fieldError: React.CSSProperties = { fontSize:11, color:'#f87171', marginTop:5 }

export function emailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
