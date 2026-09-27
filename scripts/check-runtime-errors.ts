import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
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

const IGNORE = [/Download the React DevTools/i, /React DevTools/i];

function logOffset(): number {
  if (!existsSync(LOG)) return 0;
  return readFileSync(LOG, "utf8").length;
}

function parseLogErrors(since: number): string[] {
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
      if (/error|⨯|hydration|nativeButton|upstream image/i.test(line)) errors.push(line);
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

async function waitForJson<T>(url: string, timeoutMs = 10_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return (await res.json()) as T;
    } catch {
      /* chrome not ready */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Chrome DevTools did not start at ${url}`);
}

function openCdp(url: string) {
  const ws = new WebSocket(url);
  const pending = new Map<number, { resolve: (value: unknown) => void; reject: (err: Error) => void }>();
  const events: string[] = [];
  let nextId = 1;

  const ready = new Promise<void>((resolvePromise, reject) => {
    ws.addEventListener("open", () => resolvePromise());
    ws.addEventListener("error", () => reject(new Error("CDP websocket failed")));
  });

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(String(event.data)) as {
      id?: number;
      result?: unknown;
      error?: { message?: string };
      method?: string;
      params?: Record<string, unknown>;
    };
    if (data.id != null) {
      const waiter = pending.get(data.id);
      if (!waiter) return;
      pending.delete(data.id);
      if (data.error) waiter.reject(new Error(data.error.message ?? "CDP error"));
      else waiter.resolve(data.result);
      return;
    }
    if (data.method === "Runtime.exceptionThrown") {
      const details = data.params?.exceptionDetails as
        | { text?: string; exception?: { description?: string } }
        | undefined;
      const text = details?.exception?.description ?? details?.text ?? "page exception";
      if (!IGNORE.some((re) => re.test(text))) events.push(text);
    }
    if (data.method === "Runtime.consoleAPICalled") {
      const type = String(data.params?.type ?? "");
      if (type !== "error" && type !== "warning") return;
      const args = (data.params?.args as Array<{ value?: unknown; description?: string }>) ?? [];
      const text = args.map((arg) => String(arg.value ?? arg.description ?? "")).join(" ");
      if (!text || IGNORE.some((re) => re.test(text))) return;
      if (type === "warning" && !/nativeButton|hydration|Base UI/i.test(text)) return;
      events.push(text);
    }
  });

  function send(method: string, params?: Record<string, unknown>) {
    const id = nextId++;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolvePromise, reject) => {
      pending.set(id, { resolve: resolvePromise, reject });
    });
  }

  return { ready, send, events, close: () => ws.close() };
}

async function visitWithChrome(routes: string[]): Promise<string[]> {
  const profile = mkdtempSync(resolve(tmpdir(), "runtime-check-"));
  const port = 9222 + Math.floor(Math.random() * 200);
  const chrome: ChildProcess = spawn(
    "google-chrome",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  );

  const browserErrors: string[] = [];
  try {
    await waitForJson<{ Browser: string }>(`http://127.0.0.1:${port}/json/version`);
    const pages = await waitForJson<Array<{ type: string; webSocketDebuggerUrl: string }>>(
      `http://127.0.0.1:${port}/json/list`,
    );
    const target = pages.find((page) => page.type === "page");
    if (!target) throw new Error("Chrome started without a page target");
    const page = openCdp(target.webSocketDebuggerUrl);
    await page.ready;
    await page.send("Runtime.enable");
    await page.send("Page.enable");
    for (const route of routes) {
      page.events.length = 0;
      const url = new URL(route, BASE).toString();
      await page.send("Page.navigate", { url });
      await new Promise((r) => setTimeout(r, 2500));
      browserErrors.push(...page.events.map((event) => `${route}: ${event}`));
      process.stdout.write(`visited ${route}\n`);
    }
    page.close();
  } finally {
    if (chrome.pid) {
      chrome.kill();
      await new Promise((r) => setTimeout(r, 400));
    }
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      /* chrome may still be flushing the profile */
    }
  }
  return browserErrors;
}

async function main() {
  const started = logOffset();
  await waitForServer();

  for (const route of ROUTES) {
    const url = new URL(route, BASE).toString();
    const res = await fetch(url, { redirect: "manual" });
    if (res.status >= 500) throw new Error(`${res.status} ${url}`);
  }

  const browserErrors = await visitWithChrome(ROUTES);
  await new Promise((r) => setTimeout(r, 800));
  const errors = [...parseLogErrors(started), ...browserErrors];
  if (errors.length) {
    console.error(`runtime errors (${errors.length}):\n`);
    for (const error of errors.slice(0, 16)) console.error(`${error.slice(0, 800)}\n`);
    process.exitCode = 1;
    return;
  }

  console.log(`ok — ${ROUTES.length} routes, no new Next.js/runtime errors`);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
