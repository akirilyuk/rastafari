import Link from "next/link";
import { Logo } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 pb-20 md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            A directory for loc, dreadlock, and braid artists — find the nearest chair, leave a
            verified review, or claim your studio.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-foreground">Explore</p>
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Nearby artists
            </Link>
            <Link href="/learn" className="text-muted-foreground hover:text-foreground">
              Courses
            </Link>
            <Link href="/shop" className="text-muted-foreground hover:text-foreground">
              Hair & kits
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium text-foreground">Artists</p>
            <Link href="/for-masters" className="text-muted-foreground hover:text-foreground">
              List for free
            </Link>
            <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
              Claim a listing
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
