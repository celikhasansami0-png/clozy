import { Skeleton, GridSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div style={{ padding:'28px 32px', display:'flex', flexDirection:'column', gap:18 }}>
      <Skeleton width={220} height={22} />
      <GridSkeleton count={3} columns={3} />
      <div style={{ background:'#0F0F0F', border:'1px solid #262626', borderRadius:12, padding:'14px 18px', display:'flex', flexDirection:'column', gap:12 }}>
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={20} />)}
      </div>
    </div>
  )
}
