import { NextResponse } from "next/server";
import { googleConfigured } from "@/lib/session";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/sign-in?google=demo", origin));
  }
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });
  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
