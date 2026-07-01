import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {profile?.company_name ?? "Your workspace"}
          </h1>
          <p className={styles.subtitle}>Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className={`card ${styles.card}`}>
        <p>Projects, tasks, and the client portal land here next.</p>
      </div>
    </div>
  );
}
