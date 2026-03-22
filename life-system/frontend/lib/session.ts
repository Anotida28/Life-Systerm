import { cookies } from "next/headers";

import {
  SESSION_DISPLAY_NAME_COOKIE,
  SESSION_EXPIRES_AT_COOKIE,
  SESSION_TOKEN_COOKIE,
  SESSION_USER_ID_COOKIE,
  SESSION_USERNAME_COOKIE,
} from "./session-cookies";

export type AppSession = {
  token: string;
  userId: string;
  username: string;
  displayName: string;
  expiresAt: string;
};

function getCookieOptions(expiresAt: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

export async function getOptionalSession(): Promise<AppSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_TOKEN_COOKIE)?.value;
  const userId = store.get(SESSION_USER_ID_COOKIE)?.value;
  const username = store.get(SESSION_USERNAME_COOKIE)?.value;
  const displayName = store.get(SESSION_DISPLAY_NAME_COOKIE)?.value;
  const expiresAt = store.get(SESSION_EXPIRES_AT_COOKIE)?.value;

  if (!token || !userId || !username || !displayName || !expiresAt) {
    return null;
  }

  if (Number(new Date(expiresAt).getTime()) <= Date.now()) {
    return null;
  }

  return {
    token,
    userId,
    username,
    displayName,
    expiresAt,
  };
}

export async function setSession(session: AppSession) {
  const store = await cookies();
  const options = getCookieOptions(session.expiresAt);

  store.set(SESSION_TOKEN_COOKIE, session.token, options);
  store.set(SESSION_USER_ID_COOKIE, session.userId, options);
  store.set(SESSION_USERNAME_COOKIE, session.username, options);
  store.set(SESSION_DISPLAY_NAME_COOKIE, session.displayName, options);
  store.set(SESSION_EXPIRES_AT_COOKIE, session.expiresAt, options);
}

export async function clearSession() {
  const store = await cookies();

  for (const cookieName of [
    SESSION_TOKEN_COOKIE,
    SESSION_USER_ID_COOKIE,
    SESSION_USERNAME_COOKIE,
    SESSION_DISPLAY_NAME_COOKIE,
    SESSION_EXPIRES_AT_COOKIE,
  ]) {
    store.delete(cookieName);
  }
}
