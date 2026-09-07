"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-client";
import { SERVICES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Master } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { state, updateMaster, importGbpLocation, toggleShowcase } = useStore();

  const owned = useMemo(() => {
    if (!user) return [];
    return state.masters.filter((m) => m.claimedByUserId === user.id);
  }, [state.masters, user]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const current = owned.find((m) => m.id === (activeId ?? owned[0]?.id)) ?? owned[0];

  if (loading) {
    return <div className="px-4 py-16 text-center text-muted-foreground">Loading session…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-3xl">Studio access</h1>
        <p className="mt-2 text-muted-foreground">Sign in to edit a claimed listing or import Google locations.</p>
        <Button className="mt-6" render={<Link href="/sign-in" />}>
          Sign in
        </Button>
      </div>
    );
  }

  if (user.role === "client") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-heading text-3xl">You are signed in as a client</h1>
        <p className="mt-2 text-muted-foreground">
          Switch to an artist or Google demo account to manage a studio, or claim an unclaimed
          card from search.
        </p>
        <Button className="mt-6" render={<Link href="/sign-in" />}>
          Switch account
        </Button>
      </div>
    );
  }

  const locations = user.googleLocations ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        {user.name} · {user.email} · {user.provider === "google" ? "Google" : "Demo"}
      </p>
      <h1 className="font-heading text-4xl">Studio</h1>

      {locations.length > 0 && (
        <section className="mt-8 rounded-3xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="font-heading text-2xl">Locations from your Google account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Google Business Profile would fill this in production. Select a location to copy it
            into Rastafari.
          </p>
          <ul className="mt-4 space-y-3">
            {locations.map((loc) => {
              const already = state.masters.find((m) => m.googlePlaceId === loc.placeId);
              return (
                <li
                  key={loc.placeId}
                  className="flex flex-col gap-2 rounded-xl bg-background/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    <p className="text-sm text-muted-foreground">{loc.address}</p>
                  </div>
                  {already ? (
                    <Badge variant="secondary">Imported</Badge>
                  ) : (
                    <Button
                      onClick={() => {
                        void importGbpLocation(loc, user.id)
                          .then((m) => {
                            setActiveId(m.id);
                            toast.success(`${loc.name} is now a Rastafari card.`);
                          })
                          .catch((error: unknown) => {
                            toast.error(error instanceof Error ? error.message : "Could not import location.");
                          });
                      }}
                    >
                      Use this location
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {owned.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <p className="font-medium">No studio attached yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Claim an unclaimed listing from the map, or import a Google location above. The demo
            artist account already owns Roots Atelier in Berlin.
          </p>
          <Button className="mt-4" render={<Link href="/" />}>
            Find a listing to claim
          </Button>
        </div>
      ) : (
        <>
          {owned.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {owned.map((m) => (
                <Button
                  key={m.id}
                  variant={m.id === current?.id ? "default" : "outline"}
                  onClick={() => setActiveId(m.id)}
                >
                  {m.studioName}
                </Button>
              ))}
            </div>
          )}
          {current && (
            <Editor
              key={current.id}
              master={current}
              onSave={(patch) => {
                void updateMaster(current.id, patch)
                  .then(() => toast.success("Card updated."))
                  .catch((error: unknown) => {
                    toast.error(error instanceof Error ? error.message : "Could not save.");
                  });
              }}
              onShowcase={(on) => toggleShowcase(current.id, on)}
            />
          )}
        </>
      )}
    </div>
  );
}

function Editor({
  master,
  onSave,
  onShowcase,
}: {
  master: Master;
  onSave: (patch: Partial<Master>) => void;
  onShowcase: (on: boolean) => void;
}) {
  const [name, setName] = useState(master.name);
  const [studioName, setStudioName] = useState(master.studioName);
  const [bio, setBio] = useState(master.bio);
  const [address, setAddress] = useState(master.address);
  const [instagram, setInstagram] = useState(master.instagram ?? "");
  const [services, setServices] = useState(master.services);

  function toggle(id: string) {
    setServices((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl">Edit card</h2>
        <Button variant="outline" render={<Link href={`/masters/${master.slug}`} />}>
          View public page
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Artist name</Label>
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Studio</Label>
          <Input className="mt-1" value={studioName} onChange={(e) => setStudioName(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Address</Label>
        <Input className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <Label>Instagram</Label>
        <Input className="mt-1" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea className="mt-1" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div>
        <Label>Service tags</Label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SERVICES.map((s) => {
            const on = services.includes(s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggle(s.id)}>
                <Badge variant={on ? "default" : "outline"} className="h-7 cursor-pointer">
                  {s.name}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            onSave({ name, studioName, bio, address, instagram, services })
          }
        >
          Save card
        </Button>
        <Button variant="outline" onClick={() => onShowcase(!master.hasShowcase)}>
          {master.hasShowcase ? "Turn showcase off" : "Enable product showcase"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Showcase is the paid shelf for aftercare. In this prototype it is a toggle, not a
        checkout.
      </p>
    </div>
  );
}
