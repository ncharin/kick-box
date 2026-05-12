-- =========================================================
-- MIGRATION 02 — Profils utilisateurs
-- =========================================================

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (length(username) between 3 and 24),
  display_name text,
  bio text check (length(bio) <= 280),
  avatar_url text,
  favorite_team_id integer references teams,
  matches_logged_count integer default 0,
  followers_count integer default 0,
  following_count integer default 0,
  created_at timestamptz default now()
);

-- =========================================================
-- RLS — Profils
-- =========================================================
alter table profiles enable row level security;

create policy "Lecture publique profils" on profiles
  for select using (true);

create policy "Modification par le owner" on profiles
  for update using (auth.uid() = id);

-- =========================================================
-- TRIGGER — Création automatique du profil à l'inscription
-- =========================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    -- username généré depuis l'email (partie avant @), rendu unique avec les 6 derniers chars de l'id
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'))
      || '_' || substring(new.id::text, 1, 6),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
