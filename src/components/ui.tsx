import React from 'react'

// Blue accent — Scout design system. Primary accent is blue (#4D7FFF);
// only project-specific colors stay independently colored.
export const accent = {
  base:   '#4D7FFF',                    // primary blue
  bright: '#7FA0FF',                    // bright blue (highlights / tall bars)
  deep:   '#3A66E0',                    // deep blue (secondary)
  dark:   '#16203A',                    // muted blue (short bars / fills)
  soft:   'rgba(77,127,255,0.12)',
  border: 'rgba(77,127,255,0.32)',
}

const C = { text:'#F5F6F7', sub:'#9CA3AF', muted:'#5C6470', dim:'#2E3340', border:'#262A35', elevated:'#181B22', highBg:'rgba(77,127,255,0.07)', highBorder:'rgba(77,127,255,0.18)', midBg:'rgba(160,160,160,0.07)', midBorder:'rgba(160,160,160,0.15)', lowBg:'rgba(96,96,96,0.06)', lowBorder:'rgba(96,96,96,0.12)' }

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
export const docStatusCfg: Record<string,{color:string,bg:string,border:string}> = {
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
