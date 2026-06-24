"use client"

import { Sidebar } from "./sidebar"
import { Toaster } from "sonner"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-[240px] overflow-y-auto">
        {children}
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
