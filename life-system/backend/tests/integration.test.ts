import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../src/lib/prisma.js";
import { buildApp } from "../src/server.js";

const authHeaders = {
  authorization: `Bearer ${process.env.BACKEND_API_TOKEN ?? "dev-local-token"}`,
  "x-user-id": process.env.BACKEND_TEST_USER_ID ?? "test-zw-user",
  "content-type": "application/json",
};

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
      headers: authHeaders,
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
      headers: authHeaders,
    });

    const todayBody = todayResponse.json() as { data: { id: string; dailyHabits: Array<{ id: string }> } };
    const dailyRecordId = todayBody.data.id;

    await Promise.all(
      Array.from({ length: 8 }).map((_, index) =>
        app.inject({
          method: "POST",
          url: "/api/daily/tasks",
          headers: authHeaders,
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
            headers: authHeaders,
            payload: { completed: index % 2 === 0 },
          }),
        ),
      );
    }

    const refreshed = await app.inject({
      method: "GET",
      url: "/api/daily/today",
      headers: authHeaders,
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

test.after(async () => {
  await prisma.$disconnect();
});
