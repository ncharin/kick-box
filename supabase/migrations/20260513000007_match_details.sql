-- =========================================================
-- MIGRATION 07 — Détails de match (buts, cartons, remplacements, arbitre)
-- =========================================================

alter table matches
  add column if not exists referee text,
  add column if not exists goals jsonb default '[]',
  add column if not exists bookings jsonb default '[]',
  add column if not exists substitutions jsonb default '[]',
  add column if not exists details_fetched_at timestamptz;
