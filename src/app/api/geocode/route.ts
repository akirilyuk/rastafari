import { NextResponse } from "next/server";
import { CITIES } from "@/lib/catalog";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const local = CITIES.filter((c) =>
    `${c.city}, ${c.country}`.toLowerCase().includes(q.toLowerCase()),
  ).map((c) => ({
    label: `${c.city}, ${c.country}`,
    city: c.city,
    country: c.country,
    lat: c.lat,
    lng: c.lng,
  }));
  if (local.length) return NextResponse.json({ results: local });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "user-agent": "RastafariDirectory/1.0 (prototype; local demo)",
          accept: "application/json",
        },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return NextResponse.json({ results: [] });
    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      name?: string;
      address?: { city?: string; town?: string; village?: string; country?: string };
    }>;
    const results = data.map((d) => {
      const city =
        d.address?.city || d.address?.town || d.address?.village || d.name || q;
      return {
        label: d.display_name,
        city,
        country: d.address?.country || "",
        lat: Number(d.lat),
        lng: Number(d.lon),
      };
    });
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
