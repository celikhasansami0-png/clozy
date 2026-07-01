import { Skeleton, CardSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div style={{ padding:'28px 32px', display:'flex', flexDirection:'column', gap:18 }}>
      <Skeleton width={160} height={22} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} lines={2} />)}
      </div>
    </div>
  )
}
