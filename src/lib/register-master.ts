import { DEFAULT_LOCATION } from "./geo";
import type { AuthUser, Master } from "./types";
import { uid } from "./uid";

const DEFAULT_STUDIO_PHOTO =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80";

export function slugFromName(name: string, city?: string) {
  const raw = [name, city].filter(Boolean).join(" ");
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "studio";
}

export function uniqueSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  const root = base || "studio";
  if (!used.has(root)) return root;
  let i = 2;
  while (used.has(`${root}-${i}`)) i += 1;
  return `${root}-${i}`;
}

export function listingFromRegisteredUser(user: AuthUser, takenSlugs: Iterable<string>): Master {
  const loc = user.googleLocations?.[0];
  const city = loc?.city ?? DEFAULT_LOCATION.city;
  const country = loc?.country ?? DEFAULT_LOCATION.country;
  const studioName = `${user.name}'s studio`;
  return {
    id: uid("m"),
    slug: uniqueSlug(slugFromName(user.name, city), takenSlugs),
    name: user.name,
    studioName,
    city,
    country,
    address: loc?.address ?? city,
    lat: loc?.lat ?? DEFAULT_LOCATION.lat,
    lng: loc?.lng ?? DEFAULT_LOCATION.lng,
    bio: "New Rastafari listing. Add photos, services, and a bio so clients can find you.",
    services: ["natural-dreads", "braids", "cornrows"],
    photos: [
      {
        url: DEFAULT_STUDIO_PHOTO,
        kind: "workspace",
        alt: `${studioName} studio`,
      },
    ],
    claimed: true,
    claimedByUserId: user.id,
    source: "registered",
    hasShowcase: false,
    productIds: [],
    email: user.email,
  };
}
