-- Точка опоры v15.6
-- Публичная страница психолога + безопасная форма первого обращения.
-- Выполнить один раз в Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.tochka_public_profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,48}$'),
  display_name text not null check (char_length(display_name) between 2 and 120),
  professional_title text not null default 'Психолог' check (char_length(professional_title) <= 160),
  about text not null default '' check (char_length(about) <= 1200),
  location text not null default '' check (char_length(location) <= 160),
  formats text not null default '' check (char_length(formats) <= 240),
  published boolean not null default true,
  accepts_inquiries boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tochka_public_inquiries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '' check (char_length(name) <= 100),
  contact text not null check (char_length(contact) between 3 and 180),
  topic text not null default 'other' check (char_length(topic) <= 60),
  message text not null check (char_length(message) between 10 and 1800),
  preferred_contact text not null default '' check (char_length(preferred_contact) <= 120),
  status text not null default 'new' check (status in ('new','accepted','closed')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

alter table public.tochka_public_profiles enable row level security;
alter table public.tochka_public_inquiries enable row level security;

drop policy if exists "public profiles are readable" on public.tochka_public_profiles;
create policy "public profiles are readable"
on public.tochka_public_profiles for select
using (published = true or auth.uid() = owner_id);

drop policy if exists "owner inserts own public profile" on public.tochka_public_profiles;
create policy "owner inserts own public profile"
on public.tochka_public_profiles for insert to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "owner updates own public profile" on public.tochka_public_profiles;
create policy "owner updates own public profile"
on public.tochka_public_profiles for update to authenticated
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "owner deletes own public profile" on public.tochka_public_profiles;
create policy "owner deletes own public profile"
on public.tochka_public_profiles for delete to authenticated
using (auth.uid() = owner_id);

drop policy if exists "owner reads own inquiries" on public.tochka_public_inquiries;
create policy "owner reads own inquiries"
on public.tochka_public_inquiries for select to authenticated
using (auth.uid() = owner_id);

drop policy if exists "owner updates own inquiries" on public.tochka_public_inquiries;
create policy "owner updates own inquiries"
on public.tochka_public_inquiries for update to authenticated
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "owner deletes own inquiries" on public.tochka_public_inquiries;
create policy "owner deletes own inquiries"
on public.tochka_public_inquiries for delete to authenticated
using (auth.uid() = owner_id);

create or replace function public.tochka_submit_public_inquiry(
  p_slug text,
  p_name text,
  p_contact text,
  p_topic text,
  p_message text,
  p_preferred_contact text default ''
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_owner uuid;
  v_id uuid;
begin
  if char_length(trim(coalesce(p_contact,''))) < 3 then
    raise exception 'Укажите контакт для ответа';
  end if;
  if char_length(trim(coalesce(p_message,''))) < 10 then
    raise exception 'Опишите ситуацию чуть подробнее';
  end if;
  if char_length(coalesce(p_message,'')) > 1800 then
    raise exception 'Сообщение слишком длинное';
  end if;

  select owner_id into v_owner
  from public.tochka_public_profiles
  where slug = lower(trim(p_slug)) and published = true and accepts_inquiries = true
  limit 1;

  if v_owner is null then
    raise exception 'Психолог сейчас не принимает новые обращения через форму';
  end if;

  insert into public.tochka_public_inquiries(owner_id,name,contact,topic,message,preferred_contact)
  values (
    v_owner,
    left(trim(coalesce(p_name,'')),100),
    left(trim(p_contact),180),
    left(trim(coalesce(p_topic,'other')),60),
    left(trim(p_message),1800),
    left(trim(coalesce(p_preferred_contact,'')),120)
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.tochka_submit_public_inquiry(text,text,text,text,text,text) from public;
grant execute on function public.tochka_submit_public_inquiry(text,text,text,text,text,text) to anon, authenticated;

grant select on public.tochka_public_profiles to anon, authenticated;
grant insert, update, delete on public.tochka_public_profiles to authenticated;
grant select, update, delete on public.tochka_public_inquiries to authenticated;
