"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PROJECT_COLOR_PRESETS, type ProjectStatus } from "@/lib/types";
import modalStyles from "@/components/ui/modal.module.css";
import styles from "./new-project-modal.module.css";

const STATUS_OPTIONS: ProjectStatus[] = ["In Progress", "On Track", "Delayed"];

export function NewProjectModal() {
  const { isNewProjectModalOpen, closeNewProjectModal, addProject } =
    useWorkspace();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PROJECT_COLOR_PRESETS[0]);
  const [status, setStatus] = useState<ProjectStatus>("In Progress");
  const [phase, setPhase] = useState("Planning");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setName("");
    setColor(PROJECT_COLOR_PRESETS[0]);
    setStatus("In Progress");
    setPhase("Planning");
    setError(null);
    closeNewProjectModal();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: createError } = await addProject({
      name: name.trim(),
      color,
      status,
      phase: phase.trim() || "Planning",
    });

    setLoading(false);

    if (createError) {
      setError(createError);
      return;
    }

    handleClose();
  }

  return (
    <Modal
      open={isNewProjectModalOpen}
      onClose={handleClose}
      title="New Project"
    >
      <form className={modalStyles.form} onSubmit={handleSubmit}>
        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="projectName">
            Project name
          </label>
          <Input
            id="projectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className={modalStyles.field}>
          <span className={modalStyles.label}>Color</span>
          <div className={styles.colorRow}>
            {PROJECT_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={`Color ${preset}`}
                className={`${styles.colorDot} ${
                  color === preset ? styles.colorDotSelected : ""
                }`}
                style={{ background: preset }}
                onClick={() => setColor(preset)}
              />
            ))}
          </div>
        </div>

        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="projectStatus">
            Status
          </label>
          <Select
            id="projectStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="projectPhase">
            Phase
          </label>
          <Input
            id="projectPhase"
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
          />
        </div>

        {error && <p className="text-error">{error}</p>}

        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Creating…" : "Create Project"}
        </Button>
      </form>
    </Modal>
  );
}
