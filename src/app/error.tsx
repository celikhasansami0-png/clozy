'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{ minHeight:'100vh', background:'#0A0B0D', color:'#F5F6F7', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:420 }}>
        <div style={{ fontSize:56, fontWeight:800, letterSpacing:'-0.04em', marginBottom:8 }}>500</div>
        <div style={{ fontSize:15, color:'#9CA3AF', marginBottom:24 }}>Something went wrong on our end. Please try again.</div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={reset} style={{ background:'#4D7FFF', color:'#FFFFFF', border:'none', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Try again</button>
          <a href="/dashboard" style={{ background:'#181B22', color:'#F5F6F7', border:'1px solid #262A35', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:600, textDecoration:'none' }}>Dashboard</a>
        </div>
      </div>
    </div>
  )
}
