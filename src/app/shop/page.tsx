"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { getTrafficSource } from "@/components/source-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  const { state, track } = useStore();
  const ad = state.ads.find((a) => a.placement === "shop" && a.active);
  const products = state.products.filter((p) => p.owner === "platform");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs tracking-[0.2em] text-gold uppercase">Platform shop</p>
      <h1 className="font-heading text-4xl">Hair, kits, and aftercare we actually use</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        This is the host catalog — loc kits, synthetic packs, and the products taught in our
        courses. Artists can add their own shelf later as a paid showcase on their card.
      </p>
      {ad && (
        <Link href={ad.href} className="mt-6 block rounded-2xl bg-gold/10 p-4 ring-1 ring-gold/30">
          <p className="font-medium">{ad.title}</p>
          <p className="text-sm text-muted-foreground">{ad.body}</p>
        </Link>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {products.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10">
            <div className="relative h-48">
              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="50vw" />
              {p.featured && (
                <Badge className="absolute top-3 left-3" variant="secondary">
                  Featured
                </Badge>
              )}
            </div>
            <div className="p-5">
              <h2 className="font-heading text-2xl">{p.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-3 text-lg text-gold">
                {p.price} {p.currency}
              </p>
              <Button
                className="mt-4"
                onClick={() =>
                  track({
                    name: "product_click",
                    source: getTrafficSource(),
                    path: "/shop",
                    meta: p.id,
                  })
                }
              >
                Add to bag (demo)
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
