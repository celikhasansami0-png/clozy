import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceProvider } from "@/contexts/workspace-context";
import { DashboardShell } from "@/components/dashboard-shell/shell";

function initialsFrom(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_name")
    .eq("id", user.id)
    .single();

  const companyName = profile?.company_name || "Your workspace";
  const initials = initialsFrom(profile?.full_name || companyName);

  return (
    <WorkspaceProvider>
      <DashboardShell companyName={companyName} initials={initials}>
        {children}
      </DashboardShell>
    </WorkspaceProvider>
  );
}
