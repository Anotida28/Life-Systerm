import { z } from "zod";

import {
  createUserSession,
  normalizeUsername,
  resolveSessionIdFromRequest,
  resolveUserIdFromRequest,
  revokeSession,
  verifyPassword,
} from "../lib/auth.js";
import { errorResponse, successResponse } from "../lib/response.js";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(128),
});

export function registerAuthRoutes(app: any) {
  app.post("/api/auth/login", async (request: any, reply: any) => {
    const parsed = loginSchema.parse(request.body ?? {});
    const user = await app.prisma.user.findFirst({
      where: {
        username: normalizeUsername(parsed.username),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        passwordHash: true,
      },
    });

    const isValid =
      user?.passwordHash && (await verifyPassword(parsed.password, user.passwordHash));

    if (!user || !isValid) {
      reply
        .code(401)
        .send(errorResponse("UNAUTHORIZED", "Invalid username or password"));
      return;
    }

    const session = await createUserSession(app.prisma, user.id);

    reply.send(
      successResponse({
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
        },
      }),
    );
  });

  app.get("/api/auth/me", async (request: any) => {
    const user = await app.prisma.user.findUniqueOrThrow({
      where: {
        id: resolveUserIdFromRequest(request),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });

    return successResponse(user);
  });

  app.post("/api/auth/logout", async (request: any) => {
    await revokeSession(app.prisma, resolveSessionIdFromRequest(request));
    return successResponse({ loggedOut: true });
  });
}
