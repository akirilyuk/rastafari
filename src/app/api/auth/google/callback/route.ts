import { NextResponse } from "next/server";
import { MOCK_GOOGLE_LOCATIONS } from "@/lib/catalog";
import { upsertUser } from "@/lib/db";
import { googleConfigured, setSessionCookie } from "@/lib/session";
import type { AuthUser } from "@/lib/types";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code || !googleConfigured()) {
    return NextResponse.redirect(new URL("/sign-in?error=google", origin));
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/sign-in?error=token", origin));
  }
  const tokens = (await tokenRes.json()) as { access_token: string };
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = (await profileRes.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };

  const user: AuthUser = {
    id: `google-${profile.sub}`,
    email: profile.email,
    name: profile.name,
    role: "master",
    provider: "google",
    picture: profile.picture,
    googleLocations: MOCK_GOOGLE_LOCATIONS,
  };
  try {
    await upsertUser(user);
  } catch (error) {
    console.error("Could not persist user to Supabase", error);
  }
  await setSessionCookie(user);
  return NextResponse.redirect(new URL("/dashboard?imported=google", origin));
}
