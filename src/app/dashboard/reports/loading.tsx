import { GridSkeleton, CardSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GridSkeleton count={4} columns={4} />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={3} />
    </div>
  )
}
