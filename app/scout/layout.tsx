export const dynamic = "force-dynamic"
import { AppShell } from "@/components/layout/app-shell"

export default function ScoutLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
