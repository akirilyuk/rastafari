import "server-only";
import { DEMO_ACCOUNTS } from "./catalog";
import {
  claimFromRow,
  courseToRow,
  productToRow,
  reviewFromRow,
  reviewToRow,
  shopFromRow,
  shopPatchToRow,
  shopToRow,
  stateFromRows,
  userFromRow,
  userToRow,
  type AdRow,
  type CityRow,
  type ClaimRow,
  type CourseRow,
  type EventRow,
  type ProductRow,
  type ReportRow,
  type ReviewRow,
  type ShopRow,
  type UserRow,
} from "./db-mappers";
import { DISCOVERY_POOL, createInitialState } from "./seed";
import { getServiceClient, isSupabaseConfigured } from "./supabase";
import type {
  Ad,
  AnalyticsEvent,
  AppState,
  AuthUser,
  Claim,
  GoogleBusinessLocation,
  Master,
  Review,
  ReviewReport,
} from "./types";
import { uid } from "./uid";

export { isSupabaseConfigured };

type QueryError = { message: string } | null;

function unwrap<T>(result: { data: T | null; error: QueryError }, context: string): T {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data as T;
}

export async function upsertUser(user: AuthUser) {
  if (!isSupabaseConfigured()) return;
  const db = getServiceClient();
  unwrap(
    await db.from("users").upsert(userToRow(user), { onConflict: "id" }),
    "upsert user",
  );
}

export async function loadAppState(): Promise<AppState> {
  const db = getServiceClient();
  const [
    shops,
    reviews,
    reports,
    claims,
    products,
    courses,
    ads,
    events,
    cities,
  ] = await Promise.all([
    db.from("shops").select("*").order("created_at", { ascending: true }),
    db.from("reviews").select("*").order("created_at", { ascending: false }),
    db.from("review_reports").select("*").order("created_at", { ascending: false }),
    db.from("claims").select("*").order("created_at", { ascending: false }),
    db.from("products").select("*"),
    db.from("courses").select("*"),
    db.from("ads").select("*"),
    db
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(400),
    db.from("discovered_cities").select("city"),
  ]);

  return stateFromRows({
    shops: unwrap(shops, "load shops") as ShopRow[],
    reviews: unwrap(reviews, "load reviews") as ReviewRow[],
    reports: unwrap(reports, "load reports") as ReportRow[],
    claims: unwrap(claims, "load claims") as ClaimRow[],
    products: unwrap(products, "load products") as ProductRow[],
    courses: unwrap(courses, "load courses") as CourseRow[],
    ads: unwrap(ads, "load ads") as AdRow[],
    events: unwrap(events, "load events") as EventRow[],
    cities: unwrap(cities, "load cities") as CityRow[],
  });
}

export async function seedIfEmpty() {
  const db = getServiceClient();
  const { count: shopCount, error } = await db
    .from("shops")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(`count shops: ${error.message}`);
  if ((shopCount ?? 0) > 0) return { seeded: false };

  await insertSeed(createInitialState());
  return { seeded: true };
}

async function insertSeed(state: AppState) {
  const db = getServiceClient();
  const users = DEMO_ACCOUNTS.map((account) => userToRow(account));
  unwrap(await db.from("users").upsert(users, { onConflict: "id" }), "seed users");
  unwrap(
    await db.from("shops").insert(state.masters.map(shopToRow)),
    "seed shops",
  );
  unwrap(
    await db.from("products").insert(state.products.map(productToRow)),
    "seed products",
  );
  unwrap(
    await db.from("courses").insert(state.courses.map(courseToRow)),
    "seed courses",
  );
  unwrap(await db.from("ads").insert(state.ads), "seed ads");
  unwrap(
    await db.from("reviews").insert(state.reviews.map((r) => reviewToRow(r))),
    "seed reviews",
  );
}

export async function resetDatabase() {
  const db = getServiceClient();
  const { error } = await db.rpc("clear_app_data");
  if (error) throw new Error(`reset database: ${error.message}`);
  await insertSeed(createInitialState());
  return loadAppState();
}

export async function addReview(
  input: Omit<Review, "id" | "createdAt" | "reportCount" | "status">,
  authorUserId?: string,
) {
  const db = getServiceClient();
  const review: Review = {
    ...input,
    id: uid("rev"),
    createdAt: new Date().toISOString(),
    reportCount: 0,
    status: "pending_email",
  };
  unwrap(
    await db.from("reviews").insert(reviewToRow(review, authorUserId)),
    "add review",
  );
  return review;
}

export async function verifyReview(token: string) {
  const db = getServiceClient();
  const { data, error } = await db
    .from("reviews")
    .select("*")
    .eq("verify_token", token)
    .maybeSingle();
  if (error) throw new Error(`verify review: ${error.message}`);
  if (!data) return null;
  const current = reviewFromRow(data as ReviewRow);
  const found: Review = { ...current, emailVerified: true, status: "published" };
  unwrap(
    await db
      .from("reviews")
      .update({ email_verified: true, status: "published" })
      .eq("id", found.id),
    "publish review",
  );
  return found;
}

