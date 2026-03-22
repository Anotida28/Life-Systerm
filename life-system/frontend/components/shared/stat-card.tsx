import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  meta?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.6rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-[color:var(--text-tertiary)]">
            {label}
          </div>
          <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text-primary)]">
            {value}
          </div>
          {meta ? (
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{meta}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl bg-[rgba(91,96,255,0.12)] p-3 text-[color:var(--accent)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
