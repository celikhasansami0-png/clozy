"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { TaskPriority } from "@/lib/types";
import modalStyles from "@/components/ui/modal.module.css";

export function NewTaskModal({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { crewMembers, addTask } = useWorkspace();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle("");
    setPriority("normal");
    setAssigneeId("");
    setDueDate("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: createError } = await addTask({
      project_id: projectId,
      title: title.trim(),
      priority,
      assignee_id: assigneeId || null,
      due_date: dueDate || null,
    });

    setLoading(false);

    if (createError) {
      setError(createError);
      return;
    }

    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Task">
      <form className={modalStyles.form} onSubmit={handleSubmit}>
        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="taskTitle">
            Title
          </label>
          <Input
            id="taskTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="taskPriority">
            Priority
          </label>
          <Select
            id="taskPriority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </Select>
        </div>

        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="taskAssignee">
            Assignee
          </label>
          <Select
            id="taskAssignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {crewMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        </div>

        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="taskDueDate">
            Due date
          </label>
          <Input
            id="taskDueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {error && <p className="text-error">{error}</p>}

        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? "Adding…" : "Add Task"}
        </Button>
      </form>
    </Modal>
  );
}
