import { NextResponse } from "next/server";
import {
  addReview,
  discoverCity,
  importGbpLocation,
  isSupabaseConfigured,
  loadAppState,
  moderateClaim,
  moderateReview,
  reportReview,
  resetDatabase,
  resolveReport,
  seedIfEmpty,
  submitClaim,
  toggleShowcase,
  trackEvent,
  updateMaster,
  upsertAd,
  verifyReview,
  getShop,
} from "@/lib/db";
import { getSession } from "@/lib/session";
import type { Ad, Claim, GoogleBusinessLocation, Master, Review, ReviewReport } from "@/lib/types";

export const dynamic = "force-dynamic";

async function load() {
  await seedIfEmpty();
  return loadAppState();
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ backend: "local" as const });
  }
  try {
    const state = await load();
    return NextResponse.json({ backend: "supabase" as const, state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase query failed";
    return NextResponse.json(
      {
        backend: "supabase" as const,
        error: message,
        hint: "Apply supabase/schema.sql in the Supabase SQL editor, then restart the app.",
      },
      { status: 500 },
    );
  }
}

type StoreBody =
  | { action: "addReview"; payload: Omit<Review, "id" | "createdAt" | "reportCount" | "status"> }
  | { action: "verifyReview"; payload: { token: string } }
  | { action: "reportReview"; payload: { reviewId: string; reason: string; details: string } }
  | { action: "moderateReview"; payload: { reviewId: string; status: Review["status"] } }
  | { action: "resolveReport"; payload: { reportId: string; status: ReviewReport["status"] } }
  | { action: "submitClaim"; payload: Omit<Claim, "id" | "createdAt" | "status"> }
  | { action: "moderateClaim"; payload: { claimId: string; status: Claim["status"]; userId?: string } }
  | { action: "updateMaster"; payload: { id: string; patch: Partial<Master> } }
  | { action: "toggleShowcase"; payload: { masterId: string; enabled: boolean } }
  | { action: "importGbpLocation"; payload: { loc: GoogleBusinessLocation } }
  | { action: "discoverCity"; payload: { city: string } }
  | { action: "upsertAd"; payload: Ad }
  | { action: "track"; payload: Parameters<typeof trackEvent>[0] }
  | { action: "reset" };

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ backend: "local" as const, error: "Supabase is not configured" }, { status: 400 });
  }

  let body: StoreBody;
  try {
    body = (await req.json()) as StoreBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const session = await getSession();

  try {
    await seedIfEmpty();
    let result: unknown = null;
    let reload = true;

    switch (body.action) {
      case "addReview":
        result = await addReview(body.payload, session?.id);
        break;
      case "verifyReview":
        result = await verifyReview(body.payload.token);
        break;
      case "reportReview":
        result = await reportReview(
          body.payload.reviewId,
          body.payload.reason,
          body.payload.details,
        );
        break;
      case "moderateReview": {
        const admin = requireAdmin(session);
        if (admin) return admin;
        await moderateReview(body.payload.reviewId, body.payload.status);
        break;
      }
      case "resolveReport": {
        const admin = requireAdmin(session);
        if (admin) return admin;
        await resolveReport(body.payload.reportId, body.payload.status);
        break;
      }
      case "submitClaim":
        result = await submitClaim(body.payload, session?.id);
        break;
      case "moderateClaim": {
        const admin = requireAdmin(session);
        if (admin) return admin;
        await moderateClaim(body.payload.claimId, body.payload.status, body.payload.userId);
        break;
      }
      case "updateMaster": {
        const denied = await requireShopEditor(session, body.payload.id);
        if (denied) return denied;
        await updateMaster(body.payload.id, body.payload.patch);
        break;
      }
      case "toggleShowcase": {
        const denied = await requireShopEditor(session, body.payload.masterId);
        if (denied) return denied;
        await toggleShowcase(body.payload.masterId, body.payload.enabled);
        break;
      }
      case "importGbpLocation": {
        if (!session) {
          return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }
        result = await importGbpLocation(body.payload.loc, session.id);
        break;
      }
      case "discoverCity":
        result = await discoverCity(body.payload.city);
        break;
      case "upsertAd": {
        const admin = requireAdmin(session);
        if (admin) return admin;
        await upsertAd(body.payload);
        break;
      }
      case "track":
        await trackEvent(body.payload);
        reload = false;
        break;
      case "reset": {
        const admin = requireAdmin(session);
        if (admin) return admin;
        const state = await resetDatabase();
        return NextResponse.json({ backend: "supabase" as const, state, result: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const state = reload ? await loadAppState() : undefined;
    return NextResponse.json({ backend: "supabase" as const, state, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function requireAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  return null;
}

async function requireShopEditor(
  session: Awaited<ReturnType<typeof getSession>>,
  shopId: string,
) {
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (session.role === "admin") return null;
  const shop = await getShop(shopId);
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  if (shop.claimedByUserId !== session.id) {
    return NextResponse.json({ error: "You do not own this studio" }, { status: 403 });
  }
  return null;
}
