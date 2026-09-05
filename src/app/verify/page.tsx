"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const { verifyReview, hydrated } = useStore();
  const [status, setStatus] = useState<"wait" | "ok" | "bad">("wait");
  const ran = useRef(false);

  useEffect(() => {
    if (!hydrated || ran.current) return;
    if (!token) {
      setStatus("bad");
      return;
    }
    ran.current = true;
    const found = verifyReview(token);
    setStatus(found ? "ok" : "bad");
  }, [token, verifyReview, hydrated]);

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
      <Button className="mt-6" render={<Link href="/" />}>
        Find artists
      </Button>
    </div>
  );
}
