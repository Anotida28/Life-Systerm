type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  } | null;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
const BACKEND_API_TOKEN = process.env.BACKEND_API_TOKEN ?? "dev-local-token";
const BACKEND_USER_ID = process.env.BACKEND_USER_ID ?? "local-zw-user";

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

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? `Backend request failed: ${response.status}`);
  }

  return payload.data;
}
