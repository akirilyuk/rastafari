"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";

const SOURCE_KEY = "rastafari-source";

export function getTrafficSource() {
  if (typeof window === "undefined") return "direct";
  return localStorage.getItem(SOURCE_KEY) || "direct";
}

export function SourceTracker() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { track, hydrated } = useStore();

  useEffect(() => {
    const src = params.get("src") || params.get("utm_source");
    if (src) localStorage.setItem(SOURCE_KEY, src);
  }, [params]);

  useEffect(() => {
    if (!hydrated) return;
    track({
      name: "page_view",
      source: getTrafficSource(),
      path: pathname,
    });
  }, [hydrated, pathname, track]);

  return null;
}
