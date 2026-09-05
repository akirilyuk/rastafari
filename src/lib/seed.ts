import { CITIES } from "./catalog";
import type { Ad, AppState, Course, Master, Product, Review } from "./types";

function img(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

const portraits = [
  "photo-1531746020798-e6953c6e8e04",
  "photo-1524504388940-b1c1722653e1",
  "photo-1531123897727-8f129e1688ce",
  "photo-1488426862026-3ee34a7d66df",
  "photo-1508214751196-bcfd4ca60f91",
  "photo-1544005313-94ddf0286df2",
  "photo-1506794778202-cad84cf45f1d",
  "photo-1500648767791-00dcc994a43e",
  "photo-1463453091185-61582044d556",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1473496169904-658ba7c44d8a",
  "photo-1521119989659-a83eee488004",
  "photo-1502823403499-6ccfcf4cb453",
  "photo-1552374196-c4e7ffc6e126",
  "photo-1539571696357-a21b785ae123",
  "photo-1529626455594-4ff0802cfb7e",
];

const workspaces = [
  "photo-1560066984-138dadb4c035",
  "photo-1521590832167-7bcbfaa6381c",
  "photo-1605497788044-5a32c7078486",
  "photo-1522337360788-8b13dee7a37e",
  "photo-1595476108010-b4d1f102b1b1",
  "photo-1580618672591-eb180b1a973f",
];

const works = [
  "photo-1516975080664-ed2fc6a32937",
  "photo-1487412947147-5cebf100ffc2",
  "photo-1522337660859-02fbefca4702",
  "photo-1492106087820-71f1a00d2b11",
  "photo-1519415943484-9fa1876825bb",
  "photo-1596462502278-27bfdc403348",
];

function photos(i: number, name: string) {
  const p = portraits[i % portraits.length];
  const w = workspaces[i % workspaces.length];
  const a = works[i % works.length];
  const b = works[(i + 2) % works.length];
  return [
    { url: img(p, 900), kind: "portrait" as const, alt: `${name} portrait` },
    { url: img(w, 1200), kind: "workspace" as const, alt: `${name} studio` },
    { url: img(a, 1200), kind: "work" as const, alt: `Work by ${name}` },
    { url: img(b, 1200), kind: "work" as const, alt: `More work by ${name}` },
  ];
}

const masterDefs: Array<{
  id: string;
  slug: string;
  name: string;
  studioName: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  bio: string;
  services: string[];
  instagram: string;
  claimed?: boolean;
  claimedByUserId?: string;
  source?: Master["source"];
  hasShowcase?: boolean;
  productIds?: string[];
}> = [
  {
    id: "m-nia",
    slug: "nia-roots-berlin",
    name: "Nia Roots",
    studioName: "Roots Atelier",
    city: "Berlin",
    address: "Weserstraße 28, 12047 Berlin",
    lat: 52.4862,
    lng: 13.4311,
    bio: "Natural loc specialist working from a quiet Neukölln studio. Appointments for installation, maintenance, and color-safe retwists.",
    services: ["natural-dreads", "dread-maintenance", "starter-locs", "sisterlocks"],
    instagram: "niaroots.berlin",
    claimed: true,
    claimedByUserId: "user-master",
    source: "registered",
    hasShowcase: true,
    productIds: ["p-wax", "p-oil"],
  },
  {
    id: "m-kira",
    slug: "kira-locs-berlin",
    name: "Kira Mensah",
    studioName: "Gold Thread Locs",
    city: "Berlin",
    address: "Oderberger Straße 9, 10435 Berlin",
    lat: 52.5408,
    lng: 13.4099,
    bio: "Synthetic and natural dreadlocks, plus boho braids for festivals and shoots. Prenzlauer Berg, by appointment.",
    services: ["synthetic-dreads", "natural-dreads", "boho-braids", "braids"],
    instagram: "goldthread.locs",
  },
  {
    id: "m-lina",
    slug: "lina-kosy-berlin",
    name: "Lina Volkova",
    studioName: "Kosy Room",
    city: "Berlin",
    address: "Boxhagener Straße 16, 10245 Berlin",
    lat: 52.5097,
    lng: 13.4552,
    bio: "Russian-speaking braid artist. Kosy, boxer braids, knotless, and kids' styles. Walk-ins on Saturdays.",
    services: ["kosy", "boxer-braids", "knotless", "braids", "cornrows"],
    instagram: "kosy.room",
  },
  {
    id: "m-jamal",
    slug: "jamal-crown-london",
    name: "Jamal Adeyemi",
    studioName: "Crown London",
    city: "London",
    address: "Ridley Road, Dalston, London E8",
    lat: 51.5485,
    lng: -0.0726,
    bio: "Locs, sisterlocks, and precision cornrows. Fifteen years on the chair, now a two-seat studio in Dalston.",
    services: ["natural-dreads", "sisterlocks", "cornrows", "dread-maintenance"],
    instagram: "crown.london.locs",
    hasShowcase: true,
    productIds: ["p-locs-kit"],
  },
  {
    id: "m-aya",
    slug: "aya-boho-london",
    name: "Aya Bennett",
    studioName: "Soft Knot",
    city: "London",
    address: "Broadway Market, London E8",
    lat: 51.5366,
    lng: -0.0619,
    bio: "Boho braids, knotless, and human-hair installs. Reference photos welcome — we match texture, not just the Pinterest pose.",
    services: ["boho-braids", "knotless", "fulani", "braids"],
    instagram: "softknot.ldn",
  },
  {
    id: "m-sven",
    slug: "sven-dreads-amsterdam",
    name: "Sven de Boer",
    studioName: "Canal Locs",
    city: "Amsterdam",
    address: "Haarlemmerdijk 64, Amsterdam",
    lat: 52.3814,
    lng: 4.8891,
    bio: "Natural dreadlocks from first backcomb to decade-old maintenance. Slow appointments, tea included.",
    services: ["natural-dreads", "dread-maintenance", "starter-locs"],
    instagram: "canallocs",
  },
  {
    id: "m-marie",
    slug: "marie-tresses-paris",
    name: "Marie Diop",
    studioName: "Atelier Tresses",
    city: "Paris",
    address: "Rue des Martyrs, 75009 Paris",
    lat: 48.8785,
    lng: 2.3397,
    bio: "Fulani, knotless, and boxer braids. Also a small nails corner for clients who want both in one day.",
    services: ["fulani", "knotless", "boxer-braids", "nails"],
    instagram: "atelier.tresses",
  },
  {
    id: "m-zoe",
    slug: "zoe-halo-nyc",
    name: "Zoe Clarke",
    studioName: "Halo Brooklyn",
    city: "New York",
    address: "Bedford Avenue, Brooklyn, NY",
    lat: 40.7178,
    lng: -73.957,
    bio: "Microlocs, sisterlocks, and retwists. Evening slots for people who work late.",
    services: ["sisterlocks", "natural-dreads", "dread-maintenance"],
    instagram: "halobk.locs",
  },
  {
    id: "m-diego",
    slug: "diego-braids-la",
    name: "Diego Alvarez",
    studioName: "Westside Braids",
    city: "Los Angeles",
    address: "Abbot Kinney Blvd, Venice, CA",
    lat: 33.991,
    lng: -118.466,
    bio: "Boxer braids, cornrows, and men's designs. Film and editorial work by request.",
    services: ["boxer-braids", "cornrows", "braids", "twists"],
    instagram: "westside.braids",
  },
  {
    id: "m-anya",
    slug: "anya-dreads-moscow",
    name: "Anya Sokolova",
    studioName: "Dread Lab Moscow",
    city: "Moscow",
    address: "Patriarshiye Ponds, Moscow",
    lat: 55.7638,
    lng: 37.5922,
    bio: "Natural and synthetic dreadlocks, plus teaching weekends. Russian and English.",
    services: ["natural-dreads", "synthetic-dreads", "dread-maintenance", "kosy"],
    instagram: "dreadlab.msk",
  },
  {
    id: "m-katya",
    slug: "katya-kosy-spb",
    name: "Katya Morozova",
    studioName: "Kosy na Neve",
    city: "Saint Petersburg",
    address: "Nevsky Prospect 48, Saint Petersburg",
    lat: 59.9343,
    lng: 30.3351,
    bio: "Kosy, boho braids, and synthetic sets for events. Studio with a waiting room for friends.",
    services: ["kosy", "boho-braids", "synthetic-dreads", "braids"],
    instagram: "kosy.neve",
  },
  {
    id: "m-ola",
    slug: "ola-locs-warsaw",
    name: "Ola Nowak",
    studioName: "Splot Warsaw",
    city: "Warsaw",
    address: "ul. Ząbkowska 12, Warsaw",
    lat: 52.256,
    lng: 21.038,
    bio: "Dreadlock maintenance and starter locs. Quiet Praga studio, weekend bookings.",
    services: ["natural-dreads", "dread-maintenance", "starter-locs", "twists"],
    instagram: "splot.waw",
  },
  {
    id: "m-ina",
    slug: "ina-boho-bcn",
    name: "Ina Costa",
    studioName: "Sol Braids",
    city: "Barcelona",
    address: "Carrer de Verdi, Gràcia, Barcelona",
    lat: 41.4036,
    lng: 2.1572,
    bio: "Boho and fulani braids, festival sets, and aftercare. English, Catalan, Spanish.",
    services: ["boho-braids", "fulani", "braids", "lashes"],
    instagram: "solbraids.bcn",
  },
  {
    id: "m-rui",
    slug: "rui-locs-lisbon",
    name: "Rui Mendes",
    studioName: "Maré Locs",
    city: "Lisbon",
    address: "Lx Factory, Lisbon",
    lat: 38.7034,
    lng: -9.178,
    bio: "Natural locs and maintenance near the river. Slow work, no rush slots.",
    services: ["natural-dreads", "dread-maintenance"],
    instagram: "mare.locs",
  },
  {
    id: "m-thandi",
    slug: "thandi-crown-cpt",
    name: "Thandi Nkosi",
    studioName: "Cape Crown",
    city: "Cape Town",
    address: "Kloof Street, Cape Town",
    lat: -33.9279,
    lng: 18.4104,
    bio: "Sisterlocks, starter locs, and twists. Also a small lash bar upstairs.",
    services: ["sisterlocks", "starter-locs", "twists", "lashes"],
    instagram: "capecrown.locs",
  },
  {
    id: "m-devon",
    slug: "devon-yard-kingston",
    name: "Devon Clarke",
    studioName: "Yard Locs",
    city: "Kingston",
    address: "Half Way Tree, Kingston",
    lat: 18.007,
    lng: -76.789,
    bio: "Traditional locking, palm rolling, and long-term loc care. Walk-in mornings.",
    services: ["natural-dreads", "dread-maintenance", "starter-locs"],
    instagram: "yardlocs.kingston",
  },
];

function cityMeta(city: string) {
  const hit = CITIES.find((c) => c.city === city);
  return hit ?? { city, country: "", lat: 0, lng: 0 };
}

export const SEED_MASTERS: Master[] = masterDefs.map((m, i) => {
  const meta = cityMeta(m.city);
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    studioName: m.studioName,
    city: m.city,
    country: meta.country,
    address: m.address,
    lat: m.lat,
    lng: m.lng,
    bio: m.bio,
    services: m.services,
    photos: photos(i, m.name),
    instagram: m.instagram,
    claimed: m.claimed ?? false,
    claimedByUserId: m.claimedByUserId,
    source: m.source ?? "google-import",
    hasShowcase: m.hasShowcase ?? false,
    productIds: m.productIds ?? [],
  };
});

