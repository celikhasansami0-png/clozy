"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { NewProjectModal } from "@/components/new-project-modal";
import styles from "./shell.module.css";

export function DashboardShell({
  companyName,
  initials,
  children,
}: {
  companyName: string;
  initials: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar companyName={companyName} initials={initials} />
      <div className={styles.main}>
        <Topbar />
        <div className={styles.content}>{children}</div>
      </div>
      <NewProjectModal />
    </div>
  );
}
