import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.NEXT_URL ?? "http://127.0.0.1:43127";
const LOG = resolve(process.cwd(), ".next/dev/logs/next-development.log");
const ROUTES = [
  "/",
  "/for-masters",
  "/learn",
  "/shop",
  "/sign-in",
  "/verify",
  "/dashboard",
  "/admin",
  "/masters/nia-roots-berlin",
];

const IGNORE = [/Download the React DevTools/i];

function logOffset(): number {
  if (!existsSync(LOG)) return 0;
  return readFileSync(LOG, "utf8").length;
}

function parseErrors(since: number): string[] {
  if (!existsSync(LOG)) return [`missing Next.js log at ${LOG}`];
  const added = readFileSync(LOG, "utf8").slice(since);
  const errors: string[] = [];
  for (const line of added.split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line) as { level?: string; message?: string };
      if (entry.level !== "ERROR") continue;
      const message = String(entry.message ?? line);
      if (IGNORE.some((re) => re.test(message))) continue;
      errors.push(message);
    } catch {
      if (/error|⨯|hydration|nativeButton|upstream image/i.test(line)) {
        errors.push(line);
      }
    }
  }
  return errors;
}

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status > 0) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Next.js dev server is not reachable at ${BASE}`);
}

function chromeVisit(url: string) {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(
      "google-chrome",
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--virtual-time-budget=10000",
        "--timeout=20000",
        "--dump-dom",
        url,
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    const timer = setTimeout(() => {
      child.kill();
      resolvePromise();
    }, 25_000);
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code && code !== 0 && /crash|segmentation/i.test(stderr)) {
        reject(new Error(`chrome failed for ${url}: ${stderr.slice(0, 400)}`));
        return;
      }
      resolvePromise();
    });
  });
}

const started = logOffset();
await waitForServer();

for (const route of ROUTES) {
  const url = new URL(route, BASE).toString();
  const res = await fetch(url, { redirect: "manual" });
  if (res.status >= 500) {
    throw new Error(`${res.status} ${url}`);
  }
  await chromeVisit(url);
  process.stdout.write(`visited ${route} (${res.status})\n`);
}

await new Promise((r) => setTimeout(r, 1200));
const errors = parseErrors(started);
if (errors.length) {
  console.error(`runtime errors (${errors.length}):\n`);
  for (const error of errors.slice(0, 12)) {
    console.error(`${error.slice(0, 800)}\n`);
  }
  process.exit(1);
}

console.log(`ok — ${ROUTES.length} routes, no new Next.js/runtime errors`);
