import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForMastersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs tracking-[0.2em] text-gold uppercase">For artists</p>
      <h1 className="font-heading text-4xl">List the chair. Clients are already searching the city.</h1>
      <p className="mt-3 text-muted-foreground">
        Rastafari is a map of loc, dreadlock, kosy, and braid artists. Listings start free. You
        fill the card yourself — photos of the room, work examples, the services you actually do.
        A paid showcase for aftercare products can sit under the card later.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="font-heading text-xl">Claim a generated page</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When someone searches a city we do not cover yet, we import public listings so the map
            is not empty. If that page is you, tap “This is my studio” and we unlock it from
            admin.
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="font-heading text-xl">Bring Google locations</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with Google and pick the Business Profile locations you already own. We copy
            name and address into Rastafari so you are not typing the pin twice.
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="font-heading text-xl">Link us from Instagram</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A bio link back here is the whole growth loop. We will not run an Instagram spam bot —
            that burns accounts. A short outreach note lives in admin instead.
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="font-heading text-xl">Reviews you can stand next to</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Clients rate quality, reference match, comfort, time, communication, value, and
            reliability. Stars first, one optional paragraph. Email must be confirmed.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button render={<Link href="/sign-in" />}>Sign in as an artist</Button>
        <Button variant="outline" render={<Link href="/" />}>
          See the client map
        </Button>
      </div>
    </div>
  );
}
