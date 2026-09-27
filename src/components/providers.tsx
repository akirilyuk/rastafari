"use client";

import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth-client";
import { StoreProvider } from "@/lib/store";
import { AutoRegisterMaster } from "@/components/auto-register-master";
import { SourceTracker } from "@/components/source-tracker";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <StoreProvider>
          <AutoRegisterMaster />
          <Suspense fallback={null}>
            <SourceTracker />
          </Suspense>
          {children}
          <Toaster position="top-center" />
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
