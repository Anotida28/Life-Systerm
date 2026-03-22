import { cn } from "@/lib/utils";
import type { DayStatus } from "@/types";

const dayStatusMap: Record<DayStatus, { label: string; className: string }> = {
  NOT_STARTED: {
    label: "Not started",
    className:
      "bg-[rgba(148,163,184,0.12)] text-[color:var(--text-secondary)] border-[rgba(148,163,184,0.14)]",
  },
  IN_PROGRESS: {
    label: "In progress",
    className:
      "bg-[rgba(251,191,36,0.14)] text-[color:var(--warning)] border-[rgba(251,191,36,0.18)]",
  },
  SUCCESSFUL: {
    label: "Successful",
    className:
      "bg-[rgba(45,212,191,0.14)] text-[color:var(--success)] border-[rgba(45,212,191,0.18)]",
  },
  MISSED: {
    label: "Missed",
    className:
      "bg-[rgba(248,113,113,0.14)] text-[color:var(--danger)] border-[rgba(248,113,113,0.18)]",
  },
};

const toneMap = {
  neutral:
    "bg-[rgba(148,163,184,0.12)] text-[color:var(--text-secondary)] border-[rgba(148,163,184,0.14)]",
  accent:
    "bg-[rgba(91,96,255,0.12)] text-[color:var(--accent)] border-[rgba(91,96,255,0.16)]",
  success:
    "bg-[rgba(45,212,191,0.14)] text-[color:var(--success)] border-[rgba(45,212,191,0.18)]",
  warning:
    "bg-[rgba(251,191,36,0.14)] text-[color:var(--warning)] border-[rgba(251,191,36,0.18)]",
  danger:
    "bg-[rgba(248,113,113,0.14)] text-[color:var(--danger)] border-[rgba(248,113,113,0.18)]",
};

export function StatusBadge({
  status,
  tone = "neutral",
  label,
  className,
}: {
  status?: DayStatus;
  tone?: keyof typeof toneMap;
  label?: string;
  className?: string;
}) {
  const statusStyle = status ? dayStatusMap[status] : null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium tracking-[0.02em]",
        statusStyle?.className ?? toneMap[tone],
        className,
      )}
    >
      {label ?? statusStyle?.label}
    </span>
  );
}
