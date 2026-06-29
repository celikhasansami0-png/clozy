import React from 'react'

const FONT = "'Inter', system-ui, -apple-system, sans-serif"

export const A = {
  page: { minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:FONT } as React.CSSProperties,
  card: { width:380, maxWidth:'100%', background:'#0F0F0F', border:'1px solid #262626', borderRadius:14, padding:'36px 32px' } as React.CSSProperties,
  logo: { display:'flex', alignItems:'center', gap:10, marginBottom:28 } as React.CSSProperties,
  logoBox: { width:32, height:32, borderRadius:7, background:'#161616', border:'1px dashed #262626', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#303030', fontWeight:600, letterSpacing:'0.04em' } as React.CSSProperties,
  logoText: { fontWeight:700, fontSize:17, letterSpacing:'-0.02em', color:'#F2F2F2' } as React.CSSProperties,
  title: { fontSize:20, fontWeight:700, letterSpacing:'-0.03em', color:'#F2F2F2', marginBottom:6 } as React.CSSProperties,
  sub: { fontSize:13, color:'#606060', marginBottom:24 } as React.CSSProperties,
  label: { fontSize:11, fontWeight:600, color:'#606060', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:6, display:'block' },
  btn: { width:'100%', background:'#F2F2F2', border:'none', borderRadius:8, padding:'11px', fontSize:14, fontWeight:700, color:'#080808', cursor:'pointer', fontFamily:FONT, marginTop:8 } as React.CSSProperties,
  link: { color:'#A0A0A0', cursor:'pointer', textDecoration:'none' } as React.CSSProperties,
  formError: { fontSize:12, color:'#f87171', marginTop:12, textAlign:'center' as const },
  success: { fontSize:12.5, color:'#A0A0A0', marginTop:12, textAlign:'center' as const, lineHeight:1.5 },
}

export function inputStyle(error?: boolean): React.CSSProperties {
  return { width:'100%', background:'#161616', border:`1px solid ${error ? '#f87171' : '#262626'}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:'#F2F2F2', outline:'none', fontFamily:FONT, transition:'border-color 0.15s' }
}
export function fieldFocus(error?: boolean) {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => { if (!error) e.target.style.borderColor = '#A0A0A0' },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => { if (!error) e.target.style.borderColor = '#262626' },
  }
}
export const fieldError: React.CSSProperties = { fontSize:11, color:'#f87171', marginTop:5 }

export function emailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
