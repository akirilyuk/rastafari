import type {
  Ad,
  AnalyticsEvent,
  AppState,
  AuthUser,
  Claim,
  Course,
  Master,
  Product,
  Review,
  ReviewReport,
} from "./types";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role: AuthUser["role"];
  provider: AuthUser["provider"];
  picture: string | null;
  google_locations: AuthUser["googleLocations"];
};

export type ShopRow = {
  id: string;
  slug: string;
  name: string;
  studio_name: string;
  city: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  bio: string;
  services: string[] | null;
  photos: Master["photos"] | null;
  instagram: string | null;
  website: string | null;
  claimed: boolean;
  claimed_by_user_id: string | null;
  source: Master["source"];
  google_place_id: string | null;
  has_showcase: boolean;
  product_ids: string[] | null;
  phone: string | null;
  email: string | null;
};

export type ReviewRow = {
  id: string;
  shop_id: string;
  service_id: string;
  author_name: string;
  author_email: string;
  author_user_id: string | null;
  email_verified: boolean;
  verify_token: string | null;
  scores: Record<string, number> | null;
  comment: string;
  status: Review["status"];
  report_count: number;
  created_at: string;
};

export type ReportRow = {
  id: string;
  review_id: string;
  reason: string;
  details: string;
  status: ReviewReport["status"];
  created_at: string;
};

export type ClaimRow = {
  id: string;
  shop_id: string;
  user_id: string | null;
  name: string;
  email: string;
  instagram: string;
  message: string;
  status: Claim["status"];
  created_at: string;
};

export type ProductRow = {
  id: string;
  owner: Product["owner"];
  shop_id: string | null;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  url: string | null;
  featured: boolean | null;
};

export type CourseRow = {
  id: string;
  title: string;
  teacher: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  hosted_here: boolean;
  url: string;
  sponsored: boolean;
  platform_owned: boolean;
};

export type AdRow = {
  id: string;
  title: string;
  body: string;
  href: string;
  placement: Ad["placement"];
  active: boolean;
};

export type EventRow = {
  id: string;
  name: AnalyticsEvent["name"];
  source: string;
  path: string;
  meta: string | null;
  created_at: string;
};

export type CityRow = {
  city: string;
};

export function userFromRow(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    provider: row.provider,
    picture: row.picture ?? undefined,
    googleLocations: row.google_locations?.length ? row.google_locations : undefined,
  };
}

export function userToRow(user: AuthUser): UserRow {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    provider: user.provider,
    picture: user.picture ?? null,
    google_locations: user.googleLocations ?? [],
  };
}

export function shopFromRow(row: ShopRow): Master {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    studioName: row.studio_name,
    city: row.city,
    country: row.country,
    address: row.address,
    lat: Number(row.lat),
    lng: Number(row.lng),
    bio: row.bio,
    services: row.services ?? [],
    photos: row.photos ?? [],
    instagram: row.instagram ?? undefined,
    website: row.website ?? undefined,
    claimed: row.claimed,
    claimedByUserId: row.claimed_by_user_id ?? undefined,
    source: row.source,
    googlePlaceId: row.google_place_id ?? undefined,
    hasShowcase: row.has_showcase,
    productIds: row.product_ids ?? [],
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
  };
}

export function shopToRow(master: Master): ShopRow {
  return {
    id: master.id,
    slug: master.slug,
    name: master.name,
    studio_name: master.studioName,
    city: master.city,
    country: master.country,
    address: master.address,
    lat: master.lat,
    lng: master.lng,
    bio: master.bio,
    services: master.services,
    photos: master.photos,
    instagram: master.instagram ?? null,
    website: master.website ?? null,
    claimed: master.claimed,
    claimed_by_user_id: master.claimedByUserId ?? null,
    source: master.source,
    google_place_id: master.googlePlaceId ?? null,
    has_showcase: master.hasShowcase,
    product_ids: master.productIds,
    phone: master.phone ?? null,
    email: master.email ?? null,
  };
}

