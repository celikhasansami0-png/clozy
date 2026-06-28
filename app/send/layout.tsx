export const dynamic = "force-dynamic"
import { AppShell } from "@/components/layout/app-shell"

export default function SendLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
