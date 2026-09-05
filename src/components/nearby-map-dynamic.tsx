"use client";

import dynamic from "next/dynamic";
import type { Master } from "@/lib/types";

const Map = dynamic(() => import("./nearby-map").then((m) => m.NearbyMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export function NearbyMapDynamic(props: {
  origin: { lat: number; lng: number };
  masters: Master[];
  distances: Record<string, number>;
}) {
  return <Map {...props} />;
}
