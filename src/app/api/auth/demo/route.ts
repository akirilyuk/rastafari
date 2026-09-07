import { NextResponse } from "next/server";
import { DEMO_ACCOUNTS, MOCK_GOOGLE_LOCATIONS } from "@/lib/catalog";
import { upsertUser } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import type { AuthUser } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { role?: string };
  const role = body.role;

  let user: AuthUser;
  if (role === "google") {
    user = {
      id: "user-google",
      email: "you@gmail.com",
      name: "Google Artist",
      role: "master",
      provider: "google",
      picture: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80",
      googleLocations: MOCK_GOOGLE_LOCATIONS,
    };
  } else {
    const match = DEMO_ACCOUNTS.find((a) => a.role === role) ?? DEMO_ACCOUNTS[0];
    user = { ...match };
  }

  try {
    await upsertUser(user);
  } catch (error) {
    console.error("Could not persist user to Supabase", error);
  }
  await setSessionCookie(user);
  return NextResponse.json({ user });
}
