"use client";

import { usePathname } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import styles from "./topbar.module.css";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/projects": "Projects",
  "/dashboard/team": "Team",
  "/dashboard/schedule": "Schedule",
  "/dashboard/settings": "Settings",
  "/dashboard/billing": "Billing",
};

export function Topbar() {
  const pathname = usePathname();
  const { openNewProjectModal } = useWorkspace();

  return (
    <header className={styles.topbar}>
      <span className={styles.title}>{TITLES[pathname] ?? "Doppio"}</span>
      <Button onClick={openNewProjectModal}>
        <PlusIcon width={14} height={14} />
        New Project
      </Button>
    </header>
  );
}
