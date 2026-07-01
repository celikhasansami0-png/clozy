"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { StatusTag } from "@/components/ui/status-tag";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NewTaskModal } from "@/components/new-task-modal";
import { TaskDetailPanel } from "@/components/task-detail-panel";
import type { Task, TaskStatus } from "@/lib/types";
import styles from "./projects.module.css";

const TABS: { key: "all" | TaskStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

function ProjectsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, tasks, crewMembers, updateTask } = useWorkspace();

  const [tab, setTab] = useState<"all" | TaskStatus>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  // The URL query param is the single source of truth for which project is
  // selected, so switching projects from the sidebar or this page always
  // agree without needing to sync separate state.
  const selectedProjectId = searchParams.get("project") ?? projects[0]?.id ?? null;
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.project_id === selectedProjectId),
    [tasks, selectedProjectId]
  );

  const counts = useMemo(
    () => ({
      all: projectTasks.length,
      todo: projectTasks.filter((t) => t.status === "todo").length,
      in_progress: projectTasks.filter((t) => t.status === "in_progress")
        .length,
      done: projectTasks.filter((t) => t.status === "done").length,
    }),
    [projectTasks]
  );

  const filteredTasks =
    tab === "all" ? projectTasks : projectTasks.filter((t) => t.status === tab);

  const selectedTask: Task | undefined = tasks.find(
    (t) => t.id === selectedTaskId
  );

  function initialsFor(memberId: string | null) {
    if (!memberId) return null;
    return crewMembers.find((m) => m.id === memberId)?.initials ?? null;
  }

  function selectProject(id: string) {
    router.replace(`/dashboard/projects?project=${id}`, { scroll: false });
    setSelectedTaskId(null);
    setTab("all");
  }

  return (
    <div className={styles.layout}>
      <div className={styles.projectsPanel}>
        <div className={styles.panelTitle}>Projects</div>
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className={`${styles.projectRow} ${
              project.id === selectedProjectId ? styles.projectRowActive : ""
            }`}
            onClick={() => selectProject(project.id)}
          >
            <span
              className={styles.projectDot}
              style={{ background: project.color }}
            />
            {project.name}
          </button>
        ))}
      </div>

      <div className={styles.centerPanel}>
        {!selectedProject ? (
          <div className={styles.noProjectSelected}>
            Select or create a project to see its tasks.
          </div>
        ) : (
          <>
            <div className={styles.centerHeader}>
              <div>
                <div className={styles.projectTitle}>
                  {selectedProject.name}
                </div>
              </div>
              <StatusTag status={selectedProject.status} />
            </div>

            <div className={styles.progressWrap}>
              <ProgressBar value={selectedProject.completion} />
            </div>

            <div className={styles.tabs}>
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.tab} ${
                    tab === key ? styles.tabActive : ""
                  }`}
                  onClick={() => setTab(key)}
                >
                  {label} ({counts[key]})
                </button>
              ))}
            </div>

            <div className={styles.taskList}>
              {filteredTasks.length === 0 && (
                <div className={styles.emptyTasks}>No tasks here yet.</div>
              )}
              {filteredTasks.map((task) => {
                const initials = initialsFor(task.assignee_id);
                return (
                  <div
                    key={task.id}
                    className={styles.taskRow}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <button
                      type="button"
                      className={`${styles.statusCircle} ${
                        task.status === "in_progress"
                          ? styles.statusCircleInProgress
                          : task.status === "done"
                            ? styles.statusCircleDone
                            : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTask(task.id, {
                          status: STATUS_CYCLE[task.status],
                        });
                      }}
                      aria-label={`Cycle status for ${task.title}`}
                    />
                    <span
                      className={`${styles.taskTitle} ${
                        task.status === "done" ? styles.taskTitleDone : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className={styles.taskTag}>{task.tag}</span>
                    {task.due_date && (
                      <span className={styles.taskDueDate}>
                        {task.due_date}
                      </span>
                    )}
                    {initials && <Avatar initials={initials} size={22} />}
                  </div>
                );
              })}
            </div>

            <div className={styles.newTaskButton}>
              <Button onClick={() => setNewTaskOpen(true)}>New Task</Button>
            </div>

            <NewTaskModal
              projectId={selectedProject.id}
              open={newTaskOpen}
              onClose={() => setNewTaskOpen(false)}
            />
          </>
        )}
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsPageInner />
    </Suspense>
  );
}
