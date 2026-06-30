import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:18 }}>
      <Skeleton width={180} height={22} />
      <div style={{ background:'#12141A', border:'1px solid #262A35', borderRadius:12, padding:16, display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8 }}>
        {Array.from({ length: 28 }).map((_, i) => <Skeleton key={i} height={80} radius={8} />)}
      </div>
    </div>
  )
}
