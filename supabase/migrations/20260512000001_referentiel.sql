-- =========================================================
-- MIGRATION 01 — Référentiel foot (teams, competitions, matches)
-- =========================================================

create table teams (
  id serial primary key,
  api_id integer unique not null,
  name text not null,
  short_name text,
  country text,
  logo_url text,
  type text check (type in ('club','national')) default 'club',
  founded integer,
  created_at timestamptz default now()
);
create index on teams (name);
create index on teams (country);

create table competitions (
  id serial primary key,
  api_id integer unique not null,
  name text not null,
  country text,
  logo_url text,
  type text check (type in ('league','cup','international')),
  tier integer,
  created_at timestamptz default now()
);

create table matches (
  id serial primary key,
  api_id integer unique not null,
  competition_id integer references competitions,
  season text,
  matchday text,
  kickoff timestamptz not null,
  status text default 'scheduled' check (status in ('scheduled','live','finished','postponed')),
  home_team_id integer references teams,
  away_team_id integer references teams,
  home_score integer,
  away_score integer,
  home_score_ht integer,
  away_score_ht integer,
  venue text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on matches (kickoff desc);
create index on matches (home_team_id);
create index on matches (away_team_id);
create index on matches (competition_id, season);
create index on matches (status);

-- Suivi des appels API
create table api_sync_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  endpoint text not null,
  status integer,
  items_synced integer default 0,
  error text
);

-- =========================================================
-- RLS — Référentiel : lecture publique, écriture service role
-- =========================================================
alter table teams enable row level security;
alter table competitions enable row level security;
alter table matches enable row level security;
alter table api_sync_logs enable row level security;

create policy "Lecture publique teams" on teams for select using (true);
create policy "Lecture publique competitions" on competitions for select using (true);
create policy "Lecture publique matches" on matches for select using (true);
create policy "Lecture publique api_sync_logs" on api_sync_logs for select using (true);
