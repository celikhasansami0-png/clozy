import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#FAF9F5', color:'#1F1E1C', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:56, fontWeight:800, letterSpacing:'-0.04em', marginBottom:8 }}>404</div>
        <div style={{ fontSize:15, color:'#5C5A52', marginBottom:24 }}>This page doesn&apos;t exist or has moved.</div>
        <Link href="/dashboard" style={{ display:'inline-block', background:'#CC785C', color:'#FFFFFF', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:700, textDecoration:'none' }}>Back to dashboard</Link>
      </div>
    </div>
  )
}
