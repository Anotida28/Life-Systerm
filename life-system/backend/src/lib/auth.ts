import { errorResponse } from "./response.js";

export const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? "local-zw-user";

export function resolveUserIdFromRequest(request: any) {
  return request.userId as string;
}

export async function ensureUserExists(prisma: any, userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });
}

export function registerAuthHook(app: any) {
  app.decorateRequest("userId", "");

  app.addHook("preHandler", async (request: any, reply: any) => {
    if (request.url.startsWith("/health")) {
      request.userId = DEFAULT_USER_ID;
      return;
    }

    const token = process.env.BACKEND_API_TOKEN;
    const authHeader = request.headers.authorization;

    if (!token || !authHeader || authHeader !== `Bearer ${token}`) {
      reply.code(401).send(errorResponse("UNAUTHORIZED", "Invalid or missing API token"));
      return;
    }

    const requestedUserId = request.headers["x-user-id"];

    if (typeof requestedUserId !== "string" || !requestedUserId.trim()) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "x-user-id header is required"));
      return;
    }

    request.userId = requestedUserId.trim();

    await ensureUserExists(app.prisma, request.userId);
  });
}
