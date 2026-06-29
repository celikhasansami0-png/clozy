import React from 'react'

// Green accent palette (BioNova / sustainability theme)
export const accent = {
  base:   '#4ade80',                    // green-400
  bright: '#86efac',                    // green-300 (tall bars / highlights)
  deep:   '#22c55e',                    // green-500
  dark:   '#2e6b45',                    // muted/short bars
  soft:   'rgba(74,222,128,0.12)',
  border: 'rgba(74,222,128,0.35)',
}

const C = { text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', dim:'#303030', border:'#262626', elevated:'#161616', highBg:'rgba(242,242,242,0.07)', highBorder:'rgba(242,242,242,0.18)', midBg:'rgba(160,160,160,0.07)', midBorder:'rgba(160,160,160,0.15)', lowBg:'rgba(96,96,96,0.06)', lowBorder:'rgba(96,96,96,0.12)' }

export const statusCfg: Record<string,{label:string,color:string,bg:string,border:string}> = {
  todo:        { label:'To Do',       color:C.muted,       bg:'transparent', border:C.dim },
  in_progress: { label:'In Progress', color:accent.bright, bg:accent.soft,   border:accent.border },
  done:        { label:'Done',        color:C.muted,       bg:C.lowBg,       border:C.lowBorder },
}
export const priorityCfg: Record<string,{label:string,color:string}> = {
  urgent: { label:'Urgent', color:C.text },
  high:   { label:'High',   color:C.sub },
  normal: { label:'Normal', color:C.muted },
}
export const permitCfg: Record<string,{color:string,bg:string,border:string}> = {
  'Approved':     { color:C.text,  bg:C.highBg, border:C.highBorder },
  'Under Review': { color:C.sub,   bg:C.midBg,  border:C.midBorder },
  'Pending':      { color:C.muted, bg:C.lowBg,  border:C.lowBorder },
  'Rejected':     { color:C.muted, bg:C.lowBg,  border:C.lowBorder },
}
export const jobStatusColor: Record<string,string> = {
  'In Progress': accent.base,
  'On Track':    accent.bright,
  'Delayed':     C.sub,
  'Complete':    accent.deep,
}

export function Tag({ label, color=C.muted, bg='transparent', border }: { label:string, color?:string, bg?:string, border?:string }) {
  return (
    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:4, background:bg, color, border:`1px solid ${border||color+'30'}`, whiteSpace:'nowrap', letterSpacing:'0.02em' }}>
      {label}
    </span>
  )
}

export function ProgressBar({ value }: { value:number }) {
  return (
    <div style={{ height:2, background:C.border, borderRadius:2, overflow:'hidden', width:'100%' }}>
      <div style={{ width:`${value}%`, height:'100%', background:accent.base, borderRadius:2, transition:'width 0.4s' }} />
    </div>
  )
}

export function StatusDot({ status }: { status:string }) {
  const cfg = statusCfg[status] || statusCfg.todo
  return <div style={{ width:14, height:14, borderRadius:'50%', flexShrink:0, marginTop:2, border:`1.5px solid ${cfg.border}`, background:cfg.bg }} />
}

export function Avatar({ initials, size=26 }: { initials:string, size?:number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:C.elevated, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:700, color:C.sub, flexShrink:0 }}>
      {initials}
    </div>
  )
}
