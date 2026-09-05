"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Master } from "@/lib/types";
import { SERVICES } from "@/lib/catalog";
import { formatDistance } from "@/lib/geo";
import { masterRating } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { ScoreLabel } from "@/components/star-rating";
import type { Review } from "@/lib/types";

export function MasterCard({
  master,
  km,
  reviews,
}: {
  master: Master;
  km?: number;
  reviews: Review[];
}) {
  const portrait =
    master.photos.find((p) => p.kind === "portrait") ?? master.photos[0];
  const rating = masterRating(reviews, master.id);
  const tags = master.services
    .map((id) => SERVICES.find((s) => s.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link
      href={`/masters/${master.slug}`}
      className="group flex overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:ring-gold/40"
    >
      <div className="relative h-36 w-28 shrink-0 sm:h-40 sm:w-36">
        {portrait && (
          <Image
            src={portrait.url}
            alt={portrait.alt}
            fill
            className="object-cover"
            sizes="144px"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-heading text-lg leading-tight">{master.name}</p>
              <p className="truncate text-sm text-muted-foreground">{master.studioName}</p>
            </div>
            {master.claimed ? (
              <Badge variant="secondary">Claimed</Badge>
            ) : (
              <Badge variant="outline">Unclaimed</Badge>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {master.city}
            {km !== undefined && ` · ${formatDistance(km)}`}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <ScoreLabel value={rating.avg} count={rating.count} />
          {tags.map((t) => (
            <Badge key={t} variant="outline" className="font-normal">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
