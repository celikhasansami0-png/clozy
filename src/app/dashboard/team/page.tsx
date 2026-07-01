"use client";

import { useState } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyBoxIcon } from "@/components/ui/icons";
import { AddTeamMemberModal } from "@/components/add-team-member-modal";
import styles from "./team.module.css";

export default function TeamPage() {
  const { crewMembers, tasks } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);

  function openTaskCount(memberId: string) {
    return tasks.filter(
      (t) => t.assignee_id === memberId && t.status !== "done"
    ).length;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Team</h1>
        <Button onClick={() => setModalOpen(true)}>Add Team Member</Button>
      </div>

      {crewMembers.length === 0 ? (
        <div className={`card ${styles.emptyState}`}>
          <EmptyBoxIcon />
          <p>Invite your first team member.</p>
          <Button onClick={() => setModalOpen(true)}>Add Team Member</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {crewMembers.map((member) => (
            <div key={member.id} className={`card ${styles.memberCard}`}>
              <Avatar initials={member.initials} size={44} />
              <span className={styles.memberName}>{member.name}</span>
              <span className={styles.memberRole}>{member.role}</span>
              <span className={styles.memberTaskCount}>
                {openTaskCount(member.id)} open task
                {openTaskCount(member.id) === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      )}

      <AddTeamMemberModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
