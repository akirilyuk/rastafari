-- Rastafari app schema for Supabase (Postgres).
-- Run this in the Supabase SQL editor, then set
-- NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
-- The Next.js server seeds users, shops, reviews, products, courses, and ads
-- on first load if those tables are empty.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Signed-in people (demo accounts, Google OAuth, later email).
create table if not exists public.users (
  id text primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('client', 'master', 'admin')),
  provider text not null check (provider in ('demo', 'google')),
  picture text,
  google_locations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Artist studios / listings ("shops" in product language).
create table if not exists public.shops (
  id text primary key,
  slug text not null unique,
  name text not null,
  studio_name text not null,
  city text not null,
  country text not null default '',
  address text not null default '',
  lat double precision not null default 0,
  lng double precision not null default 0,
  bio text not null default '',
  services text[] not null default '{}',
  photos jsonb not null default '[]'::jsonb,
  instagram text,
  website text,
  claimed boolean not null default false,
  claimed_by_user_id text references public.users (id) on delete set null,
  source text not null check (source in ('registered', 'google-import', 'gbp-sync')),
  google_place_id text unique,
  has_showcase boolean not null default false,
  product_ids text[] not null default '{}',
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shops_city_lower_idx on public.shops (lower(city));
create index if not exists shops_claimed_by_idx on public.shops (claimed_by_user_id);

create table if not exists public.reviews (
  id text primary key,
  shop_id text not null references public.shops (id) on delete cascade,
  service_id text not null,
  author_name text not null,
  author_email text not null,
  author_user_id text references public.users (id) on delete set null,
  email_verified boolean not null default false,
  verify_token text,
  scores jsonb not null default '{}'::jsonb,
  comment text not null default '',
  status text not null check (status in ('pending_email', 'published', 'hidden')),
  report_count integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists reviews_verify_token_idx
  on public.reviews (verify_token)
  where verify_token is not null;
create index if not exists reviews_shop_idx on public.reviews (shop_id);
create index if not exists reviews_status_idx on public.reviews (status);

create table if not exists public.review_reports (
  id text primary key,
  review_id text not null references public.reviews (id) on delete cascade,
  reason text not null,
  details text not null default '',
  status text not null check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.claims (
  id text primary key,
  shop_id text not null references public.shops (id) on delete cascade,
  user_id text references public.users (id) on delete set null,
  name text not null,
  email text not null,
  instagram text not null default '',
  message text not null default '',
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  owner text not null check (owner in ('platform', 'master')),
  shop_id text references public.shops (id) on delete set null,
  name text not null,
  description text not null default '',
  price double precision not null,
  currency text not null default 'EUR',
  image text not null,
  url text,
  featured boolean not null default false
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  teacher text not null,
  description text not null default '',
  price double precision not null,
  currency text not null default 'EUR',
  image text not null,
  hosted_here boolean not null default false,
  url text not null default '',
  sponsored boolean not null default false,
  platform_owned boolean not null default false
);

create table if not exists public.ads (
  id text primary key,
  title text not null,
  body text not null default '',
  href text not null default '/',
  placement text not null check (placement in ('home', 'learn', 'shop', 'master')),
  active boolean not null default true
);

create table if not exists public.analytics_events (
  id text primary key,
  name text not null,
  source text not null default 'direct',
  path text not null default '/',
  meta text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);

create table if not exists public.discovered_cities (
  city text primary key,
  created_at timestamptz not null default now()
);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists shops_set_updated_at on public.shops;
create trigger shops_set_updated_at
  before update on public.shops
  for each row execute function public.set_updated_at();

create or replace function public.clear_app_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  truncate table
    public.analytics_events,
    public.review_reports,
    public.claims,
    public.reviews,
    public.products,
    public.courses,
    public.ads,
    public.discovered_cities,
    public.shops,
    public.users
  cascade;
end;
$$;

revoke all on function public.clear_app_data() from public;
revoke all on function public.clear_app_data() from anon, authenticated;
grant execute on function public.clear_app_data() to service_role;

alter table public.users enable row level security;
alter table public.shops enable row level security;
alter table public.reviews enable row level security;
alter table public.review_reports enable row level security;
alter table public.claims enable row level security;
alter table public.products enable row level security;
alter table public.courses enable row level security;
alter table public.ads enable row level security;
alter table public.analytics_events enable row level security;
alter table public.discovered_cities enable row level security;

drop policy if exists "public read shops" on public.shops;
create policy "public read shops" on public.shops
  for select using (true);

drop policy if exists "public read published reviews" on public.reviews;
create policy "public read published reviews" on public.reviews
  for select using (status = 'published');

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

drop policy if exists "public read courses" on public.courses;
create policy "public read courses" on public.courses
  for select using (true);

drop policy if exists "public read active ads" on public.ads;
create policy "public read active ads" on public.ads
  for select using (active = true);

-- Writes and private rows (users, pending reviews, reports, claims, events)
-- go through the Next.js server using the service role key, which bypasses RLS.
