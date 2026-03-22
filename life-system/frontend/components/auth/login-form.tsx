"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LockKeyhole, UserRound } from "lucide-react";

import { loginAction, type LoginActionState } from "@/actions/auth";
import { ActionNotice } from "@/components/shared/action-notice";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

const initialState: LoginActionState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[color:var(--text-primary)]">
            Username
          </span>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
            <Input
              name="username"
              autoComplete="username"
              placeholder="Lourence"
              className="h-12 pl-11"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[color:var(--text-primary)]">
            Password
          </span>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-12 pl-11"
              required
            />
          </div>
        </label>
      </div>

      {state.error ? <ActionNotice tone="danger" message={state.error} /> : null}

      <SubmitButton />
    </form>
  );
}
