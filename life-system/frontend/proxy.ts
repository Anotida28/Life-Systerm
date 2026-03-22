import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  SESSION_EXPIRES_AT_COOKIE,
  SESSION_TOKEN_COOKIE,
} from "./lib/session-cookies";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_TOKEN_COOKIE)?.value;
  const expiresAt = request.cookies.get(SESSION_EXPIRES_AT_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login";
  const expirationTime = expiresAt ? new Date(expiresAt).getTime() : 0;
  const hasValidSession =
    Boolean(sessionToken) &&
    expirationTime > Date.now();

  if (isLoginRoute && hasValidSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isLoginRoute && !hasValidSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
