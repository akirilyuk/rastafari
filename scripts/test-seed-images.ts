import assert from "node:assert/strict";
import { createInitialState, rewriteDeadImagesInState, rewriteDeadUnsplashUrl } from "../src/lib/seed";
import type { AppState } from "../src/lib/types";

assert.equal(
  rewriteDeadUnsplashUrl(
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4cb453?auto=format&fit=crop&w=900&q=80",
  ),
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
);

const broken: AppState = {
  ...createInitialState(),
  products: [
    {
      id: "p-oil",
      owner: "master",
      name: "Scalp oil",
      description: "test",
      price: 1,
      currency: "EUR",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a9abfc83?auto=format&fit=crop&w=200&q=80",
    },
  ],
};
assert.match(
  rewriteDeadImagesInState(broken).products[0].image,
  /photo-1556228720-195a672e8a03/,
);

const urls = new Set<string>();
const state = createInitialState();
for (const master of state.masters) {
  for (const photo of master.photos) urls.add(photo.url);
}
for (const product of state.products) urls.add(product.image);
for (const course of state.courses) urls.add(course.image);

const dead = [
  "photo-1502823403499-6ccfcf4cb453",
  "photo-1539571696357-a21b785ae123",
  "photo-1521590832167-7bcbfaa6381c",
  "photo-1519415943484-9fa1876825bb",
  "photo-1608571423902-eed4a9abfc83",
];
for (const id of dead) {
  for (const url of urls) {
    assert.equal(url.includes(id), false, `seed still references ${id}`);
  }
}

async function checkLiveUrls() {
  const failures: string[] = [];
  for (const url of urls) {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) failures.push(`${res.status} ${url}`);
  }
  assert.equal(failures.length, 0, `dead seed images:\n${failures.join("\n")}`);
  console.log(`ok — ${urls.size} seed images returned 200`);
}

void checkLiveUrls().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
