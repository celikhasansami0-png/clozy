"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import modalStyles from "@/components/ui/modal.module.css";

function initialsFrom(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function AddTeamMemberModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addCrewMember } = useWorkspace();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Team Member");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setRole("Team Member");
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

    const { error: createError } = await addCrewMember({
      name: name.trim(),
      role: role.trim() || "Team Member",
      initials: initialsFrom(name),
    });

    setLoading(false);

    if (createError) {
      setError(createError);
      return;
    }

    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Team Member">
      <form className={modalStyles.form} onSubmit={handleSubmit}>
        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="memberName">
            Name
          </label>
          <Input
            id="memberName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className={modalStyles.field}>
          <label className={modalStyles.label} htmlFor="memberRole">
            Role
          </label>
          <Input
            id="memberRole"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        {error && <p className="text-error">{error}</p>}

        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Adding…" : "Add Team Member"}
        </Button>
      </form>
    </Modal>
  );
}
