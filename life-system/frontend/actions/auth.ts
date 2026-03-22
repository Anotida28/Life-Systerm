"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { backendRequest } from "@/lib/backend-api";
import { getBackendErrorMessage } from "@/lib/backend-errors";
import { clearSession, getOptionalSession, setSession } from "@/lib/session";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(128),
});

export type LoginActionState = {
  error: string | null;
};

type LoginResponse = {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Enter your username and password to continue.",
    };
  }

  try {
    const payload = await backendRequest<LoginResponse>("/api/auth/login", {
      requiresAuth: false,
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    await setSession({
      token: payload.token,
      userId: payload.user.id,
      username: payload.user.username,
      displayName: payload.user.displayName,
      expiresAt: payload.expiresAt,
    });
  } catch (error) {
    return {
      error: getBackendErrorMessage(error, "Could not sign you in."),
    };
  }

  redirect("/");
}

export async function logoutAction() {
  try {
    const session = await getOptionalSession();

    if (session) {
      await backendRequest("/api/auth/logout", {
        method: "POST",
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    await clearSession();
  }

  redirect("/login");
}
