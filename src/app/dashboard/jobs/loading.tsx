import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
      <div style={{ width:255, borderRight:'1px solid #262626', padding:16, display:'flex', flexDirection:'column', gap:8 }}>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={40} radius={7} />)}
      </div>
      <div style={{ flex:1, padding:'20px', display:'flex', flexDirection:'column', gap:12 }}>
        <Skeleton width="38%" height={20} />
        <Skeleton width="100%" height={4} radius={2} />
        <div style={{ height:8 }} />
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} height={42} radius={8} />)}
      </div>
    </div>
  )
}
