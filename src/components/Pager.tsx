'use client'
import { LIMITS } from '@/config/limits'

const C = { bgElevated:'#F0EEE6', border:'#DEDBD2', text:'#1F1E1C', muted:'#8C8980' }

export const PAGE_SIZE = LIMITS.pageSize

export default function Pager({ page, total, pageSize = PAGE_SIZE, onPage }: { page: number; total: number; pageSize?: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  const btn = (disabled: boolean): React.CSSProperties => ({ background: C.bgElevated, border: `1px solid ${C.border}`, color: disabled ? C.muted : C.text, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px' }}>
      <button disabled={page <= 0} onClick={() => onPage(page - 1)} style={btn(page <= 0)}>← Prev</button>
      <span style={{ fontSize: 12, color: C.muted }}>Page {page + 1} of {pages}</span>
      <button disabled={page >= pages - 1} onClick={() => onPage(page + 1)} style={btn(page >= pages - 1)}>Next →</button>
    </div>
  )
}
