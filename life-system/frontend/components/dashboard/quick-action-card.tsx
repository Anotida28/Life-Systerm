import Link from "next/link";
import { ArrowRight, CalendarClock, Flame, ScrollText, Sparkles } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/today",
    label: "Today",
    description: "Jump into the daily operating flow.",
    icon: CalendarClock,
  },
  {
    href: "/habits",
    label: "Habits",
    description: "Manage your recurring non-negotiables.",
    icon: Flame,
  },
  {
    href: "/weekly",
    label: "Weekly review",
    description: "Look back at the week and set adjustments.",
    icon: ScrollText,
  },
  {
    href: "/insights",
    label: "Insights",
    description: "Review patterns and data-backed recommendations.",
    icon: Sparkles,
  },
];

export function QuickActionCard() {
  return (
    <SectionCard
      title="Quick actions"
      description="Move to the next high-value screen without friction."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition hover:border-[rgba(91,96,255,0.2)] hover:bg-[color:var(--surface-strong)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex rounded-2xl bg-[rgba(91,96,255,0.12)] p-3 text-[color:var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-[color:var(--text-tertiary)]" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[color:var(--text-primary)]">
                {action.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}
