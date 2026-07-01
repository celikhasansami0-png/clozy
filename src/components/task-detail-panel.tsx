"use client";

import { useWorkspace } from "@/contexts/workspace-context";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CloseIcon } from "@/components/ui/icons";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import styles from "./task-detail-panel.module.css";

export function TaskDetailPanel({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const { crewMembers, updateTask } = useWorkspace();

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{task.title}</h2>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Status</span>
        <Select
          value={task.status}
          onChange={(e) =>
            updateTask(task.id, { status: e.target.value as TaskStatus })
          }
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Priority</span>
        <Select
          value={task.priority}
          onChange={(e) =>
            updateTask(task.id, { priority: e.target.value as TaskPriority })
          }
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </Select>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Assignee</span>
        <Select
          value={task.assignee_id ?? ""}
          onChange={(e) =>
            updateTask(task.id, { assignee_id: e.target.value || null })
          }
        >
          <option value="">Unassigned</option>
          {crewMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Due date</span>
        <Input
          type="date"
          value={task.due_date ?? ""}
          onChange={(e) =>
            updateTask(task.id, { due_date: e.target.value || null })
          }
        />
      </div>
    </aside>
  );
}