export const DISCOVERY_POOL: Master[] = [
  {
    id: "m-petra",
    slug: "petra-dreads-prague",
    name: "Petra Nováková",
    studioName: "Hrad Locs",
    city: "Prague",
    country: "Czechia",
    address: "Letná, Prague",
    lat: 50.0966,
    lng: 14.416,
    bio: "Public listing imported from search. Natural and synthetic dreadlocks.",
    services: ["natural-dreads", "synthetic-dreads", "kosy"],
    photos: photos(3, "Petra Nováková"),
    instagram: "hrad.locs",
    claimed: false,
    source: "google-import",
    hasShowcase: false,
    productIds: [],
    googlePlaceId: "discover-prague-petra",
  },
  {
    id: "m-lukas",
    slug: "lukas-braids-vienna",
    name: "Lukas Berger",
    studioName: "Wien Braids",
    city: "Vienna",
    country: "Austria",
    address: "Neubau, Vienna",
    lat: 48.2026,
    lng: 16.349,
    bio: "Public listing imported from search. Boxer braids and cornrows.",
    services: ["boxer-braids", "cornrows", "braids"],
    photos: photos(5, "Lukas Berger"),
    instagram: "wien.braids",
    claimed: false,
    source: "google-import",
    hasShowcase: false,
    productIds: [],
    googlePlaceId: "discover-vienna-lukas",
  },
  {
    id: "m-sofia",
    slug: "sofia-kosy-berlin-mitte",
    name: "Sofia Krüger",
    studioName: "Mitte Kosy",
    city: "Berlin",
    country: "Germany",
    address: "Torstraße 88, 10119 Berlin",
    lat: 52.5286,
    lng: 13.401,
    bio: "Public listing imported from search. Kosy and knotless braids.",
    services: ["kosy", "knotless", "boho-braids"],
    photos: photos(7, "Sofia Krüger"),
    instagram: "mitte.kosy",
    claimed: false,
    source: "google-import",
    hasShowcase: false,
    productIds: [],
    googlePlaceId: "discover-berlin-sofia",
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p-locs-kit",
    owner: "platform",
    name: "Starter loc kit",
    description: "Combs, clips, residue-free wash, and a palm-roll cloth. The same kit used in our beginner course.",
    price: 48,
    currency: "EUR",
    image: img("photo-1522335789203-aabd1fc54bc9"),
    featured: true,
  },
  {
    id: "p-syn-pack",
    owner: "platform",
    name: "Synthetic dread pack — 20 DE",
    description: "Handmade double-ended synthetic locs in natural black, honey, and burgundy.",
    price: 89,
    currency: "EUR",
    image: img("photo-1596462502278-27bfdc403348"),
    featured: true,
  },
  {
    id: "p-wax",
    owner: "master",
    masterId: "m-nia",
    name: "Roots Atelier loc wax",
    description: "Light hold wax Nia mixes for maintenance — not a heavy lock gel.",
    price: 16,
    currency: "EUR",
    image: img("photo-1611930022073-b7a4ba5fcccd"),
  },
  {
    id: "p-oil",
    owner: "master",
    masterId: "m-nia",
    name: "Scalp oil",
    description: "Rosemary and jojoba blend for retwist days.",
    price: 18,
    currency: "EUR",
    image: img("photo-1608571423902-eed4a9abfc83"),
  },
  {
    id: "p-locs-kit-jamal",
    owner: "master",
    masterId: "m-jamal",
    name: "Crown London aftercare set",
    description: "Satin wrap, spray, and the oil Jamal sends clients home with.",
    price: 32,
    currency: "GBP",
    image: img("photo-1571781926291-c477ebfd024b"),
  },
];

