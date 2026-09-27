import assert from "node:assert/strict";
import {
  listingFromRegisteredUser,
  slugFromName,
  uniqueSlug,
} from "../src/lib/register-master";
import type { AuthUser } from "../src/lib/types";

assert.equal(slugFromName("Google Artist", "Berlin"), "google-artist-berlin");
assert.equal(uniqueSlug("studio", ["studio", "studio-2"]), "studio-3");
assert.equal(uniqueSlug("halo-loc", ["other"]), "halo-loc");

const user: AuthUser = {
  id: "user-new-master",
  email: "artist@example.com",
  name: "Google Artist",
  role: "master",
  provider: "google",
  googleLocations: [
    {
      placeId: "gbp-halo-berlin",
      name: "Halo Loc Studio",
      address: "Kastanienallee 12, 10435 Berlin",
      city: "Berlin",
      country: "Germany",
      lat: 52.5392,
      lng: 13.4094,
    },
  ],
};

const listing = listingFromRegisteredUser(user, ["google-artist-berlin"]);
assert.equal(listing.claimed, true);
assert.equal(listing.claimedByUserId, "user-new-master");
assert.equal(listing.source, "registered");
assert.equal(listing.name, "Google Artist");
assert.equal(listing.studioName, "Google Artist's studio");
assert.equal(listing.city, "Berlin");
assert.equal(listing.slug, "google-artist-berlin-2");
assert.equal(listing.email, "artist@example.com");
assert.ok(listing.services.includes("natural-dreads"));

const client: AuthUser = { ...user, role: "client", id: "user-client" };
const clientListing = listingFromRegisteredUser(client, []);
assert.equal(clientListing.claimedByUserId, "user-client");

const noPlace: AuthUser = {
  id: "user-plain-master",
  email: "plain@example.com",
  name: "Ada Locks",
  role: "master",
  provider: "demo",
};
const fallback = listingFromRegisteredUser(noPlace, []);
assert.equal(fallback.city, "Berlin");
assert.equal(fallback.slug, "ada-locks-berlin");
assert.equal(fallback.source, "registered");

console.log("register-master tests passed");
