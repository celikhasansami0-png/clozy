'use client'
import React from 'react'

const C = { elevated: '#F0EEE6', border: '#DEDBD2' }

export function Skeleton({ width = '100%', height = 14, radius = 6, style }: { width?: number | string; height?: number | string; radius?: number; style?: React.CSSProperties }) {
  return (
    <div
      className="bn-skeleton"
      style={{ width, height, borderRadius: radius, background: C.elevated, border: `1px solid ${C.border}`, ...style }}
    />
  )
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width="40%" height={22} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={`${90 - i * 12}%`} height={12} />
      ))}
    </div>
  )
}

export function GridSkeleton({ count = 4, columns = 4 }: { count?: number; columns?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} lines={1} />
      ))}
    </div>
  )
}
