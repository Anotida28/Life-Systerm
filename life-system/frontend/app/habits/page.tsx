export const dynamic = "force-dynamic";

import { HabitsList } from "@/components/habits/habits-list";
import { PageHeader } from "@/components/shared/page-header";
import { backendRequest } from "@/lib/backend-api";
import type { HabitView } from "@/types";

export const metadata = {
  title: "Habits",
};

export default async function HabitsPage() {
  const habits = await backendRequest<HabitView[]>("/api/habits");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Habit system"
        title="Non-Negotiables"
        description="Manage the recurring discipline items that load into every new day and carry the highest score weight."
      />
      <HabitsList initialHabits={habits} />
    </div>
  );
}
