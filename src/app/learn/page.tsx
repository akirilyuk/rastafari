"use client";

import Image from "next/image";
import { useStore } from "@/lib/store";
import { getTrafficSource } from "@/components/source-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LearnPage() {
  const { state, track } = useStore();
  const ad = state.ads.find((a) => a.placement === "learn" && a.active);
  const ours = state.courses.filter((c) => c.platformOwned);
  const others = state.courses.filter((c) => !c.platformOwned);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs tracking-[0.2em] text-gold uppercase">Education</p>
      <h1 className="font-heading text-4xl">Courses we teach — and ones we host as ads</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        v1 is a storefront, not a school LMS. Our lessons live on the academy site; other artists
        can buy a sponsored slot that points at theirs. Full in-app playback can come later.
      </p>
      {ad && (
        <a href={ad.href} className="mt-6 block rounded-2xl bg-gold/10 p-4 ring-1 ring-gold/30">
          <p className="text-xs text-gold uppercase">Also in the shop</p>
          <p className="font-medium">{ad.title}</p>
          <p className="text-sm text-muted-foreground">{ad.body}</p>
        </a>
      )}

      <h2 className="mt-10 font-heading text-2xl">Rastafari Academy</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {ours.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10">
            <div className="relative h-44">
              <Image src={c.image} alt={c.title} fill className="object-cover" sizes="50vw" />
            </div>
            <div className="p-5">
              <Badge variant="secondary">Platform</Badge>
              <h3 className="mt-2 font-heading text-2xl">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.teacher}</p>
              <p className="mt-2 text-sm">{c.description}</p>
              <p className="mt-3 text-gold">
                {c.price} {c.currency}
              </p>
              <Button
                className="mt-4"
                render={<a href={c.url} target="_blank" rel="noreferrer" />}
                onClick={() =>
                  track({
                    name: "course_click",
                    source: getTrafficSource(),
                    path: "/learn",
                    meta: c.id,
                  })
                }
              >
                Open course
              </Button>
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-12 font-heading text-2xl">Sponsored artist courses</h2>
      <p className="text-sm text-muted-foreground">Paid placements. The lesson itself stays on their site.</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {others.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10">
            <div className="relative h-40">
              <Image src={c.image} alt={c.title} fill className="object-cover" sizes="50vw" />
            </div>
            <div className="p-5">
              <Badge variant="outline">Sponsored</Badge>
              <h3 className="mt-2 font-heading text-xl">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.teacher}</p>
              <p className="mt-2 text-sm">{c.description}</p>
              <Button
                className="mt-4"
                variant="outline"
                render={<a href={c.url} target="_blank" rel="noreferrer" />}
                onClick={() =>
                  track({
                    name: "course_click",
                    source: getTrafficSource(),
                    path: "/learn",
                    meta: c.id,
                  })
                }
              >
                Visit their school
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
