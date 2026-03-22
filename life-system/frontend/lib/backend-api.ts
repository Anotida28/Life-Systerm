import { getOptionalSession } from "./session";
import { type ApiErrorBody, BackendRequestError } from "./backend-errors";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: ApiErrorBody | null;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";

type BackendRequestInit = RequestInit & {
  requiresAuth?: boolean;
};

export async function backendRequest<T>(path: string, init?: BackendRequestInit): Promise<T> {
  const { requiresAuth = true, headers, ...requestInit } = init ?? {};
  const session = requiresAuth ? await getOptionalSession() : null;

  if (requiresAuth && !session) {
    throw new BackendRequestError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Please sign in to continue.",
    });
  }

  const resolvedHeaders = new Headers(headers ?? {});

  if (!resolvedHeaders.has("Content-Type") && requestInit.body) {
    resolvedHeaders.set("Content-Type", "application/json");
  }

  if (session?.token) {
    resolvedHeaders.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...requestInit,
    headers: resolvedHeaders,
    cache: "no-store",
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new BackendRequestError({
      status: response.status,
      code: payload?.error?.code,
      message:
        payload?.error?.message ??
        `Backend request failed with status ${response.status}`,
      fieldErrors: payload?.error?.fieldErrors,
    });
  }

  return payload.data;
}
