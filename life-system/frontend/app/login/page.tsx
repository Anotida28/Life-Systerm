import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Private progress tracking",
    description: "Your habits, scores, notes, and weekly reviews stay scoped to your own account.",
  },
  {
    icon: TrendingUp,
    title: "Consistent daily operating view",
    description: "Open your day, execute the essentials, and keep the signal high with structured reflection.",
  },
  {
    icon: Sparkles,
    title: "Insight-driven improvement",
    description: "Turn your execution data into weekly patterns, workload signals, and practical next steps.",
  },
];

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,96,255,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.16),transparent_34%),linear-gradient(180deg,#05070f_0%,#090d18_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-14">
        <section className="flex flex-col justify-between rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-[color:var(--text-tertiary)]">
              Personal operating system
            </div>
            <h1 className="mt-6 max-w-2xl font-serif-display text-5xl leading-[0.95] tracking-[-0.06em] text-[color:var(--text-primary)] sm:text-6xl">
              Sign in to your execution cockpit.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--text-secondary)]">
              Life System turns daily discipline into something visible, measurable, and easier to sustain.
              Log in to manage your habits, track your tasks, and review the patterns shaping your week.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[1.6rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-[rgba(91,96,255,0.16)] text-[color:var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-[color:var(--text-primary)]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,11,20,0.88)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-[color:var(--text-tertiary)]">
                Account access
              </div>
              <h2 className="mt-4 font-serif-display text-4xl tracking-[-0.05em] text-[color:var(--text-primary)]">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                Use the seeded account to get started quickly.
              </p>
            </div>

            <div className="mb-6 rounded-[1.5rem] border border-[rgba(45,212,191,0.14)] bg-[rgba(45,212,191,0.08)] px-5 py-4 text-sm leading-6 text-[color:var(--text-primary)]">
              Username: <span className="font-semibold">Lourence</span>
              <br />
              Password: <span className="font-semibold">RuvaMakoAno28</span>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}
