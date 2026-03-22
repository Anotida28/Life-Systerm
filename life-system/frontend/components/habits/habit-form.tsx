"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { SectionCard } from "@/components/shared/section-card";

export function HabitForm({
  onCreate,
  isBusy,
}: {
  onCreate: (name: string) => Promise<void>;
  isBusy?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <SectionCard
      title="Add non-negotiable"
      description="Create the recurring daily disciplines that define a successful day."
    >
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={async (event) => {
          event.preventDefault();
          const name = value.trim();

          if (!name) {
            return;
          }

          await onCreate(name);
          setValue("");
        }}
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="For example: Deep work block"
          disabled={isBusy}
        />
        <Button type="submit" disabled={isBusy || !value.trim()}>
          <Plus className="h-4 w-4" />
          Add habit
        </Button>
      </form>
    </SectionCard>
  );
}
