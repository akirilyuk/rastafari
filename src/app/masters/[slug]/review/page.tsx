"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { OTHER_SERVICE, REVIEW_CRITERIA, SERVICES } from "@/lib/catalog";
import { useAuth } from "@/lib/auth-client";
import { useStore } from "@/lib/store";
import { getTrafficSource } from "@/components/source-tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";

export default function ReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { state, addReview, track } = useStore();
  const master = state.masters.find((m) => m.slug === slug);

  const serviceOptions = useMemo(() => {
    const claimed = (master?.services ?? []).map(
      (id) => SERVICES.find((s) => s.id === id) ?? { id, name: id, category: "braids" as const },
    );
    return [...claimed, OTHER_SERVICE];
  }, [master]);

  const [serviceId, setServiceId] = useState(serviceOptions[0]?.id ?? "other");
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(REVIEW_CRITERIA.map((c) => [c.id, 0])),
  );
  const [comment, setComment] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pending, setPending] = useState<string | null>(null);

  if (!master) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p>Artist not found.</p>
        <Button className="mt-4" render={<Link href="/" />}>
          Home
        </Button>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!master) return;
    if (Object.values(scores).some((n) => n < 1)) {
      toast.error("Give every criterion at least one star.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Enter an email we can verify.");
      return;
    }
    const token = crypto.randomUUID();
    const review = addReview({
      masterId: master.id,
      serviceId,
      authorName: name.trim() || "Client",
      authorEmail: email.trim(),
      emailVerified: false,
      verifyToken: token,
      scores,
      comment: comment.trim(),
    });
    track({
      name: "review_submit",
      source: getTrafficSource(),
      path: `/masters/${slug}/review`,
      meta: master.id,
    });
    setPending(`/verify?token=${review.verifyToken ?? token}`);
  }

  if (pending) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-heading text-3xl">Confirm your email</h1>
        <p className="mt-3 text-muted-foreground">
          Reviews only go live after the address is confirmed. In production we send that link by
          email. In this prototype, open it here:
        </p>
        <Button className="mt-6" render={<Link href={pending} />}>
          Verify {email}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg px-4 py-10">
      <p className="text-sm text-muted-foreground">
        Reviewing <span className="text-foreground">{master.name}</span>
      </p>
      <h1 className="font-heading text-3xl">Which service were you there for?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick from the tags on their card, or Other if the listing is still incomplete.
      </p>

      <Label className="mt-6">Service</Label>
      <select
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
      >
        {serviceOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <div className="mt-6 space-y-4">
        {REVIEW_CRITERIA.map((c) => (
          <div key={c.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.hint}</p>
              </div>
              <StarRating
                value={scores[c.id] ?? 0}
                onChange={(n) => setScores((s) => ({ ...s, [c.id]: n }))}
              />
            </div>
          </div>
        ))}
      </div>

      <Label className="mt-6">Anything else?</Label>
      <Textarea
        className="mt-1"
        rows={4}
        placeholder="One field for the story — optional."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Your name</Label>
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Email to verify</Label>
          <Input
            className="mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button type="submit">Send for verification</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
