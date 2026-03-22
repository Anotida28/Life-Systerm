import "dotenv/config";

import Fastify from "fastify";
import { pathToFileURL } from "node:url";
import { ZodError } from "zod";

import { ensureUserExists, registerAuthHook, DEFAULT_USER_ID } from "./lib/auth.js";
import { prisma } from "./lib/prisma.js";
import { errorResponse } from "./lib/response.js";
import { registerDailyRoutes } from "./routes/daily.js";
import { registerHabitRoutes } from "./routes/habits.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerHistoryRoutes } from "./routes/history.js";
import { registerInsightsRoutes } from "./routes/insights.js";
import { registerWeeklyRoutes } from "./routes/weekly.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  (app as any).prisma = prisma;

  registerAuthHook(app);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid request data"));
      return;
    }

    app.log.error(error);
    reply.code(500).send(errorResponse("INTERNAL_ERROR", "Unexpected server error"));
  });

  app.register(registerHealthRoutes);
  app.register(registerHabitRoutes);
  app.register(registerDailyRoutes);
  app.register(registerHistoryRoutes);
  app.register(registerWeeklyRoutes);
  app.register(registerInsightsRoutes);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}

const port = Number(process.env.PORT ?? 4000);
const host = "0.0.0.0";

async function start() {
  const app = buildApp();
  await ensureUserExists(prisma, DEFAULT_USER_ID);
  await app.listen({ port, host });
  app.log.info(`Backend listening on http://${host}:${port}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  start().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
}
