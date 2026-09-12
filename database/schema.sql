-- ============================================================================
-- EYAZO — DATABASE SCHEMA (PostgreSQL / Supabase)
-- يطبق فقط الجداول والحالات المذكورة في مواصفات EYAZO. لا تضف جداول أو أعمدة
-- غير موجودة هنا دون الرجوع للمواصفات.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type user_role as enum ('CLIENT', 'FREELANCER', 'ADMIN');
create type verification_status as enum ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

create type service_status as enum ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'REJECTED');
create type project_status as enum ('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'CLOSED');
create type proposal_status as enum ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

create type order_status as enum (
  'PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'REVISION_REQUESTED',
  'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED'
);

create type favorite_target as enum ('SERVICE', 'FREELANCER', 'PROJECT');

create type notification_type as enum (
  'NEW_MESSAGE', 'NEW_ORDER', 'PAYMENT_CONFIRMED', 'NEW_PROPOSAL', 'PROPOSAL_ACCEPTED',
  'PROPOSAL_REJECTED', 'DELIVERY', 'REVISION_REQUESTED', 'ORDER_COMPLETED',
  'NEW_REVIEW', 'DISPUTE_UPDATE'
);

create type report_target as enum ('USER', 'SERVICE', 'PROJECT', 'MESSAGE', 'REVIEW');
create type report_status as enum ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

create type dispute_status as enum ('OPEN', 'UNDER_REVIEW', 'WAITING_FOR_USER', 'RESOLVED', 'REJECTED');

create type payment_status as enum ('PENDING_MANUAL_CONFIRMATION', 'APPROVED', 'REJECTED');
create type payout_status as enum ('PENDING', 'PAID');

-- ---------------------------------------------------------------------------
-- USERS & PROFILES
-- profiles تمتد auth.users (Supabase Auth) بعلاقة 1:1
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text not null unique,
  role user_role not null default 'CLIENT',
  avatar_url text,
  bio text,
  country text,
  languages text[] default '{}',
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,30}$')
);

create table freelancer_profiles (
  profile_id uuid primary key references profiles(id) on delete cascade,
  job_title text,
  experience_level text,
  starting_price numeric(12,2),
  skills text[] default '{}',
  verification_status verification_status not null default 'UNVERIFIED',
  completed_orders_count integer not null default 0,
  response_rate numeric(5,2),
  on_time_delivery_rate numeric(5,2),
  rating_average numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table portfolio_items (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references freelancer_profiles(profile_id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  parent_id uuid references categories(id) on delete set null,
  is_disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SERVICES
-- ---------------------------------------------------------------------------
create table services (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references freelancer_profiles(profile_id) on delete cascade,
  category_id uuid not null references categories(id),
  title text not null,
  slug text not null unique,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  delivery_days integer not null check (delivery_days > 0),
  revisions integer not null default 0 check (revisions >= 0),
  tags text[] default '{}',
  status service_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_services_status on services(status);
create index idx_services_category on services(category_id);
create index idx_services_price on services(price);

create table service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- PROJECTS
-- ---------------------------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id),
  title text not null,
  description text not null,
  required_skills text[] default '{}',
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  deadline date,
  status project_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_valid check (budget_max is null or budget_min is null or budget_max >= budget_min)
);
create index idx_projects_status on projects(status);
create index idx_projects_category on projects(category_id);

create table project_attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  storage_path text not null,
  file_name text not null
);

-- ---------------------------------------------------------------------------
-- PROPOSALS
-- ---------------------------------------------------------------------------
create table proposals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  freelancer_id uuid not null references freelancer_profiles(profile_id) on delete cascade,
  message text not null,
  price numeric(12,2) not null check (price >= 0),
  delivery_days integer not null check (delivery_days > 0),
  status proposal_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, freelancer_id)
);
create index idx_proposals_project on proposals(project_id);

