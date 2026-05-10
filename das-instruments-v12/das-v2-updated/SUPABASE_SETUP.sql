-- ═══════════════════════════════════════════════════════════════════
--  DAS Instruments — Supabase Database Setup
--
--  INSTRUCTIONS:
--  1. Go to your Supabase project → SQL Editor
--  2. Paste this entire file and click "Run"
--  3. Done — your tables are ready!
-- ═══════════════════════════════════════════════════════════════════

-- ── Orders table ─────────────────────────────────────────────────
create table if not exists das_orders (
  id               text primary key,
  customer_name    text not null,
  customer_email   text not null,
  phone            text default '',
  company          text default '',
  items            jsonb default '[]',
  subtotal         numeric(12,2) default 0,
  gst_amount       numeric(12,2) default 0,
  grand_total      numeric(12,2) default 0,
  shipping_address text default '',
  gst_number       text default '',
  payment_method   text default 'neft',
  payment_id       text,
  status           text default 'pending',
  order_date       text not null,
  customer_id      text,
  created_at       timestamptz default now()
);

-- ── Customers table ───────────────────────────────────────────────
create table if not exists das_customers (
  id            text primary key,
  name          text not null,
  email         text not null unique,
  phone         text default '',
  company       text default '',
  password_hash text not null,
  address       text default '',
  city          text default '',
  state         text default '',
  pincode       text default '',
  gst           text default '',
  created_at    timestamptz default now()
);

-- ── Indexes for fast lookups ──────────────────────────────────────
create index if not exists idx_das_orders_email      on das_orders(customer_email);
create index if not exists idx_das_orders_customer   on das_orders(customer_id);
create index if not exists idx_das_orders_status     on das_orders(status);
create index if not exists idx_das_orders_created    on das_orders(created_at desc);
create index if not exists idx_das_customers_email   on das_customers(email);

-- ── Row Level Security — allow anon reads/writes via API key ─────
alter table das_orders    enable row level security;
alter table das_customers enable row level security;

-- Allow all operations using the anon key (your API key controls access)
create policy if not exists "anon full access orders"
  on das_orders for all using (true) with check (true);

create policy if not exists "anon full access customers"
  on das_customers for all using (true) with check (true);

-- ── Done! ─────────────────────────────────────────────────────────
-- Your DAS Instruments database is ready.
-- Orders and customers will now be stored permanently in the cloud.
