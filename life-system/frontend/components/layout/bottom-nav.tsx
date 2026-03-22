"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, ChartNoAxesCombined, Flame, History, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/today", label: "Today", icon: CalendarClock },
  { href: "/", label: "Dashboard", icon: ChartNoAxesCombined },
  { href: "/history", label: "History", icon: History },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--line)] bg-[rgba(6,8,15,0.86)] px-2 py-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 py-2.5 text-[11px] font-medium transition",
                active
                  ? "bg-[rgba(91,96,255,0.16)] text-[color:var(--text-primary)]"
                  : "text-[color:var(--text-secondary)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
