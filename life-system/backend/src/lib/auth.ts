import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { errorResponse } from "./response.js";

const scrypt = promisify(scryptCallback);
const SESSION_DURATION_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 30);

export const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? "local-zw-user";
export const SEEDED_LOGIN_USERNAME = process.env.SEED_LOGIN_USERNAME ?? "Lourence";
export const SEEDED_LOGIN_DISPLAY_NAME = process.env.SEED_LOGIN_DISPLAY_NAME ?? "Lourence";
export const SEEDED_LOGIN_PASSWORD = process.env.SEED_LOGIN_PASSWORD ?? "RuvaMakoAno28";

function isPublicRoute(url: string) {
  return url.startsWith("/health") || url.startsWith("/api/auth/login");
}

function deriveDisplayName(userId: string) {
  const label = userId
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!label) {
    return "Life System User";
  }

  return label.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function resolveUserIdFromRequest(request: any) {
  return request.userId as string;
}

export function resolveSessionIdFromRequest(request: any) {
  return (request.sessionId as string | undefined) ?? "";
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash?.startsWith("scrypt:")) {
    return false;
  }

  const [, salt, encodedHash] = storedHash.split(":");

  if (!salt || !encodedHash) {
    return false;
  }

  const expected = Buffer.from(encodedHash, "base64url");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function ensureUserExists(prisma: any, userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      displayName: deriveDisplayName(userId),
    },
  });
}

export async function seedLoginUser(prisma: any, userId = DEFAULT_USER_ID) {
  const username = normalizeUsername(SEEDED_LOGIN_USERNAME);
  const passwordHash = await hashPassword(SEEDED_LOGIN_PASSWORD);

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      username,
      displayName: SEEDED_LOGIN_DISPLAY_NAME,
      passwordHash,
    },
    create: {
      id: userId,
      username,
      displayName: SEEDED_LOGIN_DISPLAY_NAME,
      passwordHash,
    },
  });
}

export async function createUserSession(prisma: any, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  return {
    sessionId: session.id,
    token,
    expiresAt,
  };
}

export async function revokeSession(prisma: any, sessionId: string) {
  if (!sessionId) {
    return;
  }

  await prisma.session.updateMany({
    where: {
      id: sessionId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export function registerAuthHook(app: any) {
  app.decorateRequest("userId", "");
  app.decorateRequest("sessionId", "");

  app.addHook("preHandler", async (request: any, reply: any) => {
    if (isPublicRoute(request.url)) {
      request.userId = DEFAULT_USER_ID;
      request.sessionId = "";
      return;
    }

    const authHeader = request.headers.authorization;

    if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      reply.code(401).send(errorResponse("UNAUTHORIZED", "Invalid or missing session token"));
      return;
    }

    const bearerToken = authHeader.slice("Bearer ".length).trim();
    const internalToken = process.env.BACKEND_API_TOKEN;

    if (internalToken && bearerToken === internalToken) {
      const requestedUserId = request.headers["x-user-id"];

      if (typeof requestedUserId !== "string" || !requestedUserId.trim()) {
        reply.code(400).send(errorResponse("VALIDATION_ERROR", "x-user-id header is required"));
        return;
      }

      request.userId = requestedUserId.trim();
      request.sessionId = "";
      await ensureUserExists(app.prisma, request.userId);
      return;
    }

    const session = await app.prisma.session.findFirst({
      where: {
        tokenHash: hashSessionToken(bearerToken),
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!session) {
      reply.code(401).send(errorResponse("UNAUTHORIZED", "Invalid or expired session"));
      return;
    }

    request.userId = session.userId;
    request.sessionId = session.id;
  });
}
