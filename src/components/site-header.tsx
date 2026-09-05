"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, GraduationCap, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Find artists", icon: Search },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/for-masters", label: "For artists", icon: User },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-full bg-gold text-[#1a1208] shadow-[0_0_0_3px_rgba(212,160,40,0.25)]">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M12 2c1.2 2.4 2 4.2 2 6.2 0 1.6-.6 3-1.6 4.1C14.2 13 16 15.2 16 18c0 2.2-1.8 4-4 4s-4-1.8-4-4c0-2.8 1.8-5 3.6-5.7C10.6 11.2 10 9.8 10 8.2 10 6.2 10.8 4.4 12 2z" />
        </svg>
      </span>
      <span className="font-heading text-lg tracking-tight">Rastafari</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                pathname === item.href && "bg-muted text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user?.role === "admin" && (
            <Button variant="ghost" render={<Link href="/admin" />}>
              Admin
            </Button>
          )}
          {user && (user.role === "master" || user.role === "admin") && (
            <Button variant="ghost" render={<Link href="/dashboard" />}>
              Studio
            </Button>
          )}
          {user ? (
            <Button variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          ) : (
            <Button render={<Link href="/sign-in" />}>Sign in</Button>
          )}
        </div>
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-1 px-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  Admin
                </Link>
              )}
              {user && (
                <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  Studio dashboard
                </Link>
              )}
              {user ? (
                <Button className="mt-3" variant="outline" onClick={() => void signOut()}>
                  Sign out
                </Button>
              ) : (
                <Button className="mt-3" render={<Link href="/sign-in" />}>
                  Sign in
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "Find", icon: Search },
    { href: "/learn", label: "Learn", icon: GraduationCap },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/sign-in", label: "You", icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px]",
                active ? "text-gold" : "text-muted-foreground",
              )}
            >
              <tab.icon className="size-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
