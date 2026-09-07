import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

export function supabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    ""
  );
}

export function supabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && (supabaseServiceKey() || supabaseAnonKey()));
}

let cached: SupabaseClient | null = null;

export function getServiceClient() {
  if (cached) return cached;
  const url = supabaseUrl();
  const key = supabaseServiceKey() || supabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
