"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const { verifyReview, hydrated } = useStore();
  const [status, setStatus] = useState<"wait" | "ok" | "bad">(token ? "wait" : "bad");

  useEffect(() => {
    if (!hydrated || !token) return;
    let cancelled = false;
    void verifyReview(token).then((found) => {
      if (!cancelled) setStatus(found ? "ok" : "bad");
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, token, verifyReview]);

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
