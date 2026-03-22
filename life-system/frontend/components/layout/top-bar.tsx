"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, ChartNoAxesCombined, Flame, History, ListTodo, LogOut, Sparkles } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: ChartNoAxesCombined },
  { href: "/today", label: "Today", icon: CalendarClock },
  { href: "/history", label: "History", icon: History },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

export function TopBar({ userDisplayName }: { userDisplayName?: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[rgba(6,8,15,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(91,96,255,0.24),rgba(45,212,191,0.18))] text-[color:var(--accent)] shadow-[0_16px_34px_rgba(91,96,255,0.16)]">
              <ListTodo className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-tertiary)]">
                Personal operating system
              </span>
              <span className="block font-serif-display text-2xl tracking-[-0.05em] text-[color:var(--text-primary)]">
                Life System
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 rounded-full border border-[color:var(--line)] bg-[rgba(255,255,255,0.03)] p-1 lg:flex">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                  active
                    ? "bg-[color:var(--surface-strong)] text-[color:var(--text-primary)]"
                    : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {userDisplayName ? (
            <div className="rounded-full border border-[color:var(--line)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[color:var(--text-secondary)]">
              Signed in as <span className="font-medium text-[color:var(--text-primary)]">{userDisplayName}</span>
            </div>
          ) : null}
          <Button asChild variant="secondary">
            <Link href="/today">Open Today</Link>
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
