import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div style={{ padding:'28px 32px', display:'flex', flexDirection:'column', gap:18 }}>
      <Skeleton width={160} height={22} />
      <Skeleton width={320} height={32} />
      <div style={{ background:'#FFFFFF', border:'1px solid #DEDBD2', borderRadius:12, padding:'14px 18px', display:'flex', flexDirection:'column', gap:12 }}>
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} height={20} />)}
      </div>
    </div>
  )
}
