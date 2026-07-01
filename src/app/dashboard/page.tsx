"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { StatusTag } from "@/components/ui/status-tag";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { EmptyBoxIcon } from "@/components/ui/icons";
import styles from "./dashboard.module.css";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const { projects, tasks, crewMembers, openNewProjectModal } = useWorkspace();

  const tasksDueThisWeek = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);

    return tasks.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(task.due_date);
      return due >= now && due <= weekFromNow;
    }).length;
  }, [tasks]);

  return (
    <div>
      <h1 className={styles.greeting}>{greeting()}</h1>
      <p className={styles.subtitle}>
        Here&apos;s what&apos;s happening across your agency today.
      </p>

      <div className={styles.statsRow}>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statValue}>{projects.length}</div>
          <div className={styles.statLabel}>Active Projects</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statValue}>{tasksDueThisWeek}</div>
          <div className={styles.statLabel}>Tasks Due This Week</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statValue}>{crewMembers.length}</div>
          <div className={styles.statLabel}>Team Members</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Projects</h2>

      {projects.length === 0 ? (
        <div className={`card ${styles.emptyState}`}>
          <EmptyBoxIcon />
          <p>Start by creating your first project.</p>
          <Button onClick={openNewProjectModal}>New Project</Button>
        </div>
      ) : (
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={`card ${styles.projectCard}`}
              onClick={() =>
                router.push(`/dashboard/projects?project=${project.id}`)
              }
            >
              <div className={styles.projectCardHeader}>
                <span className={styles.projectName}>{project.name}</span>
                <StatusTag status={project.status} />
              </div>
              <ProgressBar value={project.completion} />
              <span className={styles.projectPhase}>{project.phase}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
