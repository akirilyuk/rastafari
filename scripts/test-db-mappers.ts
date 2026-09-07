import assert from "node:assert/strict";
import {
  shopFromRow,
  shopToRow,
  reviewFromRow,
  reviewToRow,
  userFromRow,
  userToRow,
  productFromRow,
  productToRow,
  claimFromRow,
  stateFromRows,
  shopPatchToRow,
} from "../src/lib/db-mappers";
import type { Master, Review, AuthUser, Product } from "../src/lib/types";

const master: Master = {
  id: "m-nia",
  slug: "nia-roots-berlin",
  name: "Nia Roots",
  studioName: "Roots Atelier",
  city: "Berlin",
  country: "Germany",
  address: "Weserstraße 28",
  lat: 52.48,
  lng: 13.43,
  bio: "Natural loc specialist",
  services: ["natural-dreads"],
  photos: [{ url: "https://example.com/p.jpg", kind: "portrait", alt: "Nia" }],
  instagram: "niaroots.berlin",
  claimed: true,
  claimedByUserId: "user-master",
  source: "registered",
  hasShowcase: true,
  productIds: ["p-wax"],
};

const roundTripShop = shopFromRow(shopToRow(master));
assert.equal(roundTripShop.id, master.id);
assert.equal(roundTripShop.studioName, "Roots Atelier");
assert.equal(roundTripShop.claimedByUserId, "user-master");
assert.deepEqual(roundTripShop.services, ["natural-dreads"]);
assert.deepEqual(roundTripShop.photos, master.photos);

const patch = shopPatchToRow({ studioName: "New Studio", hasShowcase: false });
assert.equal(patch.studio_name, "New Studio");
assert.equal(patch.has_showcase, false);
assert.equal(patch.name, undefined);

const review: Review = {
  id: "r1",
  masterId: "m-nia",
  serviceId: "natural-dreads",
  authorName: "Mira K.",
  authorEmail: "mira@example.com",
  emailVerified: true,
  scores: { quality: 5 },
  comment: "Great",
  status: "published",
  createdAt: "2026-07-12T10:00:00.000Z",
  reportCount: 0,
};
const fromReview = reviewFromRow(reviewToRow(review));
assert.equal(fromReview.masterId, "m-nia");
assert.equal(fromReview.authorName, "Mira K.");
assert.equal(fromReview.status, "published");

const user: AuthUser = {
  id: "user-client",
  email: "client@rastafari.app",
  name: "Amina Client",
  role: "client",
  provider: "demo",
};
const persisted = userFromRow(userToRow(user));
assert.equal(persisted.id, user.id);
assert.equal(persisted.email, user.email);
assert.equal(persisted.role, "client");

const product: Product = {
  id: "p-wax",
  owner: "master",
  masterId: "m-nia",
  name: "Loc wax",
  description: "Light hold",
  price: 16,
  currency: "EUR",
  image: "https://example.com/w.jpg",
};
assert.equal(productFromRow(productToRow(product)).masterId, "m-nia");
assert.equal(productFromRow(productToRow(product)).price, 16);

const claim = claimFromRow({
  id: "cl-1",
  shop_id: "m-kira",
  user_id: "user-client",
  name: "Kira",
  email: "kira@example.com",
  instagram: "goldthread",
  message: "This is mine",
  status: "pending",
  created_at: "2026-09-07T00:00:00.000Z",
});
assert.equal(claim.masterId, "m-kira");
assert.equal(claim.userId, "user-client");

const state = stateFromRows({
  shops: [shopToRow(master)],
  reviews: [reviewToRow(review)],
  reports: [],
  claims: [],
  products: [productToRow(product)],
  courses: [],
  ads: [],
  events: [],
  cities: [{ city: "Berlin" }],
});
assert.equal(state.masters[0].studioName, "Roots Atelier");
assert.equal(state.reviews[0].masterId, "m-nia");
assert.equal(state.discoveredCities[0], "Berlin");

console.log("db-mappers tests passed");
