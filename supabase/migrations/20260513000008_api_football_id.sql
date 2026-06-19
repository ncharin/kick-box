-- MIGRATION 08 — Ajout de l'ID API-Football sur les matchs (pour les détails)
alter table matches add column if not exists api_football_id integer;
create index if not exists on matches (api_football_id);
