'use client'
import Modal from './Modal'

const C = { border:'#262626', borderSubtle:'#181818', text:'#F2F2F2', sub:'#A0A0A0', muted:'#606060', elevated:'#161616' }

const SHORTCUTS: [string, string][] = [
  ['⌘ / Ctrl + K', 'Open global search'],
  ['N', 'New task (Projects)'],
  ['P', 'New project (Dashboard / Projects)'],
  ['J / K', 'Move down / up the task list'],
  ['Enter', 'Open focused task detail'],
  ['Esc', 'Close any modal or panel'],
  ['Shift + /', 'Show this help'],
]

export default function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Keyboard shortcuts" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {SHORTCUTS.map(([keys, desc]) => (
          <div key={keys} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 2px', borderBottom:`1px solid ${C.borderSubtle}` }}>
            <span style={{ fontSize:13, color:C.text }}>{desc}</span>
            <kbd style={{ fontSize:11, color:C.sub, background:C.elevated, border:`1px solid ${C.border}`, borderRadius:5, padding:'3px 8px' }}>{keys}</kbd>
          </div>
        ))}
      </div>
    </Modal>
  )
}
