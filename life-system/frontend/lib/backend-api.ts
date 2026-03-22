export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: ApiErrorBody | null;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
const BACKEND_API_TOKEN = process.env.BACKEND_API_TOKEN ?? "dev-local-token";
const BACKEND_USER_ID = process.env.BACKEND_USER_ID ?? "local-zw-user";

export class BackendRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(input: {
    status: number;
    message: string;
    code?: string;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "BackendRequestError";
    this.status = input.status;
    this.code = input.code ?? "BACKEND_REQUEST_ERROR";
    this.fieldErrors = input.fieldErrors;
  }
}

export function getBackendErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof BackendRequestError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${BACKEND_API_TOKEN}`,
      "x-user-id": BACKEND_USER_ID,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
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
