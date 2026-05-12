-- =========================================================
-- MIGRATION 03 — Actions utilisateur (reviews, diary, watchlist, social)
-- =========================================================

create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  match_id integer not null references matches,
  content text not null check (length(content) <= 5000),
  rating numeric(2,1) check (rating between 0.5 and 5),
  contains_spoilers boolean default false,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on reviews (user_id, created_at desc);
create index on reviews (match_id, created_at desc);

create table diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  match_id integer not null references matches,
  watched_on date not null default current_date,
  rating numeric(2,1) check (rating between 0.5 and 5),
  review_id uuid references reviews on delete set null,
  is_rewatch boolean default false,
  created_at timestamptz default now()
);
create index on diary_entries (user_id, watched_on desc);
create unique index on diary_entries (user_id, match_id) where is_rewatch = false;

create table watchlist (
  user_id uuid references profiles on delete cascade,
  match_id integer references matches,
  added_at timestamptz default now(),
  primary key (user_id, match_id)
);

create table follows (
  follower_id uuid references profiles on delete cascade,
  following_id uuid references profiles on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table review_likes (
  user_id uuid references profiles on delete cascade,
  review_id uuid references reviews on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, review_id)
);

create table review_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  review_id uuid references reviews on delete cascade,
  content text not null check (length(content) <= 1000),
  created_at timestamptz default now()
);

-- =========================================================
-- RLS — Actions utilisateur
-- =========================================================
alter table reviews enable row level security;
alter table diary_entries enable row level security;
alter table watchlist enable row level security;
alter table follows enable row level security;
alter table review_likes enable row level security;
alter table review_comments enable row level security;

-- Reviews
create policy "Lecture publique reviews" on reviews for select using (true);
create policy "Création par owner" on reviews for insert with check (auth.uid() = user_id);
create policy "Modification par owner" on reviews for update using (auth.uid() = user_id);
create policy "Suppression par owner" on reviews for delete using (auth.uid() = user_id);

-- Diary
create policy "Lecture publique diary" on diary_entries for select using (true);
create policy "Création diary par owner" on diary_entries for insert with check (auth.uid() = user_id);
create policy "Modification diary par owner" on diary_entries for update using (auth.uid() = user_id);
create policy "Suppression diary par owner" on diary_entries for delete using (auth.uid() = user_id);

-- Watchlist
create policy "Lecture publique watchlist" on watchlist for select using (true);
create policy "Création watchlist par owner" on watchlist for insert with check (auth.uid() = user_id);
create policy "Suppression watchlist par owner" on watchlist for delete using (auth.uid() = user_id);

-- Follows
create policy "Lecture publique follows" on follows for select using (true);
create policy "Création follows par owner" on follows for insert with check (auth.uid() = follower_id);
create policy "Suppression follows par owner" on follows for delete using (auth.uid() = follower_id);

-- Likes
create policy "Lecture publique likes" on review_likes for select using (true);
create policy "Création like par owner" on review_likes for insert with check (auth.uid() = user_id);
create policy "Suppression like par owner" on review_likes for delete using (auth.uid() = user_id);

-- Comments
create policy "Lecture publique comments" on review_comments for select using (true);
create policy "Création comment par owner" on review_comments for insert with check (auth.uid() = user_id);
create policy "Suppression comment par owner" on review_comments for delete using (auth.uid() = user_id);

-- =========================================================
-- TRIGGERS — Dénormalisation des compteurs
-- =========================================================

-- matches_logged_count sur profiles
create or replace function update_matches_logged_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update profiles set matches_logged_count = matches_logged_count + 1 where id = new.user_id;
  elsif tg_op = 'DELETE' then
    update profiles set matches_logged_count = greatest(0, matches_logged_count - 1) where id = old.user_id;
  end if;
  return null;
end;
$$;

create trigger trg_diary_count
  after insert or delete on diary_entries
  for each row execute procedure update_matches_logged_count();

-- followers_count / following_count sur profiles
create or replace function update_follow_counts()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update profiles set followers_count = followers_count + 1 where id = new.following_id;
    update profiles set following_count = following_count + 1 where id = new.follower_id;
  elsif tg_op = 'DELETE' then
    update profiles set followers_count = greatest(0, followers_count - 1) where id = old.following_id;
    update profiles set following_count = greatest(0, following_count - 1) where id = old.follower_id;
  end if;
  return null;
end;
$$;

create trigger trg_follow_counts
  after insert or delete on follows
  for each row execute procedure update_follow_counts();

-- likes_count sur reviews
create or replace function update_review_likes_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update reviews set likes_count = likes_count + 1 where id = new.review_id;
  elsif tg_op = 'DELETE' then
    update reviews set likes_count = greatest(0, likes_count - 1) where id = old.review_id;
  end if;
  return null;
end;
$$;

create trigger trg_review_likes_count
  after insert or delete on review_likes
  for each row execute procedure update_review_likes_count();

-- comments_count sur reviews
create or replace function update_review_comments_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update reviews set comments_count = comments_count + 1 where id = new.review_id;
  elsif tg_op = 'DELETE' then
    update reviews set comments_count = greatest(0, comments_count - 1) where id = old.review_id;
  end if;
  return null;
end;
$$;

create trigger trg_review_comments_count
  after insert or delete on review_comments
  for each row execute procedure update_review_comments_count();
