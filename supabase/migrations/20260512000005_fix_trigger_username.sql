-- MIGRATION 05 — Amélioration du trigger signup : utilise le username des metadata si fourni

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_username text;
  v_display_name text;
begin
  -- Utilise le username passé dans metadata (signup email), sinon génère depuis l'email
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'))
      || '_' || substring(new.id::text, 1, 6)
  );

  -- Si le username généré est vide (email bizarre), fallback sur l'id
  if length(v_username) < 3 then
    v_username := 'user_' || substring(new.id::text, 1, 8);
  end if;

  v_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    v_username,
    v_display_name,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
