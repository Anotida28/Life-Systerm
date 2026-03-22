import { afterEach, describe, expect, it, vi } from "vitest";

import {
  backendRequest,
  BackendRequestError,
  getBackendErrorMessage,
} from "../lib/backend-api";

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
      headers: {
        Authorization: "Bearer dev-local-token",
        "x-user-id": "local-zw-user",
        "Content-Type": "application/json",
        "x-trace-id": "trace-123",
      },
      body: JSON.stringify({ hello: "world" }),
      cache: "no-store",
    });
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
