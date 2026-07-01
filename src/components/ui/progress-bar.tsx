export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: "var(--color-elevated)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${clamped}%`,
          background: "var(--color-accent)",
          borderRadius: 999,
          transition: "width 0.2s ease",
        }}
      />
    </div>
  );
}