export const SEED_COURSES: Course[] = [
  {
    id: "c-natural",
    title: "Natural dreadlocks from scratch",
    teacher: "Rastafari Academy",
    description: "Our own course: sectioning, backcomb vs twist-and-rip, first-month care, and how to talk clients through the ugly stage.",
    price: 149,
    currency: "EUR",
    image: img(workspaces[0]),
    hostedHere: false,
    url: "https://example.com/courses/natural-dreads",
    sponsored: false,
    platformOwned: true,
  },
  {
    id: "c-boho",
    title: "Boho braids masterclass",
    teacher: "Rastafari Academy",
    description: "Human hair vs kanekalon, face-framing pieces, and a clean takedown. Platform-owned, hosted on our school site.",
    price: 119,
    currency: "EUR",
    image: img(works[3]),
    hostedHere: false,
    url: "https://example.com/courses/boho",
    sponsored: false,
    platformOwned: true,
  },
  {
    id: "c-anya",
    title: "Synthetic sets that last",
    teacher: "Anya Sokolova",
    description: "Sponsored listing. Anya teaches crochet installs in Moscow — the course lives on her own site.",
    price: 79,
    currency: "EUR",
    image: img(works[1]),
    hostedHere: false,
    url: "https://example.com/anya-course",
    sponsored: true,
    platformOwned: false,
  },
];

