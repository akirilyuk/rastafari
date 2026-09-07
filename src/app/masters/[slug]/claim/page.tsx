"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-client";
import { useStore } from "@/lib/store";
import { getTrafficSource } from "@/components/source-tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ClaimPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { state, submitClaim, track } = useStore();
  const master = state.masters.find((m) => m.slug === slug);
  const existing = state.claims.find(
    (c) => c.masterId === master?.id && c.status === "pending",
  );
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [instagram, setInstagram] = useState(master?.instagram ?? "");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  if (!master) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        Listing missing.
      </div>
    );
  }

  if (master.claimed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-heading text-3xl">Already claimed</h1>
        <p className="mt-2 text-muted-foreground">
          Someone has access to this card. If that should be you, write to the admin from the
          dashboard after signing in.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!master) return;
    try {
      await submitClaim({
        masterId: master.id,
        name: name.trim(),
        email: email.trim(),
        instagram: instagram.trim(),
        message: message.trim(),
      });
      track({
        name: "claim_submit",
        source: getTrafficSource(),
        path: `/masters/${slug}/claim`,
        meta: master.id,
      });
      toast.success("Claim sent. An admin will approve it by hand.");
      setDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the claim.");
    }
  }

  if (done || existing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-heading text-3xl">Claim is in the queue</h1>
        <p className="mt-3 text-muted-foreground">
          We approve studio access manually so imported Google listings cannot be hijacked. Sign
          in as admin to grant it, or wait for the team.
        </p>
        <Button className="mt-6" render={<Link href={`/masters/${slug}`} />}>
          Back to the card
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-heading text-3xl">Claim {master.studioName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {master.address}. Tell us how we can tell this chair is yours — Instagram handle is
        enough for the first pass.
      </p>
      <div className="mt-6 space-y-3">
        <div>
          <Label>Your name</Label>
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            className="mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Instagram</Label>
          <Input
            className="mt-1"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>
        <div>
          <Label>Note</Label>
          <Textarea
            className="mt-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="This is my studio because…"
          />
        </div>
      </div>
      <Button className="mt-6" type="submit">
        Request access
      </Button>
    </form>
  );
}