export function shopPatchToRow(patch: Partial<Master>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.studioName !== undefined) row.studio_name = patch.studioName;
  if (patch.city !== undefined) row.city = patch.city;
  if (patch.country !== undefined) row.country = patch.country;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.lat !== undefined) row.lat = patch.lat;
  if (patch.lng !== undefined) row.lng = patch.lng;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.services !== undefined) row.services = patch.services;
  if (patch.photos !== undefined) row.photos = patch.photos;
  if (patch.instagram !== undefined) row.instagram = patch.instagram || null;
  if (patch.website !== undefined) row.website = patch.website || null;
  if (patch.claimed !== undefined) row.claimed = patch.claimed;
  if (patch.claimedByUserId !== undefined) row.claimed_by_user_id = patch.claimedByUserId ?? null;
  if (patch.source !== undefined) row.source = patch.source;
  if (patch.googlePlaceId !== undefined) row.google_place_id = patch.googlePlaceId ?? null;
  if (patch.hasShowcase !== undefined) row.has_showcase = patch.hasShowcase;
  if (patch.productIds !== undefined) row.product_ids = patch.productIds;
  if (patch.phone !== undefined) row.phone = patch.phone ?? null;
  if (patch.email !== undefined) row.email = patch.email ?? null;
  return row;
}

export function reviewFromRow(row: ReviewRow): Review {
  return {
    id: row.id,
    masterId: row.shop_id,
    serviceId: row.service_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    emailVerified: row.email_verified,
    verifyToken: row.verify_token ?? undefined,
    scores: row.scores ?? {},
    comment: row.comment,
    status: row.status,
    createdAt: row.created_at,
    reportCount: row.report_count,
  };
}

export function reviewToRow(review: Review, authorUserId?: string | null): ReviewRow {
  return {
    id: review.id,
    shop_id: review.masterId,
    service_id: review.serviceId,
    author_name: review.authorName,
    author_email: review.authorEmail,
    author_user_id: authorUserId ?? null,
    email_verified: review.emailVerified,
    verify_token: review.verifyToken ?? null,
    scores: review.scores,
    comment: review.comment,
    status: review.status,
    report_count: review.reportCount,
    created_at: review.createdAt,
  };
}

export function reportFromRow(row: ReportRow): ReviewReport {
  return {
    id: row.id,
    reviewId: row.review_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function claimFromRow(row: ClaimRow): Claim {
  return {
    id: row.id,
    masterId: row.shop_id,
    name: row.name,
    email: row.email,
    instagram: row.instagram,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    userId: row.user_id ?? undefined,
  };
}

export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    owner: row.owner,
    masterId: row.shop_id ?? undefined,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    image: row.image,
    url: row.url ?? undefined,
    featured: row.featured ?? undefined,
  };
}

export function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    owner: product.owner,
    shop_id: product.masterId ?? null,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    image: product.image,
    url: product.url ?? null,
    featured: product.featured ?? false,
  };
}

export function courseFromRow(row: CourseRow): Course {
  return {
    id: row.id,
    title: row.title,
    teacher: row.teacher,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    image: row.image,
    hostedHere: row.hosted_here,
    url: row.url,
    sponsored: row.sponsored,
    platformOwned: row.platform_owned,
  };
}

export function courseToRow(course: Course): CourseRow {
  return {
    id: course.id,
    title: course.title,
    teacher: course.teacher,
    description: course.description,
    price: course.price,
    currency: course.currency,
    image: course.image,
    hosted_here: course.hostedHere,
    url: course.url,
    sponsored: course.sponsored,
    platform_owned: course.platformOwned,
  };
}

export function adFromRow(row: AdRow): Ad {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    href: row.href,
    placement: row.placement,
    active: row.active,
  };
}

export function eventFromRow(row: EventRow): AnalyticsEvent {
  return {
    id: row.id,
    name: row.name,
    source: row.source,
    path: row.path,
    meta: row.meta ?? undefined,
    createdAt: row.created_at,
  };
}

export function stateFromRows(input: {
  shops: ShopRow[];
  reviews: ReviewRow[];
  reports: ReportRow[];
  claims: ClaimRow[];
  products: ProductRow[];
  courses: CourseRow[];
  ads: AdRow[];
  events: EventRow[];
  cities: CityRow[];
}): AppState {
  return {
    masters: input.shops.map(shopFromRow),
    reviews: input.reviews.map(reviewFromRow),
    reports: input.reports.map(reportFromRow),
    claims: input.claims.map(claimFromRow),
    products: input.products.map(productFromRow),
    courses: input.courses.map(courseFromRow),
    ads: input.ads.map(adFromRow),
    events: input.events.map(eventFromRow),
    discoveredCities: input.cities.map((c) => c.city),
  };
}
