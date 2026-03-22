import type { FastifyInstance } from "fastify";

import { successResponse } from "../lib/response.js";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return successResponse({
      status: "ok",
      service: "life-system-backend",
      timestamp: new Date().toISOString(),
    });
  });
}
