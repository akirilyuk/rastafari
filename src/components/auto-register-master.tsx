"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-client";
import { useStore } from "@/lib/store";

export function AutoRegisterMaster() {
  const { user, loading } = useAuth();
  const { state, hydrated, ensureRegisteredMaster } = useStore();
  const startedFor = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !hydrated || !user || user.role !== "master") return;
    if (state.masters.some((master) => master.claimedByUserId === user.id)) return;
    if (startedFor.current === user.id) return;
    startedFor.current = user.id;
    void ensureRegisteredMaster(user).catch(() => {
      startedFor.current = null;
    });
  }, [ensureRegisteredMaster, hydrated, loading, state.masters, user]);

  return null;
}
