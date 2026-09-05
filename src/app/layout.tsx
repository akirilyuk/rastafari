import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MobileTabBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rastafari — find loc & braid artists near you",
    template: "%s · Rastafari",
  },
  description:
    "Find the nearest dreadlock, loc, kosy, and braid artist. Claim your studio, collect verified reviews, and sell kits or courses.",
  applicationName: "Rastafari",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2a2218",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">
            <Suspense>{children}</Suspense>
          </main>
          <SiteFooter />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
