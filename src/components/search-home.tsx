"use client";

import { useEffect, useMemo, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { toast } from "sonner";
import { SERVICES } from "@/lib/catalog";
import { DEFAULT_LOCATION, formatDistance, haversineKm } from "@/lib/geo";
import { getTrafficSource } from "@/components/source-tracker";
import { MasterCard } from "@/components/master-card";
import { NearbyMapDynamic } from "@/components/nearby-map-dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { GeoPoint } from "@/lib/types";
import Link from "next/link";

export function SearchHome() {
  const { state, discoverCity, track } = useStore();
  const [query, setQuery] = useState("Berlin");
  const [origin, setOrigin] = useState<GeoPoint>(DEFAULT_LOCATION);
  const [suggestions, setSuggestions] = useState<GeoPoint[]>([]);
  const [selected, setSelected] = useState<string[]>(["natural-dreads", "synthetic-dreads", "kosy", "braids"]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const homeAd = state.ads.find((a) => a.placement === "home" && a.active);

  async function geocode(q: string) {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const data = (await res.json()) as { results: GeoPoint[] };
    return data.results;
  }

  async function applyPlace(place: GeoPoint) {
    setOrigin(place);
    setQuery(place.city);
    setSuggestions([]);
    const imported = await discoverCity(place.city);
    track({
      name: "search",
      source: getTrafficSource(),
      path: "/",
      meta: place.city,
    });
    if (imported.length) {
      toast.success(
        `Imported ${imported.length} public listing${imported.length === 1 ? "" : "s"} for ${place.city} from search.`,
      );
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const results = await geocode(query);
      if (results[0]) await applyPlace(results[0]);
      else toast.error("Could not find that place. Try a city name.");
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      void geocode(query).then((r) => setSuggestions(r.slice(0, 5)));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function useGps() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const results = await geocode(`${latitude},${longitude}`);
        const place = results[0] ?? {
          label: "Current location",
          city: "Nearby",
          country: "",
          lat: latitude,
          lng: longitude,
        };
        await applyPlace({ ...place, lat: latitude, lng: longitude });
        toast.success("Using your current location.");
      },
      () => {
        setGeoError("Location permission denied. Type a city instead.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function toggleTag(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const ranked = useMemo(() => {
    const withDist = state.masters.map((m) => ({
      master: m,
      km: haversineKm(origin, m),
    }));
    withDist.sort((a, b) => a.km - b.km);
    const filtered = selected.length
      ? withDist.filter((x) => x.master.services.some((s) => selected.includes(s)))
      : withDist;
    return filtered;
  }, [state.masters, origin, selected]);

  const distances = Object.fromEntries(ranked.map((x) => [x.master.id, x.km]));
  const mapMasters = ranked.slice(0, 40).map((x) => x.master);
  const nearest = ranked[0];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,160,40,0.18),_transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Locs · braids · kosy</p>
          <h1 className="mt-2 max-w-2xl font-heading text-4xl leading-[1.1] text-balance sm:text-5xl">
            The nearest artist for your hair, not a random salon.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Turn on location or type a city. Filter natural dreads, synthetic sets, kosy, and
            braids. Cards work like a map pin you can actually trust.
          </p>

          <form onSubmit={onSubmit} className="relative mt-6 max-w-xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Berlin, London, your neighborhood…"
                  className="h-11 bg-background/70 pl-9"
                  aria-label="City or address"
                />
                {suggestions.length > 0 && query !== origin.city && (
                  <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl bg-popover ring-1 ring-foreground/10">
                    {suggestions.map((s) => (
                      <li key={s.label}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => void applyPlace(s)}
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button type="submit" size="lg" disabled={searching}>
                Search
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={useGps} aria-label="Use my location">
                <LocateFixed />
              </Button>
            </div>
            {geoError && <p className="mt-2 text-sm text-destructive">{geoError}</p>}
          </form>

          {nearest && (
            <p className="mt-4 text-sm text-muted-foreground">
              Closest match:{" "}
              <Link href={`/masters/${nearest.master.slug}`} className="text-gold hover:underline">
                {nearest.master.name}
              </Link>{" "}
              in {nearest.master.city} · {formatDistance(nearest.km)}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {homeAd && (
          <Link
            href={homeAd.href}
            className="mb-6 flex flex-col gap-1 rounded-2xl bg-gold/10 px-4 py-3 ring-1 ring-gold/30 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs tracking-wide text-gold uppercase">Platform</p>
              <p className="font-medium">{homeAd.title}</p>
              <p className="text-sm text-muted-foreground">{homeAd.body}</p>
            </div>
            <span className="text-sm text-gold">View →</span>
          </Link>
        )}

        <div className="mb-4">
          <p className="mb-2 text-sm text-muted-foreground">Services — pick any mix of tags</p>
          <div className="flex flex-wrap gap-1.5">
            {SERVICES.map((s) => {
              const on = selected.includes(s.id);
              return (
                <button key={s.id} type="button" onClick={() => toggleTag(s.id)}>
                  <Badge variant={on ? "default" : "outline"} className="h-7 cursor-pointer">
                    {s.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-3">
            {ranked.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-foreground/10">
                <p className="font-heading text-xl">No artists with those tags nearby</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clear a filter or search another city. We also pull public listings when a city
                  is searched for the first time.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => setSelected([])}>
                  Show every artist
                </Button>
              </div>
            ) : (
              ranked.map(({ master, km }) => (
                <MasterCard
                  key={master.id}
                  master={master}
                  km={km}
                  reviews={state.reviews}
                />
              ))
            )}
          </div>
          <div className="h-[420px] overflow-hidden rounded-2xl ring-1 ring-foreground/10 lg:sticky lg:top-20 lg:h-[min(70vh,640px)]">
            <NearbyMapDynamic origin={origin} masters={mapMasters} distances={distances} />
          </div>
        </div>
      </div>
    </div>
  );
}
