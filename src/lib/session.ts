import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { AuthUser } from "./types";

const COOKIE = "rastafari_session";

function secret() {
  return process.env.AUTH_SECRET || "rastafari-demo-secret-change-me";
}

export function signSession(user: AuthUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSession(token: string | undefined): AuthUser | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const jar = await cookies();
  return readSession(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(user: AuthUser) {
  const jar = await cookies();
  jar.set(COOKIE, signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function appUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://127.0.0.1:43127"
  );
}
