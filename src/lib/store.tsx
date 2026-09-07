"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { DISCOVERY_POOL, createInitialState } from "./seed";
import type {
  Ad,
  AnalyticsEvent,
  AppState,
  Claim,
  GoogleBusinessLocation,
  Master,
  Review,
  ReviewReport,
} from "./types";
import { uid } from "./uid";

const STORAGE_KEY = "rastafari-db-v1";

export type StoreBackend = "local" | "supabase";

function persist(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode */
  }
}

function readStored(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch {
    return null;
  }
}

type StoreContextValue = {
  state: AppState;
  hydrated: boolean;
  backend: StoreBackend;
  reset: () => Promise<void>;
  track: (event: Omit<AnalyticsEvent, "id" | "createdAt">) => void;
  discoverCity: (city: string) => Promise<Master[]>;
  addReview: (review: Omit<Review, "id" | "createdAt" | "reportCount" | "status">) => Promise<Review>;
  verifyReview: (token: string) => Promise<Review | null>;
  reportReview: (reviewId: string, reason: string, details: string) => Promise<void>;
  moderateReview: (reviewId: string, status: Review["status"]) => Promise<void>;
  resolveReport: (reportId: string, status: ReviewReport["status"]) => Promise<void>;
  submitClaim: (claim: Omit<Claim, "id" | "createdAt" | "status">) => Promise<Claim>;
  moderateClaim: (claimId: string, status: Claim["status"], userId?: string) => Promise<void>;
  updateMaster: (id: string, patch: Partial<Master>) => Promise<void>;
  importGbpLocation: (loc: GoogleBusinessLocation, userId: string) => Promise<Master>;
  upsertAd: (ad: Ad) => Promise<void>;
  toggleShowcase: (masterId: string, enabled: boolean) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

async function postStore<T>(action: string, payload?: unknown) {
  const res = await fetch("/api/store", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload === undefined ? { action } : { action, payload }),
  });
  const data = (await res.json()) as { error?: string; result?: T; state?: AppState };
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);
  const [backend, setBackend] = useState<StoreBackend>("local");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/store");
        const data = (await res.json()) as {
          backend?: StoreBackend;
          state?: AppState;
          error?: string;
        };
        if (cancelled) return;
        if (data.backend === "supabase" && data.state) {
          setBackend("supabase");
          setState(data.state);
        } else {
          if (data.backend === "supabase" && data.error) {
            toast.error(`Supabase: ${data.error}`);
          }
          const stored = readStored();
          if (stored) setState(stored);
        }
      } catch {
        const stored = readStored();
        if (stored && !cancelled) setState(stored);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || backend !== "local") return;
    persist(state);
  }, [state, hydrated, backend]);

  const applyRemote = useCallback((next?: AppState) => {
    if (next) setState(next);
  }, []);

  const reset = useCallback(async () => {
    if (backend === "supabase") {
      const data = await postStore<boolean>("reset");
      applyRemote(data.state);
      return;
    }
    const next = createInitialState();
    setState(next);
    persist(next);
  }, [applyRemote, backend]);

  const track = useCallback((event: Omit<AnalyticsEvent, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      events: [
        {
          ...event,
          id: uid("ev"),
          createdAt: new Date().toISOString(),
        },
        ...s.events,
      ].slice(0, 400),
    }));
    if (backend === "supabase") {
      void postStore("track", event).catch(() => {
        /* funnel is best-effort */
      });
    }
  }, [backend]);

  const discoverCity = useCallback(async (city: string) => {
    if (backend === "supabase") {
      const data = await postStore<Master[]>("discoverCity", { city });
      applyRemote(data.state);
      return data.result ?? [];
    }
    const key = city.trim().toLowerCase();
    const already = state.discoveredCities.map((c) => c.toLowerCase()).includes(key);
    if (already) return [];
    const imported = DISCOVERY_POOL.filter(
      (m) => m.city.toLowerCase() === key && !state.masters.some((x) => x.id === m.id),
    );
    setState((s) => {
      if (s.discoveredCities.map((c) => c.toLowerCase()).includes(key)) return s;
      const extra = DISCOVERY_POOL.filter(
        (m) => m.city.toLowerCase() === key && !s.masters.some((x) => x.id === m.id),
      );
      return {
        ...s,
        masters: extra.length ? [...s.masters, ...extra] : s.masters,
        discoveredCities: [...s.discoveredCities, city],
      };
    });
    return imported;
  }, [applyRemote, backend, state.discoveredCities, state.masters]);

  const addReview = useCallback(
    async (review: Omit<Review, "id" | "createdAt" | "reportCount" | "status">) => {
      if (backend === "supabase") {
        const data = await postStore<Review>("addReview", review);
        applyRemote(data.state);
        if (!data.result) throw new Error("Review was not saved");
        return data.result;
      }
      const next: Review = {
        ...review,
        id: uid("rev"),
        createdAt: new Date().toISOString(),
        reportCount: 0,
        status: "pending_email",
      };
      setState((s) => {
        const updated = { ...s, reviews: [next, ...s.reviews] };
        persist(updated);
        return updated;
      });
      return next;
    },
    [applyRemote, backend],
  );

  const verifyReview = useCallback(async (token: string) => {
    if (backend === "supabase") {
      const data = await postStore<Review | null>("verifyReview", { token });
      applyRemote(data.state);
      return data.result ?? null;
    }
    const apply = (s: AppState) => {
      const match = s.reviews.find((r) => r.verifyToken === token);
      if (!match) return { next: s, found: null as Review | null };
      const found: Review = {
        ...match,
        emailVerified: true,
        status: "published",
      };
      return {
        next: {
          ...s,
          reviews: s.reviews.map((r) => (r.id === match.id ? found : r)),
        },
        found,
      };
    };

    const stored = readStored();
    const fromStore = stored ? apply(stored) : { next: stored, found: null };
    if (fromStore.found && fromStore.next) {
      persist(fromStore.next);
      setState(fromStore.next);
      return fromStore.found;
    }

    let found: Review | null = null;
    setState((s) => {
      const result = apply(s);
      found = result.found;
      if (result.found) persist(result.next);
      return result.next;
    });
    return found;
  }, [applyRemote, backend]);

  const reportReview = useCallback(async (reviewId: string, reason: string, details: string) => {
    if (backend === "supabase") {
      const data = await postStore("reportReview", { reviewId, reason, details });
      applyRemote(data.state);
      return;
    }
    setState((s) => ({
      ...s,
      reports: [
        {
          id: uid("rep"),
          reviewId,
          reason,
          details,
          status: "open",
          createdAt: new Date().toISOString(),
        },
        ...s.reports,
      ],
      reviews: s.reviews.map((r) =>
        r.id === reviewId ? { ...r, reportCount: r.reportCount + 1 } : r,
      ),
    }));
  }, [applyRemote, backend]);

  const moderateReview = useCallback(async (reviewId: string, status: Review["status"]) => {
    if (backend === "supabase") {
      const data = await postStore("moderateReview", { reviewId, status });
      applyRemote(data.state);
      return;
    }
    setState((s) => ({
      ...s,
      reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, status } : r)),
    }));
  }, [applyRemote, backend]);

  const resolveReport = useCallback(async (reportId: string, status: ReviewReport["status"]) => {
    if (backend === "supabase") {
      const data = await postStore("resolveReport", { reportId, status });
      applyRemote(data.state);
      return;
    }
    setState((s) => ({
      ...s,
      reports: s.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
    }));
  }, [applyRemote, backend]);

  const submitClaim = useCallback(async (claim: Omit<Claim, "id" | "createdAt" | "status">) => {
    if (backend === "supabase") {
      const data = await postStore<Claim>("submitClaim", claim);
      applyRemote(data.state);
      if (!data.result) throw new Error("Claim was not saved");
      return data.result;
    }
    const next: Claim = {
      ...claim,
      id: uid("cl"),
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setState((s) => ({ ...s, claims: [next, ...s.claims] }));
    return next;
  }, [applyRemote, backend]);

  const moderateClaim = useCallback(
    async (claimId: string, status: Claim["status"], userId?: string) => {
      if (backend === "supabase") {
        const data = await postStore("moderateClaim", { claimId, status, userId });
        applyRemote(data.state);
        return;
      }
      setState((s) => {
        const claim = s.claims.find((c) => c.id === claimId);
        return {
          ...s,
          claims: s.claims.map((c) => (c.id === claimId ? { ...c, status } : c)),
          masters:
            claim && status === "approved"
              ? s.masters.map((m) =>
                  m.id === claim.masterId
                    ? {
                        ...m,
                        claimed: true,
                        claimedByUserId: userId ?? claim.userId ?? m.claimedByUserId,
                        source: m.source === "google-import" ? "registered" : m.source,
                      }
                    : m,
                )
              : s.masters,
        };
      });
    },
    [applyRemote, backend],
  );

  const updateMaster = useCallback(async (id: string, patch: Partial<Master>) => {
    if (backend === "supabase") {
      const data = await postStore("updateMaster", { id, patch });
      applyRemote(data.state);
      return;
    }
    setState((s) => ({
      ...s,
      masters: s.masters.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, [applyRemote, backend]);

  const importGbpLocation = useCallback(async (loc: GoogleBusinessLocation, userId: string) => {
    if (backend === "supabase") {
      const data = await postStore<Master>("importGbpLocation", { loc });
      applyRemote(data.state);
      if (!data.result) throw new Error("Location was not imported");
      return data.result;
    }
    const existing = state.masters.find((m) => m.googlePlaceId === loc.placeId);
    if (existing) return existing;
    const master: Master = {
      id: uid("m"),
      slug: loc.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name: loc.name,
      studioName: loc.name,
      city: loc.city,
      country: loc.country,
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      bio: "Imported from your Google Business Profile. Add photos, services, and a bio.",
      services: ["natural-dreads", "braids"],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
          kind: "workspace",
          alt: loc.name,
        },
      ],
      claimed: true,
      claimedByUserId: userId,
      source: "gbp-sync",
      googlePlaceId: loc.placeId,
      hasShowcase: false,
      productIds: [],
    };
    setState((s) => ({ ...s, masters: [master, ...s.masters] }));
    return master;
  }, [applyRemote, backend, state.masters]);

  const upsertAd = useCallback(async (ad: Ad) => {
    if (backend === "supabase") {
      const data = await postStore("upsertAd", ad);
      applyRemote(data.state);
      return;
    }
    setState((s) => {
      const exists = s.ads.some((a) => a.id === ad.id);
      return {
        ...s,
        ads: exists ? s.ads.map((a) => (a.id === ad.id ? ad : a)) : [ad, ...s.ads],
      };
    });
  }, [applyRemote, backend]);

  const toggleShowcase = useCallback(async (masterId: string, enabled: boolean) => {
    if (backend === "supabase") {
      const data = await postStore("toggleShowcase", { masterId, enabled });
      applyRemote(data.state);
      return;
    }
    setState((s) => ({
      ...s,
      masters: s.masters.map((m) =>
        m.id === masterId ? { ...m, hasShowcase: enabled } : m,
      ),
    }));
  }, [applyRemote, backend]);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      backend,
      reset,
      track,
      discoverCity,
      addReview,
      verifyReview,
      reportReview,
      moderateReview,
      resolveReport,
      submitClaim,
      moderateClaim,
      updateMaster,
      importGbpLocation,
      upsertAd,
      toggleShowcase,
    }),
    [
      state,
      hydrated,
      backend,
      reset,
      track,
      discoverCity,
      addReview,
      verifyReview,
      reportReview,
      moderateReview,
      resolveReport,
      submitClaim,
      moderateClaim,
      updateMaster,
      importGbpLocation,
      upsertAd,
      toggleShowcase,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function averageScore(review: Review) {
  const vals = Object.values(review.scores);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function masterRating(reviews: Review[], masterId: string) {
  const published = reviews.filter(
    (r) => r.masterId === masterId && r.status === "published",
  );
  if (!published.length) return { avg: 0, count: 0 };
  const avg =
    published.reduce((sum, r) => sum + averageScore(r), 0) / published.length;
  return { avg, count: published.length };
}

export function serviceRating(reviews: Review[], masterId: string, serviceId: string) {
  const published = reviews.filter(
    (r) =>
      r.masterId === masterId &&
      r.serviceId === serviceId &&
      r.status === "published",
  );
  if (!published.length) return { avg: 0, count: 0 };
  const avg =
    published.reduce((sum, r) => sum + averageScore(r), 0) / published.length;
  return { avg, count: published.length };
}
