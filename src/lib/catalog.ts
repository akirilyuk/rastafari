import type { ReviewCriterion, ServiceTag } from "./types";

export const SERVICES: ServiceTag[] = [
  { id: "natural-dreads", name: "Natural dreadlocks", category: "locs" },
  { id: "synthetic-dreads", name: "Synthetic dreadlocks", category: "locs" },
  { id: "dread-maintenance", name: "Dreadlock maintenance", category: "locs" },
  { id: "sisterlocks", name: "Sisterlocks / microlocs", category: "locs" },
  { id: "starter-locs", name: "Starter locs", category: "locs" },
  { id: "kosy", name: "Kosy", category: "braids" },
  { id: "braids", name: "Braids", category: "braids" },
  { id: "boxer-braids", name: "Boxer braids", category: "braids" },
  { id: "boho-braids", name: "Boho braids", category: "braids" },
  { id: "cornrows", name: "Cornrows", category: "braids" },
  { id: "fulani", name: "Fulani braids", category: "braids" },
  { id: "knotless", name: "Knotless braids", category: "braids" },
  { id: "twists", name: "Twists", category: "braids" },
  { id: "nails", name: "Nails", category: "beauty" },
  { id: "lashes", name: "Lashes", category: "beauty" },
];

export const REVIEW_CRITERIA: ReviewCriterion[] = [
  {
    id: "quality",
    name: "Quality of work",
    hint: "How well was the style executed?",
  },
  {
    id: "reference",
    name: "Match to reference",
    hint: "Did the result match what you asked for?",
  },
  {
    id: "comfort",
    name: "Client comfort",
    hint: "How comfortable was the session?",
  },
  {
    id: "punctuality",
    name: "Punctuality",
    hint: "Did they start and finish on time?",
  },
  {
    id: "communication",
    name: "Communication",
    hint: "Were they clear before and during the appointment?",
  },
  {
    id: "value",
    name: "Price / quality",
    hint: "Was it worth what you paid?",
  },
  {
    id: "reliability",
    name: "Reliability",
    hint: "Would you trust them again?",
  },
];

export const OTHER_SERVICE = {
  id: "other",
  name: "Other",
  category: "braids" as const,
};

export function serviceById(id: string) {
  if (id === OTHER_SERVICE.id) return OTHER_SERVICE;
  return SERVICES.find((s) => s.id === id);
}

export const CITIES: { city: string; country: string; lat: number; lng: number }[] =
  [
    { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
    { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
    { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
    { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
    { city: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
    { city: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
    { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
    { city: "Saint Petersburg", country: "Russia", lat: 59.9311, lng: 30.3609 },
    { city: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122 },
    { city: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686 },
    { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
    { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
    { city: "Kingston", country: "Jamaica", lat: 18.0179, lng: -76.8099 },
    { city: "Prague", country: "Czechia", lat: 50.0755, lng: 14.4378 },
    { city: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  ];

export const DEMO_ACCOUNTS = [
  {
    id: "user-client",
    email: "client@rastafari.app",
    name: "Amina Client",
    role: "client" as const,
    provider: "demo" as const,
  },
  {
    id: "user-master",
    email: "master@rastafari.app",
    name: "Nia Roots",
    role: "master" as const,
    provider: "demo" as const,
  },
  {
    id: "user-admin",
    email: "admin@rastafari.app",
    name: "Alexander Admin",
    role: "admin" as const,
    provider: "demo" as const,
  },
];

export const MOCK_GOOGLE_LOCATIONS = [
  {
    placeId: "gbp-halo-berlin",
    name: "Halo Loc Studio",
    address: "Kastanienallee 12, 10435 Berlin",
    city: "Berlin",
    country: "Germany",
    lat: 52.5392,
    lng: 13.4094,
  },
  {
    placeId: "gbp-crown-berlin",
    name: "Crown & Coil",
    address: "Oranienstraße 45, 10969 Berlin",
    city: "Berlin",
    country: "Germany",
    lat: 52.5021,
    lng: 13.4188,
  },
];
