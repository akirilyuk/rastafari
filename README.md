# Rastafari

Find loc, dreadlock, kosy, and braid artists near you. Next.js web app (responsive, so it works as the mobile surface too) with three roles: **clients**, **artists**, and **admin**.

This session started as a new project. If you already opened `akirilyuk/rastafari` on GitHub but cannot pick it here, use the **Create repo** control in this chat to attach the work. After that exists, you can push or transfer to `akirilyuk/rastafari`.

## Translated product spec (from the original Russian thread)

You open the app, turn on location or type a place, and it shows the nearest artist. Filters are tags you can combine: natural dreadlocks, synthetic dreadlocks, kosy, braids — later nails, lashes, and other beauty work.

Each artist or studio has a card they fill themselves (workspace photos, work examples), in the spirit of Google Maps or a profile deck. A paid **showcase** can sit on the card for aftercare and related products they sell.

A separate track is **online education**: advertise the host’s own courses and hair products, and sell sponsored slots for other teachers. v1 is a storefront that links out. A full in-app school can come later.

Sides of the product:

1. **Clients** search and review.
2. **Artists** claim and update studios.
3. **Host / admin** moderates claims and reviews, and places ads.

Growth: reach artists on Instagram and ask them to list for free and put the portal in their bio. Do that as human outreach, not an Instagram bot (that violates Instagram rules). Cold start: when a city is searched, show registered artists **and** import public listings (prototype of a Google/Maps lookup) so the map is not empty. Artists tap **This is my studio**; admin grants access by hand.

Reviews: email must be confirmed. Criteria (stars 1–5, one optional comment):

- Quality of work
- Match to reference
- Client comfort
- Punctuality
- Communication
- Price / quality
- Reliability

First question: which service were you there for? Options come from the artist’s tags, plus **Other** (needed while most cards are auto-imported). You can also see rating per service (boxer braids, boho, dreadlocks, …). Clients can report reviews; admin hides or dismisses. Paid “delete this review” is out — platforms still have to moderate.

Ads: Google Ads can land with `?src=google-ads`. Admin funnel counts views, artist clicks, course clicks, product clicks.

Google: OAuth sign-in, then a menu of **Google Business locations** to import. Without API keys, a demo Google session still shows the picker.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional; Google OAuth only
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

Demo accounts on `/sign-in` (no password):

| Role   | What you get                                      |
| ------ | ------------------------------------------------- |
| Client | Search and review                                 |
| Artist | Nia Roots / Roots Atelier, Berlin, already claimed |
| Admin  | Claims, reports, ads, funnel                      |
| Google | Mock Business Profile locations to import         |

Real Google login: set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, and `AUTH_URL` to this origin. Authorized redirect: `{AUTH_URL}/api/auth/google/callback`.

Data lives in the browser (`localStorage`) so the prototype deploys as a static-friendly Next app. Reset from Admin.

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui, Leaflet (OpenStreetMap / CARTO), Nominatim geocoding.

## What is deliberately not in v1

- Instagram DM automation
- Scraping Google behind the scenes (the discover step is a stand-in for Places API)
- Stripe checkout for showcases, kits, or courses
- A course player — Learn links out
- Native iOS/Android shells — use the responsive site or a later PWA wrapper
