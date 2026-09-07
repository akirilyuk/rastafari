"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-client";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Ad } from "@/lib/types";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const {
    state,
    backend,
    moderateClaim,
    moderateReview,
    resolveReport,
    upsertAd,
    reset,
  } = useStore();

  const funnel = useMemo(() => {
    const events = state.events;
    const byName = (n: string, source?: string) =>
      events.filter((e) => e.name === n && (!source || e.source === source)).length;
    const google = events.filter((e) => e.source === "google" || e.source === "google-ads");
    return {
      views: events.filter((e) => e.name === "page_view").length,
      googleViews: google.filter((e) => e.name === "page_view").length,
      searches: byName("search"),
      masterClicks: byName("master_click"),
      reviews: byName("review_submit"),
      courses: byName("course_click"),
      products: byName("product_click"),
      googleMaster: google.filter((e) => e.name === "master_click").length,
      googleCourse: google.filter((e) => e.name === "course_click").length,
    };
  }, [state.events]);

  if (loading) return <p className="px-4 py-16 text-center">Loading…</p>;
  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-3xl">Admin only</h1>
        <p className="mt-2 text-muted-foreground">Sign in with the admin demo account to moderate claims, reviews, and ads.</p>
        <Button className="mt-6" render={<Link href="/sign-in" />}>
          Sign in
        </Button>
      </div>
    );
  }

  const openReports = state.reports.filter((r) => r.status === "open");
  const pendingClaims = state.claims.filter((c) => c.status === "pending");
  const pendingReviews = state.reviews.filter((r) => r.status === "pending_email");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold uppercase">Moderation</p>
          <h1 className="font-heading text-4xl">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Database: {backend === "supabase" ? "Supabase (shared)" : "this browser (localStorage)"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void reset().then(() =>
              toast.success(backend === "supabase" ? "Database reset to seed data." : "Demo data reset."),
            );
          }}
        >
          {backend === "supabase" ? "Reset database" : "Reset local data"}
        </Button>
      </div>

      <Tabs defaultValue="claims" className="mt-8">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="claims">Claims ({pendingClaims.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="reports">Reports ({openReports.length})</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="stats">Funnel</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="mt-4">
          {state.claims.length === 0 ? (
            <Empty>No claim requests yet. Open an unclaimed card and tap “This is my studio.”</Empty>
          ) : (
            <ul className="space-y-3">
              {state.claims.map((c) => {
                const master = state.masters.find((m) => m.id === c.masterId);
                return (
                  <li key={c.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{c.name} → {master?.studioName}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.email} · @{c.instagram} · {c.status}
                        </p>
                        <p className="mt-2 text-sm">{c.message || "No note"}</p>
                      </div>
                      <Badge variant={c.status === "pending" ? "default" : "secondary"}>
                        {c.status}
                      </Badge>
                    </div>
                    {c.status === "pending" && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          onClick={() => {
                            moderateClaim(c.id, "approved", "user-master");
                            toast.success("Artist can now edit this card.");
                          }}
                        >
                          Approve
                        </Button>
                        <Button variant="outline" onClick={() => moderateClaim(c.id, "rejected")}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {pendingReviews.length} waiting on email. Hide anything that should not stay public.
          </p>
          <ul className="space-y-3">
            {state.reviews.map((r) => {
              const master = state.masters.find((m) => m.id === r.masterId);
              return (
                <li key={r.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                  <p className="font-medium">
                    {r.authorName} on {master?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.authorEmail} · {r.status} · reports {r.reportCount}
                  </p>
                  <p className="mt-2 text-sm">{r.comment || "Stars only"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.status !== "hidden" && (
                      <Button variant="outline" onClick={() => moderateReview(r.id, "hidden")}>
                        Hide
                      </Button>
                    )}
                    {r.status === "hidden" && (
                      <Button onClick={() => moderateReview(r.id, "published")}>Unhide</Button>
                    )}
                    {r.status === "pending_email" && (
                      <Button onClick={() => moderateReview(r.id, "published")}>
                        Publish without email (override)
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          {state.reports.length === 0 ? (
            <Empty>No reports. Clients can flag a review from the artist card.</Empty>
          ) : (
            <ul className="space-y-3">
              {state.reports.map((rep) => {
                const review = state.reviews.find((r) => r.id === rep.reviewId);
                return (
                  <li key={rep.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                    <p className="font-medium">{rep.reason}</p>
                    <p className="text-sm text-muted-foreground">{rep.details || "No details"}</p>
                    <p className="mt-2 text-sm italic">{review?.comment}</p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => {
                          if (review) moderateReview(review.id, "hidden");
                          resolveReport(rep.id, "resolved");
                          toast.success("Review hidden.");
                        }}
                      >
                        Hide review
                      </Button>
                      <Button variant="outline" onClick={() => resolveReport(rep.id, "dismissed")}>
                        Dismiss
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="ads" className="mt-4">
          <AdForm
            onSave={(ad) => {
              upsertAd(ad);
              toast.success("Ad saved.");
            }}
          />
          <ul className="mt-6 space-y-3">
            {state.ads.map((ad) => (
              <li key={ad.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium">{ad.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ad.placement} · {ad.href}
                    </p>
                    <p className="mt-1 text-sm">{ad.body}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => upsertAd({ ...ad, active: !ad.active })}
                  >
                    {ad.active ? "Pause" : "Activate"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Events stay {backend === "supabase" ? "in Supabase" : "in this browser"}. Append{" "}
            <code className="text-gold">?src=google-ads</code>{" "}
            to any URL to mark a Google Ads visit, then watch how many of those sessions click an
            artist vs a course.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Page views" value={funnel.views} />
            <Stat label="From Google tag" value={funnel.googleViews} />
            <Stat label="Searches" value={funnel.searches} />
            <Stat label="Artist clicks" value={funnel.masterClicks} />
            <Stat label="Reviews started" value={funnel.reviews} />
            <Stat label="Course clicks" value={funnel.courses} />
            <Stat label="Product clicks" value={funnel.products} />
            <Stat
              label="Google → course"
              value={funnel.googleViews ? Math.round((funnel.googleCourse / funnel.googleViews) * 100) : 0}
              suffix="%"
            />
          </div>
        </TabsContent>

        <TabsContent value="outreach" className="mt-4 space-y-4">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="font-heading text-xl">Instagram, without a bot</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Mass-DMing artists from an automated Instagram account violates their rules and
              gets the number banned. Growth in v1 is: import public listings when a city is
              searched, then send a human note asking them to claim the page and put Rastafari in
              the bio.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-background p-4 text-xs leading-relaxed whitespace-pre-wrap">
{`Hi {name} — we listed {studio} on Rastafari so people searching {city} for locs / braids can find you. The page is free. Claim it here: {link}

If you already have a Google Business profile, sign in with Google and pick that location so the address stays in sync.

A link in your Instagram bio helps the next client skip the DM “who does dreads in this city” thread.`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-card p-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
      {children}
    </p>
  );
}

function Stat({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-3xl tabular-nums">
        {value}
        {suffix}
      </p>
    </div>
  );
}

function AdForm({ onSave }: { onSave: (ad: Ad) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [href, setHref] = useState("/learn");
  const [placement, setPlacement] = useState<Ad["placement"]>("home");

  return (
    <form
      className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          id: `ad-${Math.random().toString(36).slice(2, 7)}`,
          title,
          body,
          href,
          placement,
          active: true,
        });
        setTitle("");
        setBody("");
      }}
    >
      <p className="font-medium">Place an ad</p>
      <div>
        <Label>Title</Label>
        <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Body</Label>
        <Textarea className="mt-1" value={body} onChange={(e) => setBody(e.target.value)} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Link</Label>
          <Input className="mt-1" value={href} onChange={(e) => setHref(e.target.value)} />
        </div>
        <div>
          <Label>Placement</Label>
          <select
            className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
            value={placement}
            onChange={(e) => setPlacement(e.target.value as Ad["placement"])}
          >
            <option value="home">Home</option>
            <option value="learn">Learn</option>
            <option value="shop">Shop</option>
            <option value="master">Artist card</option>
          </select>
        </div>
      </div>
      <Button type="submit">Publish ad</Button>
    </form>
  );
}
