"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const { verifyReview, hydrated, state } = useStore();
  const [status, setStatus] = useState<"wait" | "ok" | "bad">("wait");

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setStatus("bad");
      return;
    }

    const existing = state.reviews.find((r) => r.verifyToken === token);
    if (existing?.status === "published" || existing?.emailVerified) {
      setStatus("ok");
      return;
    }
    if (existing) {
      verifyReview(token);
      setStatus("ok");
      return;
    }

    const found = verifyReview(token);
    setStatus(found ? "ok" : "bad");
  }, [hydrated, token, state.reviews, verifyReview]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {status === "wait" && <p>Checking the link…</p>}
      {status === "ok" && (
        <>
          <h1 className="font-heading text-3xl">Email confirmed</h1>
          <p className="mt-3 text-muted-foreground">
            The review is live on the artist card.
          </p>
        </>
      )}
      {status === "bad" && (
        <>
          <h1 className="font-heading text-3xl">Link did not work</h1>
          <p className="mt-3 text-muted-foreground">
            It may have already been used, or the token is missing.
          </p>
        </>
      )}
      <Button className="mt-6" nativeButton={false} render={<Link href="/" />}>
        Find artists
      </Button>
    </div>
  );
}
