import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get(name: string) {
      const values: Record<string, string> = {
        life_system_session_token: "session-token-123",
        life_system_user_id: "user-123",
        life_system_username: "lourence",
        life_system_display_name: "Lourence",
        life_system_expires_at: "2099-01-01T00:00:00.000Z",
      };

      return values[name] ? { value: values[name] } : undefined;
    },
  }),
}));

import { backendRequest } from "../lib/backend-api";
import {
  BackendRequestError,
  getBackendErrorMessage,
} from "../lib/backend-errors";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("backendRequest", () => {
  it("sends backend auth headers and returns typed data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { value: 42 },
        error: null,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const data = await backendRequest<{ value: number }>("/api/test", {
      method: "POST",
      headers: {
        "x-trace-id": "trace-123",
      },
      body: JSON.stringify({ hello: "world" }),
    });

    expect(data).toEqual({ value: 42 });
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:4000/api/test", {
      method: "POST",
      headers: expect.any(Headers),
      body: JSON.stringify({ hello: "world" }),
      cache: "no-store",
    });
    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = requestInit.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer session-token-123");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("x-trace-id")).toBe("trace-123");
  });

  it("throws a structured BackendRequestError for backend failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          data: null,
          error: {
            code: "CONFLICT",
            message: "A habit with this name already exists",
            fieldErrors: {
              name: ["A habit with this name already exists"],
            },
          },
        }),
      }),
    );

    await expect(backendRequest("/api/habits")).rejects.toBeInstanceOf(BackendRequestError);

    try {
      await backendRequest("/api/habits");
      throw new Error("Expected backendRequest to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BackendRequestError);
      expect(error).toMatchObject({
        status: 409,
        code: "CONFLICT",
        message: "A habit with this name already exists",
        fieldErrors: {
          name: ["A habit with this name already exists"],
        },
      });
      expect(getBackendErrorMessage(error)).toBe("A habit with this name already exists");
    }
  });
});
