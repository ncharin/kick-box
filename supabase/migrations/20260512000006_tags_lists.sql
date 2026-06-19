-- =========================================================
-- MIGRATION 06 — Tags & Listes (remplace le schéma de la migration 04)
-- =========================================================

-- Suppression de l'ancien schéma (migration 04)
drop table if exists review_tags cascade;
drop table if exists list_matches cascade;
drop table if exists lists cascade;
drop table if exists tags cascade;
drop table if exists match_tags cascade;

-- =========================================================
-- Tags prédéfinis pour qualifier un match
-- =========================================================
create table tags (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  emoji text not null default '🏷️'
);

insert into tags (name, slug, emoji) values
  ('Beau jeu', 'beau-jeu', '✨'),
  ('Remontada', 'remontada', '🔥'),
  ('Drama', 'drama', '🎭'),
  ('Penalty drama', 'penalty-drama', '🎯'),
  ('Clasico', 'clasico', '⚔️'),
  ('But de légende', 'but-de-legende', '💫'),
  ('Carton rouge', 'carton-rouge', '🟥'),
  ('Nul surprise', 'nul-surprise', '😮'),
  ('Décisif', 'decisif', '🏆'),
  ('Ennuyeux', 'ennuyeux', '😴'),
  ('Ambiance incroyable', 'ambiance-incroyable', '📢'),
  ('Thriller', 'thriller', '😰');

-- Association utilisateur × match × tag
create table match_tags (
  user_id uuid references profiles on delete cascade,
  match_id integer references matches on delete cascade,
  tag_id integer references tags on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, match_id, tag_id)
);
create index on match_tags (match_id, tag_id);

-- =========================================================
-- Listes de matchs
-- =========================================================
create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  name text not null check (length(name) between 1 and 100),
  description text check (length(description) <= 500),
  is_public boolean default true,
  matches_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on lists (user_id, updated_at desc);

create table list_matches (
  list_id uuid references lists on delete cascade,
  match_id integer references matches on delete cascade,
  notes text check (length(notes) <= 280),
  position integer default 0,
  added_at timestamptz default now(),
  primary key (list_id, match_id)
);
create index on list_matches (list_id, position);

-- =========================================================
-- RLS
-- =========================================================
alter table tags enable row level security;
alter table match_tags enable row level security;
alter table lists enable row level security;
alter table list_matches enable row level security;

create policy "Lecture publique tags" on tags for select using (true);

create policy "Lecture publique match_tags" on match_tags for select using (true);
create policy "Création match_tags par owner" on match_tags for insert with check (auth.uid() = user_id);
create policy "Suppression match_tags par owner" on match_tags for delete using (auth.uid() = user_id);

create policy "Lecture listes publiques" on lists for select using (is_public or auth.uid() = user_id);
create policy "Création liste par owner" on lists for insert with check (auth.uid() = user_id);
create policy "Modification liste par owner" on lists for update using (auth.uid() = user_id);
create policy "Suppression liste par owner" on lists for delete using (auth.uid() = user_id);

create policy "Lecture list_matches" on list_matches for select using (
  exists (select 1 from lists l where l.id = list_id and (l.is_public or l.user_id = auth.uid()))
);
create policy "Ajout list_matches par owner" on list_matches for insert with check (
  exists (select 1 from lists l where l.id = list_id and l.user_id = auth.uid())
);
create policy "Suppression list_matches par owner" on list_matches for delete using (
  exists (select 1 from lists l where l.id = list_id and l.user_id = auth.uid())
);

-- =========================================================
-- TRIGGER — matches_count sur lists
-- =========================================================
create or replace function update_list_matches_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update lists set matches_count = matches_count + 1, updated_at = now() where id = new.list_id;
  elsif tg_op = 'DELETE' then
    update lists set matches_count = greatest(0, matches_count - 1), updated_at = now() where id = old.list_id;
  end if;
  return null;
end;
$$;

create trigger trg_list_matches_count
  after insert or delete on list_matches
  for each row execute procedure update_list_matches_count();

-- =========================================================
-- Storage — bucket avatars
-- =========================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars publics" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Upload avatar par owner" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Mise à jour avatar par owner" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Suppression avatar par owner" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
