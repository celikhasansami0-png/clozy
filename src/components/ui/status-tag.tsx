import type { ProjectStatus } from "@/lib/types";

const STATUS_STYLES: Record<ProjectStatus, { bg: string; color: string }> = {
  "In Progress": { bg: "var(--color-accent-soft)", color: "var(--color-accent)" },
  "On Track": { bg: "var(--color-positive-soft)", color: "var(--color-positive)" },
  Delayed: { bg: "var(--color-negative-soft)", color: "var(--color-negative)" },
};

export function StatusTag({ status }: { status: ProjectStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}
