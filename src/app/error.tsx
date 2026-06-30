'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{ minHeight:'100vh', background:'#FAF9F5', color:'#1F1E1C', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:420 }}>
        <div style={{ fontSize:56, fontWeight:800, letterSpacing:'-0.04em', marginBottom:8 }}>500</div>
        <div style={{ fontSize:15, color:'#5C5A52', marginBottom:24 }}>Something went wrong on our end. Please try again.</div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={reset} style={{ background:'#CC785C', color:'#FFFFFF', border:'none', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Try again</button>
          <a href="/dashboard" style={{ background:'#F0EEE6', color:'#1F1E1C', border:'1px solid #DEDBD2', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:600, textDecoration:'none' }}>Dashboard</a>
        </div>
      </div>
    </div>
  )
}
