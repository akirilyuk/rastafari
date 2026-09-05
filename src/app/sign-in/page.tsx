"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { user, demoSignIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const googleHint = params.get("google") === "demo";
  const error = params.get("error");

  async function enter(role: "client" | "master" | "admin" | "google") {
    await demoSignIn(role);
    if (role === "admin") router.push("/admin");
    else if (role === "master" || role === "google") router.push("/dashboard");
    else router.push("/");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-heading text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Google OAuth is wired. Without <code className="text-gold">GOOGLE_CLIENT_ID</code> it uses
        a demo Google session that still exposes Business Profile locations you can import.
      </p>
      {googleHint && (
        <p className="mt-3 rounded-xl bg-gold/10 p-3 text-sm">
          Google keys are not set, so this is the demo Google path — same picker, no live Google
          account.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-destructive">Google sign-in failed ({error}).</p>
      )}

      {user && (
        <p className="mt-4 text-sm">
          Signed in as <strong>{user.name}</strong> ({user.role}).{" "}
          <Link href="/dashboard" className="text-gold underline">
            Open studio
          </Link>
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Button
          size="lg"
          className="h-11"
          onClick={() => {
            window.location.href = "/api/auth/google";
          }}
        >
          Continue with Google
        </Button>
        <Button size="lg" variant="outline" className="h-11" onClick={() => void enter("google")}>
          Demo Google + Business locations
        </Button>
        <Button variant="secondary" onClick={() => void enter("client")}>
          Continue as client
        </Button>
        <Button variant="secondary" onClick={() => void enter("master")}>
          Continue as artist (Nia Roots, Berlin)
        </Button>
        <Button variant="secondary" onClick={() => void enter("admin")}>
          Continue as admin
        </Button>
      </div>
    </div>
  );
}
