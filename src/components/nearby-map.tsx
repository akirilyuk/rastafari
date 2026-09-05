"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { Master } from "@/lib/types";
import { formatDistance } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function NearbyMap({
  origin,
  masters,
  distances,
}: {
  origin: { lat: number; lng: number };
  masters: Master[];
  distances: Record<string, number>;
}) {
  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={12}
      className="h-full w-full rounded-2xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Recenter lat={origin.lat} lng={origin.lng} />
      <CircleMarker
        center={[origin.lat, origin.lng]}
        radius={9}
        pathOptions={{ color: "#f0d48a", fillColor: "#f0d48a", fillOpacity: 0.9 }}
      >
        <Popup>You</Popup>
      </CircleMarker>
      {masters.map((m) => (
        <CircleMarker
          key={m.id}
          center={[m.lat, m.lng]}
          radius={8}
          pathOptions={{ color: "#3f8f6b", fillColor: "#3f8f6b", fillOpacity: 0.95 }}
        >
          <Popup>
            <div className="min-w-40 text-sm text-zinc-900">
              <p className="font-semibold">{m.name}</p>
              <p>{m.studioName}</p>
              <p className="text-zinc-600">{formatDistance(distances[m.id] ?? 0)} away</p>
              <Link href={`/masters/${m.slug}`} className="text-emerald-800 underline">
                Open card
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
