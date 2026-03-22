import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  detail,
  className,
}: {
  value: number;
  label: string;
  detail?: string;
  className?: string;
}) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[color:var(--text-secondary)]">{label}</span>
        <span className="font-medium text-[color:var(--text-primary)]">
          {detail ?? `${width}%`}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-[color:var(--surface)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-soft))] shadow-[0_6px_20px_rgba(91,96,255,0.28)] transition-[width] duration-300"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
