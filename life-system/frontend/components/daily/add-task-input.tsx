"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

export function AddTaskInput({
  placeholder,
  onSubmit,
  isBusy,
}: {
  placeholder: string;
  onSubmit: (title: string) => Promise<void>;
  isBusy?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={async (event) => {
        event.preventDefault();
        const nextValue = value.trim();

        if (!nextValue) {
          return;
        }

        await onSubmit(nextValue);
        setValue("");
      }}
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={isBusy}
      />
      <Button type="submit" className="sm:w-auto" disabled={isBusy || !value.trim()}>
        <Plus className="h-4 w-4" />
        Add task
      </Button>
    </form>
  );
}
