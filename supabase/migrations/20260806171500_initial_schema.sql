-- =====================================================
-- SUPABASE WORKSPACE TASK MANAGEMENT SYSTEM
-- UUID (internal) + PUBLIC_ID (starts at 1001)
-- Supports Subtasks via parent_task_id
-- =====================================================

-- Enable UUID generation
create extension if not exists pgcrypto;

-- =====================================================
-- ENUM TYPES
-- =====================================================

create type user_role as enum ('user', 'admin');

create type task_status as enum (
  'pending',
  'in_progress',
  'paused',
  'completed',
  'cancelled'
);

create type task_priority as enum (
  'low',
  'medium',
  'high',
  'critical'
);

-- =====================================================
-- USERS
-- =====================================================

create sequence users_public_id_seq start 1001;

create table public.users (
  id uuid primary key
    references auth.users(id) on delete cascade,

  public_id bigint unique default nextval('users_public_id_seq'),

  email text unique not null,
  role user_role default 'user',
  profile_img text,

  created_at timestamptz default now()
);

-- =====================================================
-- WORKSPACES
-- =====================================================

create sequence workspaces_public_id_seq start 1001;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),

  public_id bigint unique default nextval('workspaces_public_id_seq'),

  name text not null,

  owner_id uuid not null
    references public.users(id) on delete cascade,

  created_at timestamptz default now()
);

-- =====================================================
-- TASKS (with subtasks support)
-- =====================================================

create sequence tasks_public_id_seq start 1001;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  public_id bigint unique default nextval('tasks_public_id_seq'),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  user_id uuid not null
    references public.users(id) on delete cascade,

  parent_task_id uuid
    references public.tasks(id) on delete cascade,

  title text not null,
  description text,

  priority task_priority default 'medium',
  status task_status default 'pending',

  position integer,

  goal_time_minutes integer,
  actual_time_minutes integer,

  started_at timestamptz,
  completed_at timestamptz,
  due_date timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_tasks_updated_at
before update on public.tasks
for each row
execute function update_updated_at_column();

-- =====================================================
-- AUDIT LOGS
-- =====================================================

create sequence audit_logs_id_seq start 1001;

create table public.audit_logs (
  id bigint primary key default nextval('audit_logs_id_seq'),

  user_id uuid
    references public.users(id) on delete set null,

  action text not null,
  table_name text not null,
  record_id uuid,

  old_data jsonb,
  new_data jsonb,

  created_at timestamptz default now()
);

-- =====================================================
-- USER MUSIC PREFERENCES
-- =====================================================

create table public.user_music_preferences (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null
    references public.users(id) on delete cascade,
  
  playlist_url text not null,
  playlist_name text not null,
  platform text default 'spotify',
  cover_image text,
  
  is_active boolean default false,
  volume integer default 50,
  autoplay boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- BREAK TIME / FREE TIME
-- =====================================================

create type break_status as enum (
  'available',
  'active',
  'used'
);

create sequence break_time_public_id_seq start 1001;

create table public.break_time (
  id uuid primary key default gen_random_uuid(),

  public_id bigint unique default nextval('break_time_public_id_seq'),

  user_id uuid not null
    references public.users(id) on delete cascade,

  task_id uuid not null
    references public.tasks(id) on delete cascade,

  earned_minutes integer not null default 5,
  remaining_minutes integer not null default 5,

  status break_status default 'available',

  activated_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- DIARY ENTRIES
-- =====================================================

create sequence diary_entries_public_id_seq start 1001;

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),

  public_id bigint unique default nextval('diary_entries_public_id_seq'),

  user_id uuid not null
    references public.users(id) on delete cascade,

  title text not null,
  content text,

  cover_image text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Updated at trigger
create trigger update_diary_entries_updated_at
before update on public.diary_entries
for each row
execute function update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================

create index idx_tasks_user on public.tasks(user_id);
create index idx_tasks_workspace on public.tasks(workspace_id);
create index idx_tasks_parent on public.tasks(parent_task_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_priority on public.tasks(priority);
create index idx_tasks_workspace_status
  on public.tasks(workspace_id, status);

create index idx_audit_user on public.audit_logs(user_id);

create index idx_user_music_user on public.user_music_preferences(user_id);
create unique index idx_user_music_active_platform 
  on public.user_music_preferences(user_id, platform) 
  where is_active = true;

create index idx_break_time_user on public.break_time(user_id);
create index idx_break_time_task on public.break_time(task_id);
create index idx_break_time_status on public.break_time(status);
create index idx_break_time_user_status 
  on public.break_time(user_id, status);

create index idx_diary_entries_user on public.diary_entries(user_id);
create index idx_diary_entries_created
  on public.diary_entries(user_id, created_at desc);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.users enable row level security;
alter table public.workspaces enable row level security;
alter table public.tasks enable row level security;
alter table public.user_music_preferences enable row level security;

-- Users can manage their own profile
create policy "Users can manage their own profile"
on public.users
for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- Users can manage their own workspaces
create policy "Users can manage their own workspaces"
on public.workspaces
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- Users can manage their own tasks
create policy "Users can manage their own tasks"
on public.tasks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can manage their own music preferences
create policy "Users can manage their own music preferences"
on public.user_music_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =====================================================
-- BREAK TIME RLS
-- =====================================================

alter table public.break_time enable row level security;

-- Users can manage their own break time
create policy "Users can manage their own break time"
on public.break_time
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =====================================================
-- DIARY ENTRIES RLS
-- =====================================================

alter table public.diary_entries enable row level security;

-- Users can manage their own diary entries
create policy "Users can manage their own diary entries"
on public.diary_entries
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
