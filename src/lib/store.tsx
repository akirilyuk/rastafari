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

const STORAGE_KEY = "rastafari-db-v1";

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
  reset: () => void;
  track: (event: Omit<AnalyticsEvent, "id" | "createdAt">) => void;
  discoverCity: (city: string) => Master[];
  addReview: (review: Omit<Review, "id" | "createdAt" | "reportCount" | "status">) => Review;
  verifyReview: (token: string) => Review | null;
  reportReview: (reviewId: string, reason: string, details: string) => void;
  moderateReview: (reviewId: string, status: Review["status"]) => void;
  resolveReport: (reportId: string, status: ReviewReport["status"]) => void;
  submitClaim: (claim: Omit<Claim, "id" | "createdAt" | "status">) => Claim;
  moderateClaim: (claimId: string, status: Claim["status"], userId?: string) => void;
  updateMaster: (id: string, patch: Partial<Master>) => void;
  importGbpLocation: (loc: GoogleBusinessLocation, userId: string) => Master;
  upsertAd: (ad: Ad) => void;
  toggleShowcase: (masterId: string, enabled: boolean) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as AppState);
    } catch {
      /* keep seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const reset = useCallback(() => {
    const next = createInitialState();
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

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
  }, []);

  const discoverCity = useCallback((city: string) => {
    const key = city.trim().toLowerCase();
    const already = state.discoveredCities.map((c) => c.toLowerCase()).includes(key);
    if (already) return [];
    const imported = DISCOVERY_POOL.filter(
      (m) =>
        m.city.toLowerCase() === key && !state.masters.some((x) => x.id === m.id),
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
  }, [state.discoveredCities, state.masters]);

  const addReview = useCallback(
    (review: Omit<Review, "id" | "createdAt" | "reportCount" | "status">) => {
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
    [],
  );

  const verifyReview = useCallback((token: string) => {
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
  }, []);

  const reportReview = useCallback((reviewId: string, reason: string, details: string) => {
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
  }, []);

  const moderateReview = useCallback((reviewId: string, status: Review["status"]) => {
    setState((s) => ({
      ...s,
      reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, status } : r)),
    }));
  }, []);

  const resolveReport = useCallback((reportId: string, status: ReviewReport["status"]) => {
    setState((s) => ({
      ...s,
      reports: s.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
    }));
  }, []);

  const submitClaim = useCallback((claim: Omit<Claim, "id" | "createdAt" | "status">) => {
    const next: Claim = {
      ...claim,
      id: uid("cl"),
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setState((s) => ({ ...s, claims: [next, ...s.claims] }));
    return next;
  }, []);

  const moderateClaim = useCallback(
    (claimId: string, status: Claim["status"], userId?: string) => {
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
                        claimedByUserId: userId ?? m.claimedByUserId,
                        source: m.source === "google-import" ? "registered" : m.source,
                      }
                    : m,
                )
              : s.masters,
        };
      });
    },
    [],
  );

  const updateMaster = useCallback((id: string, patch: Partial<Master>) => {
    setState((s) => ({
      ...s,
      masters: s.masters.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const importGbpLocation = useCallback((loc: GoogleBusinessLocation, userId: string) => {
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
  }, [state.masters]);

  const upsertAd = useCallback((ad: Ad) => {
    setState((s) => {
      const exists = s.ads.some((a) => a.id === ad.id);
      return {
        ...s,
        ads: exists ? s.ads.map((a) => (a.id === ad.id ? ad : a)) : [ad, ...s.ads],
      };
    });
  }, []);

  const toggleShowcase = useCallback((masterId: string, enabled: boolean) => {
    setState((s) => ({
      ...s,
      masters: s.masters.map((m) =>
        m.id === masterId ? { ...m, hasShowcase: enabled } : m,
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      hydrated,
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