-- ---------------------------------------------------------------------------
-- PLATFORM SETTINGS (single row) — العمولة والإعدادات تُقرأ من هنا فقط
-- ---------------------------------------------------------------------------
create table platform_settings (
  id boolean primary key default true constraint single_row check (id),
  platform_name text not null default 'EYAZO',
  logo_url text,
  commission_percentage numeric(5,2) not null default 10,
  minimum_order_amount numeric(12,2) not null default 0,
  maximum_file_size_mb integer not null default 20,
  maintenance_mode boolean not null default false,
  manual_payment_number text not null default '01203111554',
  whatsapp_support_number text not null default '01156389538',
  updated_at timestamptz not null default now()
);
insert into platform_settings (id) values (true);

-- ---------------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id),
  freelancer_id uuid not null references freelancer_profiles(profile_id),
  service_id uuid references services(id),
  project_id uuid references projects(id),
  proposal_id uuid references proposals(id),
  price numeric(12,2) not null check (price >= 0),
  platform_fee numeric(12,2) not null check (platform_fee >= 0),
  freelancer_earnings numeric(12,2) not null check (freelancer_earnings >= 0),
  revisions_remaining integer not null default 0,
  status order_status not null default 'PENDING_PAYMENT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_source check (service_id is not null or project_id is not null)
);
create index idx_orders_client on orders(client_id);
create index idx_orders_freelancer on orders(freelancer_id);
create index idx_orders_status on orders(status);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  event text not null,
  created_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  message text,
  created_at timestamptz not null default now()
);

create table delivery_files (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  storage_path text not null,
  file_name text not null
);

-- ---------------------------------------------------------------------------
-- FAVORITES
-- ---------------------------------------------------------------------------
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type favorite_target not null,
  service_id uuid references services(id) on delete cascade,
  freelancer_id uuid references freelancer_profiles(profile_id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, service_id, freelancer_id, project_id)
);

-- ---------------------------------------------------------------------------
-- MESSAGING
-- ---------------------------------------------------------------------------
create table conversations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  participant_one uuid not null references profiles(id),
  participant_two uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  constraint conversation_context check (order_id is not null or project_id is not null)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  content text not null,
  is_flagged boolean not null default false,
  flag_reason text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_messages_conversation on messages(conversation_id);

create table message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  storage_path text not null,
  file_name text not null
);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, is_read);

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  reviewee_id uuid not null references profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (order_id, reviewer_id)
);

-- ---------------------------------------------------------------------------
-- REPORTS
-- ---------------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id),
  target_type report_target not null,
  target_user_id uuid references profiles(id),
  target_service_id uuid references services(id),
  target_project_id uuid references projects(id),
  target_message_id uuid references messages(id),
  target_review_id uuid references reviews(id),
  reason text not null,
  description text,
  evidence_storage_path text,
  status report_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------------------------------------------------------------------------
-- DISPUTES
-- ---------------------------------------------------------------------------
create table disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  opened_by uuid not null references profiles(id),
  reason text not null,
  description text,
  evidence_storage_path text,
  status dispute_status not null default 'OPEN',
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------------------------------------------------------------------------
-- PAYMENTS / TRANSACTIONS / REFUNDS / PAYOUTS (Payment Abstraction Layer)
-- ---------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  method text not null default 'MANUAL_TRANSFER',
  transaction_reference text,
  proof_storage_path text,
  status payment_status not null default 'PENDING_MANUAL_CONFIRMATION',
  reviewed_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  payment_id uuid references payments(id),
  amount numeric(12,2) not null,
  type text not null, -- CHARGE | FEE | EARNING
  created_at timestamptz not null default now()
);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  dispute_id uuid references disputes(id),
  amount numeric(12,2) not null check (amount >= 0),
  processed_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  freelancer_id uuid not null references freelancer_profiles(profile_id),
  amount numeric(12,2) not null check (amount >= 0),
  status payout_status not null default 'PENDING',
  processed_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table platform_fees (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  percentage_applied numeric(5,2) not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- VERIFICATION REQUESTS
-- ---------------------------------------------------------------------------
create table verification_requests (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references freelancer_profiles(profile_id) on delete cascade,
  document_storage_path text,
  status verification_status not null default 'PENDING',
  reviewed_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- AUDIT LOG
-- ---------------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in select unnest(array[
    'profiles','freelancer_profiles','categories','services','projects',
    'proposals','orders','platform_settings'
  ]) loop
    execute format('create trigger trg_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;
