import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#080808' }}>
      {/* Topbar */}
      <div style={{
        height:42, borderBottom:'1px solid #181818',
        display:'flex', alignItems:'center', padding:'0 20px',
        background:'#0F0F0F', flexShrink:0, justifyContent:'space-between',
      }}>
        <div style={{ fontSize:12, color:'#606060' }}>Voltly</div>
        <div style={{ display:'flex', gap:8 }}>
          <form action="/api/auth/signout" method="POST">
            <button style={{ background:'#161616', border:'1px solid #262626', color:'#606060', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              Sign out
            </button>
          </form>
        </div>
      </div>
      {/* Body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <Sidebar userId={user.id} />
        <main style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
