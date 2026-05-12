-- =========================================================
-- MIGRATION 04 — Listes thématiques + Tags (Phase 5)
-- =========================================================

create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  title text not null,
  slug text not null,
  description text,
  is_public boolean default true,
  is_ranked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, slug)
);

create table list_matches (
  list_id uuid references lists on delete cascade,
  match_id integer references matches,
  position integer,
  note text,
  added_at timestamptz default now(),
  primary key (list_id, match_id)
);

create table tags (
  id serial primary key,
  name text unique not null,
  slug text unique not null
);

create table review_tags (
  review_id uuid references reviews on delete cascade,
  tag_id integer references tags on delete cascade,
  primary key (review_id, tag_id)
);

-- Tags pré-remplis
insert into tags (name, slug) values
  ('Banger', 'banger'),
  ('Ennuyeux', 'ennuyeux'),
  ('Rebondissements', 'rebondissements'),
  ('Arbitrage', 'arbitrage'),
  ('Ambiance', 'ambiance'),
  ('But CSC', 'but-csc'),
  ('Remontada', 'remontada'),
  ('Claque', 'claque'),
  ('Derby', 'derby'),
  ('Finale folle', 'finale-folle'),
  ('But exceptionnel', 'but-exceptionnel'),
  ('Penalty décisif', 'penalty-decisif');

-- RLS
alter table lists enable row level security;
alter table list_matches enable row level security;
alter table tags enable row level security;
alter table review_tags enable row level security;

create policy "Lecture publique lists" on lists for select using (is_public = true or auth.uid() = user_id);
create policy "Création list par owner" on lists for insert with check (auth.uid() = user_id);
create policy "Modification list par owner" on lists for update using (auth.uid() = user_id);
create policy "Suppression list par owner" on lists for delete using (auth.uid() = user_id);

create policy "Lecture list_matches" on list_matches for select using (
  exists (select 1 from lists where id = list_id and (is_public = true or user_id = auth.uid()))
);
create policy "Modification list_matches par owner" on list_matches for insert with check (
  exists (select 1 from lists where id = list_id and user_id = auth.uid())
);
create policy "Suppression list_matches par owner" on list_matches for delete using (
  exists (select 1 from lists where id = list_id and user_id = auth.uid())
);

create policy "Lecture publique tags" on tags for select using (true);
create policy "Lecture publique review_tags" on review_tags for select using (true);
create policy "Création review_tag par owner" on review_tags for insert with check (
  exists (select 1 from reviews where id = review_id and user_id = auth.uid())
);
create policy "Suppression review_tag par owner" on review_tags for delete using (
  exists (select 1 from reviews where id = review_id and user_id = auth.uid())
);
