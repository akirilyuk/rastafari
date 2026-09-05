export type UserRole = "client" | "master" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  provider: "demo" | "google";
  picture?: string;
  googleLocations?: GoogleBusinessLocation[];
};

export type GoogleBusinessLocation = {
  placeId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  importedMasterId?: string;
};

export type ServiceCategory = "locs" | "braids" | "beauty";

export type ServiceTag = {
  id: string;
  name: string;
  category: ServiceCategory;
};

export type ReviewCriterion = {
  id: string;
  name: string;
  hint: string;
};

export type PhotoKind = "portrait" | "workspace" | "work";

export type Photo = {
  url: string;
  kind: PhotoKind;
  alt: string;
};

export type MasterSource = "registered" | "google-import" | "gbp-sync";

export type Product = {
  id: string;
  owner: "platform" | "master";
  masterId?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  url?: string;
  featured?: boolean;
};

export type Course = {
  id: string;
  title: string;
  teacher: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  hostedHere: boolean;
  url: string;
  sponsored: boolean;
  platformOwned: boolean;
};

export type Master = {
  id: string;
  slug: string;
  name: string;
  studioName: string;
  city: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  bio: string;
  services: string[];
  photos: Photo[];
  instagram?: string;
  website?: string;
  claimed: boolean;
  claimedByUserId?: string;
  source: MasterSource;
  googlePlaceId?: string;
  hasShowcase: boolean;
  productIds: string[];
  phone?: string;
  email?: string;
};

export type ReviewStatus = "pending_email" | "published" | "hidden";

export type Review = {
  id: string;
  masterId: string;
  serviceId: string;
  authorName: string;
  authorEmail: string;
  emailVerified: boolean;
  verifyToken?: string;
  scores: Record<string, number>;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  reportCount: number;
};

export type ReviewReport = {
  id: string;
  reviewId: string;
  reason: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
};

export type ClaimStatus = "pending" | "approved" | "rejected";

export type Claim = {
  id: string;
  masterId: string;
  name: string;
  email: string;
  instagram: string;
  message: string;
  status: ClaimStatus;
  createdAt: string;
};

export type Ad = {
  id: string;
  title: string;
  body: string;
  href: string;
  placement: "home" | "learn" | "shop" | "master";
  active: boolean;
};

export type AnalyticsEvent = {
  id: string;
  name:
    | "page_view"
    | "search"
    | "master_click"
    | "review_submit"
    | "course_click"
    | "product_click"
    | "claim_submit";
  source: string;
  path: string;
  meta?: string;
  createdAt: string;
};

export type AppState = {
  masters: Master[];
  reviews: Review[];
  reports: ReviewReport[];
  claims: Claim[];
  products: Product[];
  courses: Course[];
  ads: Ad[];
  events: AnalyticsEvent[];
  discoveredCities: string[];
};

export type GeoPoint = {
  label: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
};