export async function reportReview(reviewId: string, reason: string, details: string) {
  const db = getServiceClient();
  const report: ReviewReport = {
    id: uid("rep"),
    reviewId,
    reason,
    details,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  unwrap(
    await db.from("review_reports").insert({
      id: report.id,
      review_id: reviewId,
      reason,
      details,
      status: "open",
    }),
    "add report",
  );
  const { data, error } = await db
    .from("reviews")
    .select("report_count")
    .eq("id", reviewId)
    .maybeSingle();
  if (error) throw new Error(`load report count: ${error.message}`);
  const count = Number((data as { report_count?: number } | null)?.report_count ?? 0);
  unwrap(
    await db.from("reviews").update({ report_count: count + 1 }).eq("id", reviewId),
    "increment report count",
  );
  return report;
}

export async function moderateReview(reviewId: string, status: Review["status"]) {
  const db = getServiceClient();
  unwrap(
    await db.from("reviews").update({ status }).eq("id", reviewId),
    "moderate review",
  );
}

export async function resolveReport(reportId: string, status: ReviewReport["status"]) {
  const db = getServiceClient();
  unwrap(
    await db.from("review_reports").update({ status }).eq("id", reportId),
    "resolve report",
  );
}

export async function submitClaim(
  input: Omit<Claim, "id" | "createdAt" | "status">,
  userId?: string,
) {
  const db = getServiceClient();
  const claim: Claim = {
    ...input,
    id: uid("cl"),
    createdAt: new Date().toISOString(),
    status: "pending",
    userId,
  };
  unwrap(
    await db.from("claims").insert({
      id: claim.id,
      shop_id: claim.masterId,
      user_id: userId ?? null,
      name: claim.name,
      email: claim.email,
      instagram: claim.instagram,
      message: claim.message,
      status: claim.status,
    }),
    "submit claim",
  );
  return claim;
}

export async function moderateClaim(
  claimId: string,
  status: Claim["status"],
  userId?: string,
) {
  const db = getServiceClient();
  const { data, error } = await db.from("claims").select("*").eq("id", claimId).maybeSingle();
  if (error) throw new Error(`load claim: ${error.message}`);
  if (!data) throw new Error("Claim not found");
  const claim = claimFromRow(data as ClaimRow);
  unwrap(await db.from("claims").update({ status }).eq("id", claimId), "update claim");
  if (status === "approved") {
    const ownerId = userId ?? claim.userId ?? null;
    const { data: shop, error: shopError } = await db
      .from("shops")
      .select("source")
      .eq("id", claim.masterId)
      .maybeSingle();
    if (shopError) throw new Error(`load shop: ${shopError.message}`);
    const source =
      (shop as { source?: Master["source"] } | null)?.source === "google-import"
        ? "registered"
        : (shop as { source?: Master["source"] } | null)?.source;
    unwrap(
      await db
        .from("shops")
        .update({
          claimed: true,
          claimed_by_user_id: ownerId,
          ...(source ? { source } : {}),
        })
        .eq("id", claim.masterId),
      "approve claim shop",
    );
  }
}

export async function updateMaster(id: string, patch: Partial<Master>) {
  const db = getServiceClient();
  const row = shopPatchToRow(patch);
  if (Object.keys(row).length === 0) return;
  unwrap(await db.from("shops").update(row).eq("id", id), "update shop");
}

export async function toggleShowcase(masterId: string, enabled: boolean) {
  await updateMaster(masterId, { hasShowcase: enabled });
}

export async function getShop(id: string) {
  const db = getServiceClient();
  const { data, error } = await db.from("shops").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`load shop: ${error.message}`);
  return data ? shopFromRow(data as ShopRow) : null;
}

export async function importGbpLocation(loc: GoogleBusinessLocation, userId: string) {
  const db = getServiceClient();
  const { data: existing, error } = await db
    .from("shops")
    .select("*")
    .eq("google_place_id", loc.placeId)
    .maybeSingle();
  if (error) throw new Error(`find gbp shop: ${error.message}`);
  if (existing) return shopFromRow(existing as ShopRow);

  const baseSlug = loc.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "studio";
  let slug = baseSlug;
  for (let i = 0; i < 8; i++) {
    const { data: clash } = await db.from("shops").select("id").eq("slug", slug).maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${uid("s")}`;
  }

  const master: Master = {
    id: uid("m"),
    slug,
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
  unwrap(await db.from("shops").insert(shopToRow(master)), "import gbp shop");
  return master;
}

export async function discoverCity(city: string) {
  const db = getServiceClient();
  const key = city.trim();
  if (!key) return [] as Master[];

  const { data: already, error: cityError } = await db
    .from("discovered_cities")
    .select("city")
    .ilike("city", key)
    .maybeSingle();
  if (cityError) throw new Error(`check city: ${cityError.message}`);
  if (already) return [];

  const { data: shops, error: shopsError } = await db.from("shops").select("id");
  if (shopsError) throw new Error(`list shops: ${shopsError.message}`);
  const ids = new Set((shops as { id: string }[] | null)?.map((s) => s.id) ?? []);
  const extra = DISCOVERY_POOL.filter(
    (m) => m.city.toLowerCase() === key.toLowerCase() && !ids.has(m.id),
  );
  if (extra.length) {
    unwrap(await db.from("shops").insert(extra.map(shopToRow)), "discover shops");
  }
  unwrap(
    await db.from("discovered_cities").upsert({ city: key }, { onConflict: "city" }),
    "record city",
  );
  return extra;
}

export async function upsertAd(ad: Ad) {
  const db = getServiceClient();
  unwrap(await db.from("ads").upsert(ad, { onConflict: "id" }), "upsert ad");
}

export async function trackEvent(event: Omit<AnalyticsEvent, "id" | "createdAt">) {
  const db = getServiceClient();
  const row = {
    id: uid("ev"),
    name: event.name,
    source: event.source,
    path: event.path,
    meta: event.meta ?? null,
  };
  unwrap(await db.from("analytics_events").insert(row), "track event");
}

export async function getUserById(id: string) {
  const db = getServiceClient();
  const { data, error } = await db.from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`load user: ${error.message}`);
  return data ? userFromRow(data as UserRow) : null;
}
