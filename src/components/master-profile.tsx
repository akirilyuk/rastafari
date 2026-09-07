"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { MapPin, Store } from "lucide-react";
import { toast } from "sonner";
import { OTHER_SERVICE, REVIEW_CRITERIA, serviceById } from "@/lib/catalog";
import { averageScore, masterRating, serviceRating, useStore } from "@/lib/store";
import { getTrafficSource } from "@/components/source-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreLabel, StarRating } from "@/components/star-rating";
import type { Review } from "@/lib/types";

export function MasterProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { state, track, reportReview } = useStore();
  const master = state.masters.find((m) => m.slug === slug);
  const [hero, setHero] = useState(0);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("inaccurate");
  const [reportDetails, setReportDetails] = useState("");

  if (!master) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-heading text-3xl">Listing not found</h1>
        <p className="mt-2 text-muted-foreground">This artist may have been removed.</p>
        <Button className="mt-6" render={<Link href="/" />}>
          Back to search
        </Button>
      </div>
    );
  }

  const reviews = state.reviews.filter(
    (r) => r.masterId === master.id && r.status === "published",
  );
  const rating = masterRating(state.reviews, master.id);
  const products = state.products.filter(
    (p) => master.hasShowcase && master.productIds.includes(p.id),
  );

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            {master.photos[hero] && (
              <Image
                src={master.photos[hero].url}
                alt={master.photos[hero].alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            )}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {master.photos.map((p, i) => (
              <button
                key={p.url + i}
                type="button"
                onClick={() => setHero(i)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 ${
                  i === hero ? "ring-gold" : "ring-transparent"
                }`}
              >
                <Image src={p.url} alt={p.alt} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs tracking-[0.18em] text-gold uppercase">
              {master.source === "gbp-sync"
                ? "Google Business"
                : master.source === "google-import"
                  ? "Imported listing"
                  : "Registered studio"}
            </p>
            <h1 className="font-heading text-4xl leading-tight">{master.name}</h1>
            <p className="text-muted-foreground">{master.studioName}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <MapPin className="size-4" />
              {master.address}
            </p>
            <div className="mt-2">
              <ScoreLabel value={rating.avg} count={rating.count} />
            </div>
          </div>
          <p className="text-sm leading-relaxed">{master.bio}</p>
          <div className="flex flex-wrap gap-1.5">
            {master.services.map((id) => (
              <Badge key={id} variant="secondary">
                {serviceById(id)?.name ?? id}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              render={<Link href={`/masters/${master.slug}/review`} />}
              onClick={() =>
                track({
                  name: "master_click",
                  source: getTrafficSource(),
                  path: `/masters/${master.slug}`,
                  meta: "review",
                })
              }
            >
              Write a review
            </Button>
            {!master.claimed && (
              <Button variant="outline" render={<Link href={`/masters/${master.slug}/claim`} />}>
                This is my studio
              </Button>
            )}
            {master.instagram && (
              <Button
                variant="ghost"
                render={
                  <a
                    href={`https://instagram.com/${master.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                @{master.instagram}
              </Button>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl">How clients rate each service</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Stars on the service they actually sat for — not just the artist overall.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {master.services.map((id) => {
            const svc = serviceById(id);
            const sr = serviceRating(state.reviews, master.id, id);
            return (
              <div key={id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                <p className="font-medium">{svc?.name}</p>
                <ScoreLabel value={sr.avg} count={sr.count} />
              </div>
            );
          })}
        </div>
      </section>

      {master.hasShowcase && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-heading text-2xl">
            <Store className="size-5 text-gold" />
            Studio shop
          </h2>
          {products.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Showcase is on, but no products yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {products.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
                  <div className="relative h-36">
                    <Image src={p.image} alt={p.name} fill className="object-cover" sizes="400px" />
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <p className="mt-2 text-gold">
                      {p.price} {p.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-heading text-2xl">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-card p-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
            No verified reviews yet. The first one has to confirm an email — that keeps fake
            ratings off the card.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {reviews.map((r) => (
              <ReviewBlock
                key={r.id}
                review={r}
                onReport={() => setReportId(r.id)}
              />
            ))}
          </ul>
        )}
      </section>

      {reportId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-popover p-5 ring-1 ring-foreground/10">
            <h3 className="font-heading text-xl">Report this review</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Reports go to the admin queue. We moderate because the law requires it — we do not
              sell “review removal.”
            </p>
            <label className="mt-3 block text-sm">
              Reason
              <select
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="inaccurate">Inaccurate or misleading</option>
                <option value="abuse">Harassment or hate</option>
                <option value="spam">Spam or advertising</option>
                <option value="conflict">Conflict of interest</option>
              </select>
            </label>
            <Textarea
              className="mt-3"
              placeholder="Anything else we should know?"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReportId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  void reportReview(reportId, reportReason, reportDetails).then(() => {
                    toast.success("Report sent to moderation.");
                  });
                  setReportId(null);
                  setReportDetails("");
                }}
              >
                Submit report
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ReviewBlock({ review, onReport }: { review: Review; onReport: () => void }) {
  const svc = serviceById(review.serviceId) ?? OTHER_SERVICE;
  return (
    <li className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{review.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {svc.name} · {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        <ScoreLabel value={averageScore(review)} count={1} />
      </div>
      <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        {REVIEW_CRITERIA.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{c.name}</dt>
            <dd>
              <StarRating value={review.scores[c.id] ?? 0} readOnly size="sm" />
            </dd>
          </div>
        ))}
      </dl>
      <Button variant="ghost" size="sm" className="mt-2" onClick={onReport}>
        Report
      </Button>
    </li>
  );
}
