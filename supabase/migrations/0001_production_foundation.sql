-- FlipGauge production foundation
-- PostgreSQL / Supabase migration 0001
-- Run in Supabase SQL Editor or with Supabase CLI.

create extension if not exists pgcrypto;

create type public.member_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.recommendation_type as enum ('buy', 'review', 'pass');
create type public.alert_metric as enum ('price', 'profit', 'roi', 'seller_count', 'sales_rank');
create type public.alert_operator as enum ('above', 'below');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_marketplace text not null default 'US',
  target_roi numeric(7,2) not null default 35,
  target_profit numeric(10,2) not null default 5,
  default_tax_rate numeric(7,4) not null default 0,
  prep_cost numeric(10,2) not null default 0,
  inbound_shipping_cost numeric(10,2) not null default 0,
  include_sales_tax boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  asin text,
  upc text,
  ean text,
  marketplace text not null default 'US',
  title text not null,
  brand text,
  image_url text,
  category text,
  is_hazmat boolean,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_identifier_required check (
    asin is not null or upc is not null or ean is not null
  )
);

create unique index products_asin_marketplace_unique
  on public.products (asin, marketplace) where asin is not null;
create index products_upc_idx on public.products(upc) where upc is not null;
create index products_ean_idx on public.products(ean) where ean is not null;

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  identifier_entered text not null,
  marketplace text not null default 'US',
  buy_cost numeric(10,2) not null check (buy_cost >= 0),
  sell_price numeric(10,2),
  estimated_fees numeric(10,2),
  estimated_profit numeric(10,2),
  roi_percent numeric(8,2),
  margin_percent numeric(8,2),
  recommendation public.recommendation_type,
  recommendation_confidence numeric(5,4)
    check (recommendation_confidence between 0 and 1),
  evidence jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  raw_provider_snapshot jsonb,
  calculation_version text not null default 'profit-v1',
  scanned_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index scans_user_time_idx on public.scans(user_id, scanned_at desc);
create index scans_org_time_idx on public.scans(organization_id, scanned_at desc)
  where organization_id is not null;
create index scans_product_idx on public.scans(product_id);

create table public.price_history (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  marketplace text not null default 'US',
  captured_at timestamptz not null,
  buy_box_price numeric(10,2),
  lowest_fba_price numeric(10,2),
  amazon_price numeric(10,2),
  sales_rank integer,
  seller_count integer,
  source text not null,
  source_record_id text,
  created_at timestamptz not null default now()
);

create index price_history_product_time_idx
  on public.price_history(product_id, captured_at desc);

create table public.buy_lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.buy_list_items (
  id uuid primary key default gen_random_uuid(),
  buy_list_id uuid not null references public.buy_lists(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete set null,
  product_id uuid not null references public.products(id),
  target_quantity integer not null default 1 check (target_quantity > 0),
  target_buy_cost numeric(10,2),
  notes text,
  purchased_at timestamptz,
  created_at timestamptz not null default now()
);

create index buy_list_items_list_idx on public.buy_list_items(buy_list_id);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  metric public.alert_metric not null,
  operator public.alert_operator not null,
  threshold numeric(12,2) not null,
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index alerts_user_active_idx on public.alerts(user_id, is_active);
create index alerts_product_idx on public.alerts(product_id);

create table public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_account_id text,
  status text not null default 'pending',
  encrypted_credentials_reference text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  resource_type text,
  resource_id text,
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index audit_events_user_time_idx
  on public.audit_events(user_id, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations
for each row execute function public.set_updated_at();
create trigger user_settings_updated_at before update on public.user_settings
for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger buy_lists_updated_at before update on public.buy_lists
for each row execute function public.set_updated_at();
create trigger alerts_updated_at before update on public.alerts
for each row execute function public.set_updated_at();
create trigger provider_connections_updated_at before update on public.provider_connections
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.created_by, 'owner');

  return new;
end;
$$;

create trigger on_organization_created
after insert on public.organizations
for each row execute function public.handle_new_organization();

create or replace function public.is_organization_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_org
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_organization_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_org
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.user_settings enable row level security;
alter table public.products enable row level security;
alter table public.scans enable row level security;
alter table public.price_history enable row level security;
alter table public.buy_lists enable row level security;
alter table public.buy_list_items enable row level security;
alter table public.alerts enable row level security;
alter table public.provider_connections enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "settings_own_all"
on public.user_settings for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "organizations_select_member"
on public.organizations for select
to authenticated
using ((select public.is_organization_member(id)));

create policy "organizations_insert_authenticated"
on public.organizations for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy "organizations_update_admin"
on public.organizations for update
to authenticated
using ((select public.is_organization_admin(id)))
with check ((select public.is_organization_admin(id)));

create policy "organization_members_select_member"
on public.organization_members for select
to authenticated
using ((select public.is_organization_member(organization_id)));

create policy "organization_members_manage_admin"
on public.organization_members for all
to authenticated
using ((select public.is_organization_admin(organization_id)))
with check ((select public.is_organization_admin(organization_id)));

create policy "products_read_authenticated"
on public.products for select
to authenticated
using (true);

create policy "scans_select_owned_or_org"
on public.scans for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (
    organization_id is not null
    and (select public.is_organization_member(organization_id))
  )
);