export const SEED_ADS: Ad[] = [
  {
    id: "ad-home",
    title: "Learn the craft, then list your chair",
    body: "Natural dreadlocks from scratch — the platform course. Artists who finish it get a featured badge on their card.",
    href: "/learn",
    placement: "home",
    active: true,
  },
  {
    id: "ad-learn",
    title: "Synthetic dread packs",
    body: "The same DE packs we use in class, shipped from Berlin.",
    href: "/shop",
    placement: "learn",
    active: true,
  },
];

function scores(base: number): Record<string, number> {
  const keys = [
    "quality",
    "reference",
    "comfort",
    "punctuality",
    "communication",
    "value",
    "reliability",
  ];
  const out: Record<string, number> = {};
  keys.forEach((k, i) => {
    out[k] = Math.min(5, Math.max(1, base + ((i % 3) - 1) * 0));
  });
  out.quality = base;
  out.reference = Math.min(5, base);
  out.comfort = Math.max(3, base - 1);
  out.punctuality = Math.min(5, base + (base === 5 ? 0 : 1));
  out.communication = base;
  out.value = Math.max(3, base - 1);
  out.reliability = base;
  return out;
}

export const SEED_REVIEWS: Review[] = [
  {
    id: "r1",
    masterId: "m-nia",
    serviceId: "natural-dreads",
    authorName: "Mira K.",
    authorEmail: "mira@example.com",
    emailVerified: true,
    scores: scores(5),
    comment: "Six-hour install and it still looks like the reference photo. Quiet studio, tea, no rush.",
    status: "published",
    createdAt: "2026-07-12T10:00:00.000Z",
    reportCount: 0,
  },
  {
    id: "r2",
    masterId: "m-nia",
    serviceId: "dread-maintenance",
    authorName: "Jonas",
    authorEmail: "jonas@example.com",
    emailVerified: true,
    scores: scores(4),
    comment: "Maintenance was thorough. Started 20 minutes late, but she messaged ahead.",
    status: "published",
    createdAt: "2026-08-02T10:00:00.000Z",
    reportCount: 0,
  },
  {
    id: "r3",
    masterId: "m-kira",
    serviceId: "boho-braids",
    authorName: "Lea",
    authorEmail: "lea@example.com",
    emailVerified: true,
    scores: scores(5),
    comment: "Boho braids for a wedding. Held through dancing and a boat party.",
    status: "published",
    createdAt: "2026-06-20T10:00:00.000Z",
    reportCount: 0,
  },
  {
    id: "r4",
    masterId: "m-jamal",
    serviceId: "sisterlocks",
    authorName: "Priya",
    authorEmail: "priya@example.com",
    emailVerified: true,
    scores: scores(5),
    comment: "Sisterlocks consult was honest about time and cost. Installation was impeccable.",
    status: "published",
    createdAt: "2026-05-11T10:00:00.000Z",
    reportCount: 0,
  },
  {
    id: "r5",
    masterId: "m-anya",
    serviceId: "synthetic-dreads",
    authorName: "Oleg",
    authorEmail: "oleg@example.com",
    emailVerified: true,
    scores: scores(4),
    comment: "Bright synthetic set. A couple of ends needed a redo the next week — she fixed them free.",
    status: "published",
    createdAt: "2026-04-03T10:00:00.000Z",
    reportCount: 0,
  },
];

export function createInitialState(): AppState {
  return {
    masters: SEED_MASTERS,
    reviews: SEED_REVIEWS,
    reports: [],
    claims: [],
    products: SEED_PRODUCTS,
    courses: SEED_COURSES,
    ads: SEED_ADS,
    events: [],
    discoveredCities: [],
  };
}
