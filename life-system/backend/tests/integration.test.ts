import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../src/lib/prisma.js";
import { buildApp } from "../src/server.js";

const authHeaders = {
  authorization: `Bearer ${process.env.BACKEND_API_TOKEN ?? "dev-local-token"}`,
  "x-user-id": process.env.BACKEND_TEST_USER_ID ?? "test-zw-user",
};

function getAuthHeaders(userId = process.env.BACKEND_TEST_USER_ID ?? "test-zw-user") {
  return {
    ...authHeaders,
    "x-user-id": userId,
  };
}

test("health endpoint is public", async () => {
  const app = buildApp();
  try {
    const response = await app.inject({ method: "GET", url: "/health" });
    assert.equal(response.statusCode, 200);
  } finally {
    await app.close();
  }
});

test("api endpoint requires auth token", async () => {
  const app = buildApp();
  try {
    const response = await app.inject({ method: "GET", url: "/api/daily/today" });
    assert.equal(response.statusCode, 401);
  } finally {
    await app.close();
  }
});

test("daily today endpoint responds for authorized user", async () => {
  const app = buildApp();

  try {
    const response = await app.inject({
      method: "GET",
      url: "/api/daily/today",
      headers: getAuthHeaders(),
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { data: { id: string; date: string } };
    assert.ok(body.data.id.length > 0);
    assert.match(body.data.date, /^\d{4}-\d{2}-\d{2}$/);
  } finally {
    await app.close();
  }
});

test("concurrent task writes keep streak snapshots valid", async () => {
  const app = buildApp();

  try {
    const todayResponse = await app.inject({
      method: "GET",
      url: "/api/daily/today",
      headers: getAuthHeaders(),
    });

    const todayBody = todayResponse.json() as { data: { id: string; dailyHabits: Array<{ id: string }> } };
    const dailyRecordId = todayBody.data.id;

    await Promise.all(
      Array.from({ length: 8 }).map((_, index) =>
        app.inject({
          method: "POST",
          url: "/api/daily/tasks",
          headers: getAuthHeaders(),
          payload: {
            dailyRecordId,
            title: `Concurrent task ${index + 1}`,
            type: index % 2 === 0 ? "PERSONAL" : "WORK",
          },
        }),
      ),
    );

    if (todayBody.data.dailyHabits[0]) {
      await Promise.all(
        Array.from({ length: 6 }).map((_, index) =>
          app.inject({
            method: "PATCH",
            url: `/api/daily/habits/${todayBody.data.dailyHabits[0].id}/toggle`,
            headers: getAuthHeaders(),
            payload: { completed: index % 2 === 0 },
          }),
        ),
      );
    }

    const refreshed = await app.inject({
      method: "GET",
      url: "/api/daily/today",
      headers: getAuthHeaders(),
    });

    assert.equal(refreshed.statusCode, 200);
    const refreshedBody = refreshed.json() as {
      data: { currentStreakSnapshot: number; longestStreakSnapshot: number; dailyTasks: unknown[] };
    };

    assert.ok(refreshedBody.data.dailyTasks.length >= 8);
    assert.ok(refreshedBody.data.currentStreakSnapshot >= 0);
    assert.ok(refreshedBody.data.longestStreakSnapshot >= refreshedBody.data.currentStreakSnapshot);
  } finally {
    await app.close();
  }
});

test("duplicate habit creation returns conflict", async () => {
  const app = buildApp();
  const userId = `conflict-user-${Date.now()}`;

  try {
    const first = await app.inject({
      method: "POST",
      url: "/api/habits",
      headers: getAuthHeaders(userId),
      payload: { name: "Read" },
    });

    assert.equal(first.statusCode, 201);

    const second = await app.inject({
      method: "POST",
      url: "/api/habits",
      headers: getAuthHeaders(userId),
      payload: { name: "Read" },
    });

    assert.equal(second.statusCode, 409);
    const body = second.json() as { error: { code: string; message: string } };
    assert.equal(body.error.code, "CONFLICT");
  } finally {
    await app.close();
  }
});

test("missing record mutations return not found", async () => {
  const app = buildApp();
  const userId = `missing-user-${Date.now()}`;
  const headers = getAuthHeaders(userId);
  const cases = [
    {
      method: "PATCH",
      url: "/api/habits/unknown-habit",
      payload: { name: "Renamed" },
    },
    {
      method: "PATCH",
      url: "/api/habits/unknown-habit/active",
      payload: { isActive: false },
    },
    {
      method: "PATCH",
      url: "/api/daily/tasks/unknown-task/toggle",
      payload: { completed: true },
    },
    {
      method: "PATCH",
      url: "/api/daily/tasks/unknown-task/move",
      payload: { direction: "up" },
    },
    {
      method: "DELETE",
      url: "/api/daily/tasks/unknown-task",
    },
    {
      method: "PATCH",
      url: "/api/daily/habits/unknown-habit/toggle",
      payload: { completed: true },
    },
    {
      method: "PATCH",
      url: "/api/weekly/reviews/unknown-review",
      payload: {
        whatWentWell: "",
        whatWentBadly: "",
        whatNeedsToImprove: "",
        nextWeekGoals: "",
      },
    },
  ] as const;

  try {
    for (const testCase of cases) {
      const response = await app.inject({
        method: testCase.method,
        url: testCase.url,
        headers,
        payload: testCase.payload,
      });

      assert.equal(response.statusCode, 404, `${testCase.method} ${testCase.url}`);
      const body = response.json() as { error: { code: string } };
      assert.equal(body.error.code, "NOT_FOUND");
    }
  } finally {
    await app.close();
  }
});

test.after(async () => {
  await prisma.$disconnect();
});