create policy "scans_insert_own"
on public.scans for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    organization_id is null
    or (select public.is_organization_member(organization_id))
  )
);

create policy "scans_update_owned_or_org_admin"
on public.scans for update
to authenticated
using (
  (select auth.uid()) = user_id
  or (
    organization_id is not null
    and (select public.is_organization_admin(organization_id))
  )
)
with check (
  (select auth.uid()) = user_id
  or (
    organization_id is not null
    and (select public.is_organization_admin(organization_id))
  )
);

create policy "scans_delete_owned_or_org_admin"
on public.scans for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or (
    organization_id is not null
    and (select public.is_organization_admin(organization_id))
  )
);

create policy "price_history_read_authenticated"
on public.price_history for select
to authenticated
using (true);

create policy "buy_lists_own_or_org"
on public.buy_lists for all
to authenticated
using (
  (select auth.uid()) = user_id
  or (
    organization_id is not null
    and (select public.is_organization_member(organization_id))
  )
)
with check (
  (select auth.uid()) = user_id
  and (
    organization_id is null
    or (select public.is_organization_member(organization_id))
  )
);

create policy "buy_list_items_through_list"
on public.buy_list_items for all
to authenticated
using (
  exists (
    select 1 from public.buy_lists
    where buy_lists.id = buy_list_items.buy_list_id
      and (
        buy_lists.user_id = (select auth.uid())
        or (
          buy_lists.organization_id is not null
          and (select public.is_organization_member(buy_lists.organization_id))
        )
      )
  )
)
with check (
  exists (
    select 1 from public.buy_lists
    where buy_lists.id = buy_list_items.buy_list_id
      and buy_lists.user_id = (select auth.uid())
  )
);

create policy "alerts_own_or_org"
on public.alerts for all
to authenticated
using (
  (select auth.uid()) = user_id
  or (
    organization_id is not null
    and (select public.is_organization_member(organization_id))
  )
)
with check (
  (select auth.uid()) = user_id
  and (
    organization_id is null
    or (select public.is_organization_member(organization_id))
  )
);

create policy "provider_connections_own"
on public.provider_connections for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "provider_connections_insert_own"
on public.provider_connections for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "provider_connections_update_own"
on public.provider_connections for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "audit_events_select_own_or_org_admin"
on public.audit_events for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (
    organization_id is not null
    and (select public.is_organization_admin(organization_id))
  )
);

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant all on public.organizations to authenticated;
grant all on public.organization_members to authenticated;
grant all on public.user_settings to authenticated;
grant select on public.products to authenticated;
grant all on public.scans to authenticated;
grant select on public.price_history to authenticated;
grant all on public.buy_lists to authenticated;
grant all on public.buy_list_items to authenticated;
grant all on public.alerts to authenticated;
grant select, insert, update on public.provider_connections to authenticated;
grant select on public.audit_events to authenticated;
grant usage, select on all sequences in schema public to authenticated;
